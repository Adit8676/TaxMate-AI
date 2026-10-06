"""Tax MCP Server
Exposes deterministic tax calculation, regime comparison, input validation, and rule metadata.
Compatible with MCP 1.x and 2.x SDKs.
"""
from typing import Dict, Any, Optional

try:
    from mcp.server.mcpserver import MCPServer
    mcp = MCPServer("TaxMate-TaxServer")
except (ImportError, ModuleNotFoundError):
    try:
        from mcp.server.fastmcp import FastMCP
        mcp = FastMCP("TaxMate-TaxServer")
    except Exception:
        class DummyMCP:
            def tool(self):
                def dec(f): return f
                return dec
            def run(self): pass
        mcp = DummyMCP()

from app.tax_engine import (
    TaxProfileInput,
    calculate_tax as engine_calculate_tax,
    compare_tax_regimes as engine_compare_regimes,
    validate_tax_inputs as engine_validate_inputs,
    get_year_config
)

@mcp.tool()
def calculate_tax(profile: Dict[str, Any], regime: str = "new") -> Dict[str, Any]:
    """Calculate deterministic Indian Income Tax liability for a given taxpayer profile and regime ('old' or 'new').
    
    Args:
        profile: Dictionary matching TaxProfileInput fields (salary_income, interest_income, deductions, financial_year, etc.)
        regime: 'new' (Section 115BAC) or 'old' (Chapter VI-A)
    """
    try:
        p_obj = TaxProfileInput(**profile)
        res = engine_calculate_tax(p_obj, regime=regime)
        return res.model_dump()
    except Exception as e:
        return {"error": f"Tax calculation error: {str(e)}", "success": False}

@mcp.tool()
def compare_tax_regimes(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Compare Old Tax Regime vs New Tax Regime side-by-side with full breakdown, net savings, and key drivers.
    
    Args:
        profile: Dictionary matching TaxProfileInput fields
    """
    try:
        p_obj = TaxProfileInput(**profile)
        res = engine_compare_regimes(p_obj)
        return res.model_dump()
    except Exception as e:
        return {"error": f"Regime comparison error: {str(e)}", "success": False}

@mcp.tool()
def validate_tax_inputs(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Validate tax profile inputs for completeness, allowable deduction ceilings, and anomalies.
    
    Args:
        profile: Dictionary matching TaxProfileInput fields
    """
    try:
        p_obj = TaxProfileInput(**profile)
        res = engine_validate_inputs(p_obj)
        return res.model_dump()
    except Exception as e:
        return {"error": f"Validation error: {str(e)}", "success": False}

@mcp.tool()
def get_tax_rule_metadata(rule_id: str, financial_year: str = "2024-25") -> Dict[str, Any]:
    """Retrieve official tax rule configuration and slab thresholds for a specific financial year.
    
    Args:
        rule_id: 'slabs_new', 'slabs_old', 'section_87a', 'deductions_limit'
        financial_year: '2023-24', '2024-25', '2025-26'
    """
    cfg = get_year_config(financial_year)
    return {
        "rule_id": rule_id,
        "financial_year": financial_year,
        "assessment_year": cfg.get("assessment_year"),
        "config": cfg
    }

if __name__ == "__main__":
    mcp.run()
