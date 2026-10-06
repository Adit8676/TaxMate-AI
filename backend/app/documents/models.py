"""Document Intelligence schemas for Form 16 extraction and profile reconciliation."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ExtractedField(BaseModel):
    field_key: str
    label: str
    extracted_value: Any
    confidence: float = Field(ge=0.0, le=1.0)
    source_snippet: Optional[str] = None
    page_number: int = 1
    is_low_confidence: bool = False

class DocumentExtractionResult(BaseModel):
    document_id: str
    filename: str
    document_type: str  # "form_16", "salary_slip", "investment_statement"
    assessment_year: Optional[str] = None
    employer_name: Optional[str] = None
    employee_pan_masked: Optional[str] = None
    fields: Dict[str, ExtractedField]
    overall_confidence: float
    upload_timestamp: str

class DiscrepancyItem(BaseModel):
    field_name: str
    label: str
    document_value: float
    profile_value: float
    difference: float
    severity: str  # "high", "medium", "info"
    recommendation: str

class ReconciliationResult(BaseModel):
    document_id: str
    exact_matches: List[str]
    discrepancies: List[DiscrepancyItem]
    missing_in_profile: List[Dict[str, Any]]
    low_confidence_fields: List[str]
    is_fully_reconciled: bool
    summary: str
