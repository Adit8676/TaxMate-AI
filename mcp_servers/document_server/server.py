"""Document MCP Server
Exposes source search, document retrieval, and financial document extraction tools.
Compatible with MCP 1.x and 2.x SDKs.
"""
from typing import Dict, Any, List, Optional

try:
    from mcp.server.mcpserver import MCPServer
    mcp = MCPServer("TaxMate-DocumentServer")
except (ImportError, ModuleNotFoundError):
    try:
        from mcp.server.fastmcp import FastMCP
        mcp = FastMCP("TaxMate-DocumentServer")
    except Exception:
        class DummyMCP:
            def tool(self):
                def dec(f): return f
                return dec
            def run(self): pass
        mcp = DummyMCP()

from app.rag import RAGRetriever

@mcp.tool()
def search_tax_sources(query: str, tax_year: Optional[str] = None) -> Dict[str, Any]:
    """Search authoritative Indian Tax knowledge base documents with hybrid retrieval and return structured citations.
    
    Args:
        query: User question or topic (e.g. 'Section 115BAC slabs FY 2024-25', 'Section 80C limit', 'LTCG on property')
        tax_year: Optional target financial year (e.g. '2024-25')
    """
    retriever = RAGRetriever.get_instance()
    res = retriever.query(query_text=query, top_k=3, tax_year_filter=tax_year)
    return {
        "query": query,
        "tax_year": tax_year,
        "results": [c.model_dump() for c in res.retrieved_chunks],
        "citations": [cit.model_dump() for cit in res.citations],
        "latency_ms": res.latency_ms
    }

@mcp.tool()
def get_source_document(source_id: str) -> Dict[str, Any]:
    """Retrieve full text and metadata for a specific authoritative tax document or chunk.
    
    Args:
        source_id: Unique identifier of document chunk or source ID
    """
    retriever = RAGRetriever.get_instance()
    for chunk in retriever.vector_store.chunks:
        if chunk.chunk_id == source_id or chunk.metadata.source_id == source_id:
            return {
                "chunk_id": chunk.chunk_id,
                "text": chunk.text,
                "metadata": chunk.metadata.model_dump()
            }
    return {"error": f"Source document '{source_id}' not found.", "success": False}

@mcp.tool()
def extract_financial_document(document_id: str) -> Dict[str, Any]:
    """Extract financial fields from an uploaded document (Form 16 or salary statement) with confidence scores.
    
    Args:
        document_id: ID of the uploaded document stored in document intelligence registry
    """
    from app.documents.extractor import get_document_by_id
    doc_data = get_document_by_id(document_id)
    if not doc_data:
        return {"error": f"Document ID '{document_id}' not found", "success": False}
    return doc_data

if __name__ == "__main__":
    mcp.run()
