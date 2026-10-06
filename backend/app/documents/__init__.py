"""Document Intelligence module exports."""
from .models import DocumentExtractionResult, ExtractedField, ReconciliationResult, DiscrepancyItem
from .extractor import (
    extract_text_from_pdf,
    parse_financial_text,
    get_document_by_id,
    reconcile_with_profile,
    seed_sample_form_16,
    DOCUMENT_REGISTRY
)

__all__ = [
    "DocumentExtractionResult",
    "ExtractedField",
    "ReconciliationResult",
    "DiscrepancyItem",
    "extract_text_from_pdf",
    "parse_financial_text",
    "get_document_by_id",
    "reconcile_with_profile",
    "seed_sample_form_16",
    "DOCUMENT_REGISTRY"
]
