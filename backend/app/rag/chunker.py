"""Document chunker for Indian tax documents.
Splits by markdown headers and paragraphs while preserving section and year metadata.
"""
import re
from typing import List, Dict, Any
from datetime import datetime, timezone
from .models import DocumentChunk, SourceMetadata

def parse_tax_document(content: str, filename: str) -> List[DocumentChunk]:
    """Parse a markdown tax document and return structured chunks with metadata."""
    lines = content.splitlines()
    
    # Extract frontmatter / header metadata
    org = "Income Tax Department, Government of India"
    title = filename.replace(".md", "").replace("_", " ").title()
    doc_id = filename.replace(".md", "")
    source_url = "https://incometaxindia.gov.in"
    ay = "AY 2024-25 / AY 2025-26"
    fy = "2024-25"
    
    for line in lines[:20]:
        if "Source Organization:" in line:
            org = line.split("Source Organization:")[1].strip().strip("*").strip()
        elif "Applicable Assessment Years:" in line:
            ay = line.split("Applicable Assessment Years:")[1].strip().strip("*").strip()
        elif "Document ID:" in line:
            doc_id = line.split("Document ID:")[1].strip().strip("*").strip()
        elif "Source URL:" in line:
            source_url = line.split("Source URL:")[1].strip().strip("*").strip()
        elif line.startswith("# ") and len(line) > 2:
            title = line[2:].strip().strip("*").strip()

    # Split by section headers (## or ###)
    sections = re.split(r'\n(?=###? )', content)
    chunks: List[DocumentChunk] = []
    
    for idx, sec in enumerate(sections):
        sec_text = sec.strip()
        if not sec_text or len(sec_text) < 40:
            continue
            
        # Extract section title
        first_line = sec_text.splitlines()[0]
        section_id = first_line.replace("#", "").strip() if first_line.startswith("#") else f"Section {idx+1}"

        metadata = SourceMetadata(
            source_id=f"{doc_id}-chunk-{idx+1}",
            document_title=title,
            organization=org,
            financial_year=fy,
            assessment_year=ay,
            section_id=section_id,
            source_url=source_url,
            ingestion_timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        chunks.append(DocumentChunk(
            chunk_id=f"{doc_id}-{idx+1}",
            text=sec_text,
            metadata=metadata,
            tokens_estimate=len(sec_text.split())
        ))
        
    return chunks
