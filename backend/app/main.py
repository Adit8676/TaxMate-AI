"""Main FastAPI entrypoint for TaxMate AI."""
import sys
from pathlib import Path

# Ensure project root and backend are in sys.path
_BASE_DIR = Path(__file__).resolve().parent.parent
_ROOT_DIR = _BASE_DIR.parent
for _p in (str(_ROOT_DIR), str(_BASE_DIR)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.rag import RAGRetriever
from app.documents.extractor import seed_sample_form_16

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: pre-index RAG knowledge base & seed sample documents
    print("[TaxMate AI] Bootstrapping RAG Knowledge Base and MCP capability catalogs...")
    retriever = RAGRetriever.get_instance()
    retriever.ingest_knowledge_base()
    seed_sample_form_16()
    print("[TaxMate AI] System initialized and ready.")
    yield
    print("[TaxMate AI] Shutting down.")

app = FastAPI(
    title="TaxMate AI — Agentic Indian Tax & Finance Copilot",
    description="Deterministic Indian Tax Engine + RAG + MCP Tools + Agentic Orchestration + Document Intelligence",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_request_metadata_and_timing(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", f"req-{uuid.uuid4().hex[:10]}")
    start_time = time.perf_counter()
    
    response = await call_next(request)
    
    process_time = (time.perf_counter() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "TaxMate AI API is online.",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
