"""Finance MCP Server
Exposes capital gains computation and financial market data adapters.
Compatible with MCP 1.x and 2.x SDKs.
"""
from typing import Dict, Any, List, Optional

try:
    from mcp.server.mcpserver import MCPServer
    mcp = MCPServer("TaxMate-FinanceServer")
except (ImportError, ModuleNotFoundError):
    try:
        from mcp.server.fastmcp import FastMCP
        mcp = FastMCP("TaxMate-FinanceServer")
    except Exception:
        class DummyMCP:
            def tool(self):
                def dec(f): return f
                return dec
            def run(self): pass
        mcp = DummyMCP()

from app.tax_engine import (
    CapitalGainTransaction,
    calculate_capital_gains as engine_calculate_cg
)

@mcp.tool()
def calculate_capital_gains(transactions: List[Dict[str, Any]], financial_year: str = "2024-25") -> Dict[str, Any]:
    """Calculate Short-Term and Long-Term Capital Gains under post-Budget 2024 rates (Sec 111A 20%, Sec 112A 12.5% above ₹1.25L).
    
    Args:
        transactions: List of transaction objects (asset_type, purchase_date, sale_date, purchase_price, sale_price, expenses)
        financial_year: Target financial year (default 2024-25)
    """
    try:
        tx_objs = [CapitalGainTransaction(**tx) for tx in transactions]
        res = engine_calculate_cg(tx_objs, financial_year=financial_year)
        return res.model_dump()
    except Exception as e:
        return {"error": f"Capital gains calculation error: {str(e)}", "success": False}

@mcp.tool()
def get_market_data(symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
    """Fetch benchmark index or asset market price data for capital gains assessment.
    NOTE: In MVP demo mode, this returns benchmark adapter data clearly labeled.
    
    Args:
        symbol: e.g. 'NIFTY50', 'SENSEX', 'GOLD', 'RE_MUMBAI'
        start_date: YYYY-MM-DD
        end_date: YYYY-MM-DD
    """
    benchmarks = {
        "NIFTY50": {"current_price": 25150.0, "1y_return": 18.5, "cagr_5y": 14.8},
        "SENSEX": {"current_price": 82200.0, "1y_return": 17.9, "cagr_5y": 14.2},
        "GOLD": {"current_price": 76500.0, "1y_return": 22.4, "cagr_5y": 12.1},
        "RE_MUMBAI": {"annual_index_growth": 9.2, "stamp_duty_rate": 6.0}
    }
    data = benchmarks.get(symbol.upper(), {"current_price": 1000.0, "1y_return": 12.0, "cagr_5y": 10.0})
    return {
        "symbol": symbol.upper(),
        "data": data,
        "is_simulated_adapter": True,
        "disclaimer": "Market data is provided via adapter for tax planning simulation purposes."
    }

if __name__ == "__main__":
    mcp.run()
