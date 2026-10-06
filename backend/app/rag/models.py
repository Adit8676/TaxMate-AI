"""Pydantic schemas for RAG knowledge chunks, sources, and retrieval outputs."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SourceMetadata(BaseModel):
    source_id: str
    document_title: str
    organization: str
    financial_year: Optional[str] = None
    assessment_year: Optional[str] = None
    section_id: Optional[str] = None
    source_url: Optional[str] = None
    ingestion_timestamp: str

class DocumentChunk(BaseModel):
    chunk_id: str
    text: str
    metadata: SourceMetadata
    tokens_estimate: int = 0
    embedding: Optional[List[float]] = None

class SearchResult(BaseModel):
    chunk_id: str
    text: str
    metadata: SourceMetadata
    dense_score: float = 0.0
    keyword_score: float = 0.0
    combined_score: float = 0.0
    rank: int = 1

class Citation(BaseModel):
    citation_id: str
    document_title: str
    organization: str
    section_id: Optional[str] = None
    assessment_year: Optional[str] = None
    snippet: str
    source_url: Optional[str] = None
    confidence_score: float = 0.95

class RAGQueryResult(BaseModel):
    query: str
    tax_year_filter: Optional[str] = None
    retrieved_chunks: List[SearchResult]
    citations: List[Citation]
    retrieval_strategy: str  # "hybrid_rrf", "dense", "keyword"
    latency_ms: float = 0.0
