"""Integration tests for TaxMate AI FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["mcp_ready"] is True

def test_profile_get_and_update():
    get_res = client.get("/api/profile")
    assert get_res.status_code == 200
    
    update_res = client.post("/api/profile", json={
        "salary_income": 1600000.0,
        "financial_year": "2024-25",
        "is_salaried": True,
        "deductions": {"section_80c": 150000.0}
    })
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["profile"]["salary_income"] == 1600000.0

def test_deterministic_tax_endpoints():
    calc_res = client.post("/api/tax/calculate?regime=new", json={
        "salary_income": 1200000.0,
        "financial_year": "2024-25",
        "is_salaried": True
    })
    assert calc_res.status_code == 200
    calc_data = calc_res.json()
    assert calc_data["taxable_income"] == 1125000.0
    assert calc_data["final_tax"] > 0
    assert calc_data["cess"] > 0

    comp_res = client.post("/api/tax/compare", json={
        "salary_income": 1200000.0,
        "financial_year": "2024-25",
        "is_salaried": True
    })
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "recommended_regime" in comp_data
    assert len(comp_data["key_drivers"]) > 0

def test_chat_endpoint_regime_comparison():
    chat_res = client.post("/api/chat", json={
        "message": "Which tax regime saves more money for salary 15 Lakhs?"
    })
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "answer" in data
    assert len(data["tools_used"]) > 0
    assert "compare_tax_regimes" in data["tools_used"]
    assert data["request_id"].startswith("req-")

def test_documents_and_reconciliation():
    docs_res = client.get("/api/documents")
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) > 0
    
    recon_res = client.post("/api/documents/doc-sample-form16/reconcile")
    assert recon_res.status_code == 200
    recon_data = recon_res.json()
    assert "discrepancies" in recon_data
    assert "exact_matches" in recon_data
