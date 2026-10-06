"""RAG Retriever Service orchestrating ingestion, hybrid search, and citation generation."""
import os
import glob
import time
from typing import List, Optional
from .models import RAGQueryResult, SearchResult, Citation
from .chunker import parse_tax_document
from .vector_store import VectorStore

class RAGRetriever:
    _instance: Optional['RAGRetriever'] = None

    def __init__(self, kb_dir: Optional[str] = None):
        self.vector_store = VectorStore()
        self.kb_dir = kb_dir or os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "knowledge_base")
        self.is_indexed = False

    @classmethod
    def get_instance(cls, kb_dir: Optional[str] = None) -> 'RAGRetriever':
        if cls._instance is None:
            cls._instance = RAGRetriever(kb_dir)
            cls._instance.ingest_knowledge_base()
        return cls._instance

    def ingest_knowledge_base(self):
        """Read and chunk all markdown files in knowledge_base directory."""
        if self.is_indexed:
            return
            
        doc_files = glob.glob(os.path.join(self.kb_dir, "*.md"))
        all_chunks = []
        for fpath in doc_files:
            fname = os.path.basename(fpath)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                chunks = parse_tax_document(content, fname)
                all_chunks.extend(chunks)
            except Exception as e:
                print(f"[RAG] Error reading {fpath}: {e}")

        if all_chunks:
            self.vector_store.add_chunks(all_chunks)
            self.is_indexed = True
            print(f"[RAG] Successfully indexed {len(all_chunks)} chunks across {len(doc_files)} tax knowledge documents.")

    def query(self, query_text: str, top_k: int = 4, tax_year_filter: Optional[str] = None) -> RAGQueryResult:
        start_time = time.perf_counter()
        if not self.is_indexed:
            self.ingest_knowledge_base()

        search_results = self.vector_store.hybrid_search(
            query=query_text,
            top_k=top_k,
            year_filter=tax_year_filter
        )
        citations = self.vector_store.build_citations(search_results)
        latency = (time.perf_counter() - start_time) * 1000

        return RAGQueryResult(
            query=query_text,
            tax_year_filter=tax_year_filter,
            retrieved_chunks=search_results,
            citations=citations,
            retrieval_strategy="hybrid_rrf",
            latency_ms=round(latency, 2)
        )
