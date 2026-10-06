"""Unit tests for RAG Hybrid Retrieval and Citations."""
import pytest
from app.rag import RAGRetriever

def test_rag_ingestion_and_hybrid_search():
    retriever = RAGRetriever.get_instance()
    assert retriever.is_indexed
    assert len(retriever.vector_store.chunks) > 0
    
    result = retriever.query("What is the standard deduction in the New Tax Regime for FY 2024-25?")
    assert len(result.retrieved_chunks) > 0
    assert len(result.citations) > 0
    
    # Verify top chunk mentions 75,000 or standard deduction
    top_text = " ".join([c.text for c in result.retrieved_chunks])
    assert "75,000" in top_text or "standard deduction" in top_text.lower()
    
    # Check citation structure
    first_cit = result.citations[0]
    assert first_cit.document_title != ""
    assert first_cit.organization != ""
    assert first_cit.snippet != ""

def test_rag_capital_gains_retrieval():
    retriever = RAGRetriever.get_instance()
    result = retriever.query("What is the LTCG rate and exemption under Section 112A after Budget 2024?")
    assert len(result.retrieved_chunks) > 0
    top_text = " ".join([c.text for c in result.retrieved_chunks])
    assert "12.5%" in top_text or "1,25,000" in top_text or "112a" in top_text.lower()

def test_rag_empty_or_unknown_query():
    retriever = RAGRetriever.get_instance()
    result = retriever.query("Quantum chromodynamics in astrophysics")
    assert result.latency_ms >= 0.0
