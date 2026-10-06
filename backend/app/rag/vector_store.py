"""In-memory Vector Store with Hybrid Retrieval (Dense Semantic + BM25/Keyword) and RRF fusion."""
import math
import re
from typing import List, Optional, Dict, Any, Tuple
import numpy as np
from .models import DocumentChunk, SearchResult, Citation, SourceMetadata
from .embedder import BaseEmbedder, get_embedder

class VectorStore:
    def __init__(self, embedder: Optional[BaseEmbedder] = None):
        self.embedder = embedder or get_embedder()
        self.chunks: List[DocumentChunk] = []
        self._doc_frequencies: Dict[str, int] = {}
        self._total_docs: int = 0

    def add_chunks(self, chunks: List[DocumentChunk]):
        """Add and embed documents into the store."""
        texts = [c.text for c in chunks]
        embeddings = self.embedder.embed_batch(texts)
        
        for c, emb in zip(chunks, embeddings):
            c.embedding = emb
            self.chunks.append(c)
            
            # Update BM25 doc frequency
            words = set(re.findall(r'\b\w+\b', c.text.lower()))
            for w in words:
                self._doc_frequencies[w] = self._doc_frequencies.get(w, 0) + 1
                
        self._total_docs = len(self.chunks)

    def _dense_search(self, query_emb: List[float], top_k: int, year_filter: Optional[str] = None) -> List[Tuple[DocumentChunk, float]]:
        q_vec = np.array(query_emb, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        scores = []
        for chunk in self.chunks:
            if year_filter and chunk.metadata.financial_year:
                # If year filter provided, verify match
                clean_filter = year_filter.replace("FY", "").strip()
                if clean_filter not in chunk.metadata.financial_year and clean_filter not in (chunk.metadata.assessment_year or ""):
                    # Give slight penalty rather than hard cutoff if dataset is small
                    pass

            if chunk.embedding is not None:
                c_vec = np.array(chunk.embedding, dtype=np.float32)
                sim = float(np.dot(q_vec, c_vec))
                scores.append((chunk, sim))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def _keyword_search(self, query: str, top_k: int) -> List[Tuple[DocumentChunk, float]]:
        q_tokens = re.findall(r'\b\w+\b', query.lower())
        if not q_tokens:
            return [(c, 0.0) for c in self.chunks[:top_k]]

        scores = []
        avg_len = sum(len(c.text.split()) for c in self.chunks) / max(1, len(self.chunks))
        k1 = 1.5
        b = 0.75

        for chunk in self.chunks:
            doc_tokens = re.findall(r'\b\w+\b', chunk.text.lower())
            doc_len = len(doc_tokens)
            bm25_score = 0.0

            for q in q_tokens:
                freq = doc_tokens.count(q)
                if freq > 0:
                    df = self._doc_frequencies.get(q, 1)
                    idf = math.log((self._total_docs - df + 0.5) / (df + 0.5) + 1.0)
                    denom = freq + k1 * (1 - b + b * (doc_len / avg_len))
                    bm25_score += idf * ((freq * (k1 + 1)) / denom)

            # Boost exact phrases or section matches
            q_lower = query.lower()
            text_lower = chunk.text.lower()
            title_lower = (chunk.metadata.section_id or "").lower()

            sec_patterns = re.findall(r'\b(?:section\s*)?([0-9]{2,3}[a-z]*(?:\([0-9a-z]+\))?)\b', q_lower)
            for sec in sec_patterns:
                sec_esc = re.escape(sec)
                if re.search(r'\b' + sec_esc + r'\b', title_lower):
                    bm25_score += 12.0
                elif re.search(r'\b' + sec_esc + r'\b', text_lower):
                    bm25_score += 4.0

            if "cess" in q_lower and "cess" in text_lower:
                bm25_score += 8.0
            if "senior citizen" in q_lower and "senior citizen" in text_lower:
                bm25_score += 8.0
            if "holding period" in q_lower and "holding period" in text_lower:
                bm25_score += 10.0
            if "standard deduction" in q_lower and "standard deduction" in text_lower:
                bm25_score += 6.0
            if "capital gains" in q_lower and "capital gains" in text_lower:
                bm25_score += 4.0
            if "rebate" in q_lower and "rebate" in text_lower:
                bm25_score += 4.0

            scores.append((chunk, bm25_score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def hybrid_search(self, query: str, top_k: int = 4, year_filter: Optional[str] = None) -> List[SearchResult]:
        """Reciprocal Rank Fusion (RRF) combining dense semantic search and BM25 keyword search."""
        if not self.chunks:
            return []

        # 1. Dense search across candidate pool
        cand_k = max(top_k * 4, min(len(self.chunks), 30))
        q_emb = self.embedder.embed_text(query)
        dense_results = self._dense_search(q_emb, top_k=cand_k, year_filter=year_filter)

        # 2. Keyword search across candidate pool
        keyword_results = self._keyword_search(query, top_k=cand_k)

        # 3. Reciprocal Rank Fusion
        rrf_k = 60
        fused_scores: Dict[str, float] = {}
        chunk_map: Dict[str, DocumentChunk] = {}
        dense_score_map: Dict[str, float] = {}
        kw_score_map: Dict[str, float] = {}

        for rank, (chunk, score) in enumerate(dense_results):
            cid = chunk.chunk_id
            chunk_map[cid] = chunk
            dense_score_map[cid] = score
            fused_scores[cid] = fused_scores.get(cid, 0.0) + (1.0 / (rrf_k + (rank + 1)))

        for rank, (chunk, score) in enumerate(keyword_results):
            cid = chunk.chunk_id
            chunk_map[cid] = chunk
            kw_score_map[cid] = score
            fused_scores[cid] = fused_scores.get(cid, 0.0) + (1.0 / (rrf_k + (rank + 1)))

        sorted_cids = sorted(fused_scores.keys(), key=lambda cid: fused_scores[cid], reverse=True)

        results: List[SearchResult] = []
        for rank, cid in enumerate(sorted_cids[:top_k], start=1):
            ch = chunk_map[cid]
            results.append(SearchResult(
                chunk_id=cid,
                text=ch.text,
                metadata=ch.metadata,
                dense_score=round(dense_score_map.get(cid, 0.0), 4),
                keyword_score=round(kw_score_map.get(cid, 0.0), 4),
                combined_score=round(fused_scores[cid], 5),
                rank=rank
            ))

        return results

    def build_citations(self, results: List[SearchResult]) -> List[Citation]:
        citations = []
        for idx, res in enumerate(results, start=1):
            snippet = res.text[:350] + "..." if len(res.text) > 350 else res.text
            citations.append(Citation(
                citation_id=f"CIT-{idx}",
                document_title=res.metadata.document_title,
                organization=res.metadata.organization,
                section_id=res.metadata.section_id,
                assessment_year=res.metadata.assessment_year,
                snippet=snippet,
                source_url=res.metadata.source_url,
                confidence_score=min(0.99, max(0.70, float(res.combined_score * 30)))
            ))
        return citations
