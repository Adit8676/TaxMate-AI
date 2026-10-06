"""FastAPI REST API routes for TaxMate AI."""
import uuid
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel

from app.agent import AgentOrchestrator, AgentResponse
from app.tax_engine import (
    TaxProfileInput,
    TaxCalculationResult,
    RegimeComparisonResult,
    calculate_tax,
    compare_tax_regimes,
    validate_tax_inputs
)
from app.documents.extractor import (
    parse_financial_text,
    extract_text_from_pdf,
    get_document_by_id,
    reconcile_with_profile,
    seed_sample_form_16,
    DOCUMENT_REGISTRY
)
from app.services.evaluator import run_evaluation_suite, get_latest_evaluation, EvaluationSummary

router = APIRouter(prefix="/api")

# Active profile store (in-memory for MVP demo)
CURRENT_PROFILE: TaxProfileInput = TaxProfileInput(
    profile_id="default-user",
    financial_year="2024-25",
    is_salaried=True,
    salary_income=1450000.0,
    interest_income=30000.0,
    rental_income=0.0,
    other_income=0.0,
    deductions={
        "section_80c": 150000.0,
        "section_80d_self": 25000.0,
        "section_80d_parents": 50000.0,
        "parents_senior_citizen": True,
        "section_80ccd_1b": 50000.0,
        "section_24b_home_loan": 200000.0
    }
)

class ChatRequest(BaseModel):
    message: str
    profile_id: Optional[str] = "default-user"
    conversation_id: Optional[str] = None
    override_profile: Optional[Dict[str, Any]] = None

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TaxMate AI Backend",
        "version": "1.0.0",
        "mcp_ready": True,
        "rag_ready": True
    }

# ----------------- Chat Endpoint -----------------
@router.post("/chat", response_model=AgentResponse)
def chat_endpoint(req: ChatRequest):
    agent = AgentOrchestrator.get_instance()
    prof_dict = req.override_profile or CURRENT_PROFILE.model_dump()
    return agent.process_message(
        message=req.message,
        profile=prof_dict,
        conversation_id=req.conversation_id
    )

# ----------------- Profile Endpoints -----------------
@router.get("/profile", response_model=TaxProfileInput)
def get_profile():
    return CURRENT_PROFILE

@router.post("/profile", response_model=Dict[str, Any])
def update_profile(profile: TaxProfileInput):
    global CURRENT_PROFILE
    val = validate_tax_inputs(profile)
    CURRENT_PROFILE = profile
    return {
        "profile": CURRENT_PROFILE,
        "validation": val,
        "message": "Tax profile updated successfully."
    }

@router.delete("/profile")
def reset_profile():
    global CURRENT_PROFILE
    CURRENT_PROFILE = TaxProfileInput(financial_year="2024-25", is_salaried=True)
    return {"message": "Profile reset to defaults."}

# ----------------- Deterministic Tax Endpoints -----------------
@router.post("/tax/calculate", response_model=TaxCalculationResult)
def calculate_tax_endpoint(profile: Optional[TaxProfileInput] = None, regime: str = "new"):
    target_prof = profile or CURRENT_PROFILE
    return calculate_tax(target_prof, regime=regime)

@router.post("/tax/compare", response_model=RegimeComparisonResult)
def compare_tax_endpoint(profile: Optional[TaxProfileInput] = None):
    target_prof = profile or CURRENT_PROFILE
    return compare_tax_regimes(target_prof)

# ----------------- Document Intelligence Endpoints -----------------
@router.get("/documents")
def list_documents():
    return list(DOCUMENT_REGISTRY.values())

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_document"
    contents = await file.read()
    
    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(contents)
    else:
        try:
            text = contents.decode("utf-8")
        except Exception:
            text = contents.decode("latin1", errors="ignore")
            
    doc_result = parse_financial_text(text, filename)
    return doc_result

@router.get("/documents/{doc_id}")
def get_document(doc_id: str):
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.post("/documents/{doc_id}/extract")
def reextract_document(doc_id: str):
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.post("/documents/{doc_id}/reconcile")
def reconcile_document(doc_id: str):
    return reconcile_with_profile(doc_id, CURRENT_PROFILE)

@router.post("/documents/seed-sample")
def seed_sample():
    doc_id = seed_sample_form_16()
    return {"document_id": doc_id, "message": "Sample Form 16 loaded successfully."}

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    if doc_id in DOCUMENT_REGISTRY:
        del DOCUMENT_REGISTRY[doc_id]
        return {"message": f"Document {doc_id} deleted."}
    raise HTTPException(status_code=404, detail="Document not found.")

# ----------------- Evaluation Endpoints -----------------
@router.get("/evaluations/summary", response_model=EvaluationSummary)
def get_evaluation_summary():
    return get_latest_evaluation()

@router.post("/evaluations/run", response_model=EvaluationSummary)
def run_evaluation_endpoint():
    return run_evaluation_suite()
