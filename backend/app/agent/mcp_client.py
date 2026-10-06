"""MCP Client for TaxMate AI Agent.
Coordinates dispatch to Tax, Finance, and Document MCP capabilities with
sandboxed validation, structured logging, latency tracking, and error handling.
"""
import time
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

# Direct in-process adapter to MCP tool functions for high performance & reliability
import mcp_servers.tax_server.server as tax_server
import mcp_servers.finance_server.server as finance_server
import mcp_servers.document_server.server as doc_server

class MCPToolCallRecord(BaseModel):
    tool_name: str
    server_name: str
    arguments: Dict[str, Any]
    output: Any
    latency_ms: float
    status: str  # "success" or "error"
    error_message: Optional[str] = None

class MCPClient:
    def __init__(self):
        self.tool_registry = {
            # Tax Server tools
            "calculate_tax": {
                "server": "TaxMCP",
                "fn": tax_server.calculate_tax,
                "description": "Calculate deterministic Indian Income Tax liability for a profile under Old or New Regime (Section 115BAC).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "profile": {"type": "object", "description": "Tax profile dictionary with salary_income, interest_income, deductions, etc."},
                        "regime": {"type": "string", "enum": ["new", "old"], "default": "new"}
                    },
                    "required": ["profile"]
                }
            },
            "compare_tax_regimes": {
                "server": "TaxMCP",
                "fn": tax_server.compare_tax_regimes,
                "description": "Compare Old Regime vs New Regime side-by-side with step-by-step breakdown, savings, and key drivers.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "profile": {"type": "object", "description": "Tax profile dictionary"}
                    },
                    "required": ["profile"]
                }
            },
            "validate_tax_inputs": {
                "server": "TaxMCP",
                "fn": tax_server.validate_tax_inputs,
                "description": "Validate tax profile inputs, checking negative numbers, deduction limits, and missing fields.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "profile": {"type": "object", "description": "Tax profile dictionary"}
                    },
                    "required": ["profile"]
                }
            },
            "get_tax_rule_metadata": {
                "server": "TaxMCP",
                "fn": tax_server.get_tax_rule_metadata,
                "description": "Get official tax rule configuration and slab thresholds for a financial year.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "rule_id": {"type": "string"},
                        "financial_year": {"type": "string", "default": "2024-25"}
                    },
                    "required": ["rule_id"]
                }
            },
            # Finance Server tools
            "calculate_capital_gains": {
                "server": "FinanceMCP",
                "fn": finance_server.calculate_capital_gains,
                "description": "Calculate STCG and LTCG taxes on equity, mutual funds, or real estate under Budget 2024 rules.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "transactions": {"type": "array", "items": {"type": "object"}},
                        "financial_year": {"type": "string", "default": "2024-25"}
                    },
                    "required": ["transactions"]
                }
            },
            "get_market_data": {
                "server": "FinanceMCP",
                "fn": finance_server.get_market_data,
                "description": "Get market benchmark return data (NIFTY50, SENSEX, GOLD) for tax simulation.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "symbol": {"type": "string"}
                    },
                    "required": ["symbol"]
                }
            },
            # Document Server tools
            "search_tax_sources": {
                "server": "DocumentMCP",
                "fn": doc_server.search_tax_sources,
                "description": "Search authoritative Indian Tax documents (Section 115BAC, Chapter VI-A, Budget 2024, Form 16) with citations.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "tax_year": {"type": "string"}
                    },
                    "required": ["query"]
                }
            },
            "get_source_document": {
                "server": "DocumentMCP",
                "fn": doc_server.get_source_document,
                "description": "Fetch complete text of an authoritative document chunk by its source ID.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "source_id": {"type": "string"}
                    },
                    "required": ["source_id"]
                }
            },
            "extract_financial_document": {
                "server": "DocumentMCP",
                "fn": doc_server.extract_financial_document,
                "description": "Extract structured financial fields (salary, standard deduction, 80C, 80D, TDS) from an uploaded document.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "document_id": {"type": "string"}
                    },
                    "required": ["document_id"]
                }
            }
        }

    def list_tools(self) -> List[Dict[str, Any]]:
        """Return standardized tool declarations for the Agent/LLM."""
        declarations = []
        for name, meta in self.tool_registry.items():
            declarations.append({
                "name": name,
                "description": meta["description"],
                "parameters": meta["parameters"],
                "server": meta["server"]
            })
        return declarations

    def invoke_tool(self, tool_name: str, arguments: Dict[str, Any]) -> MCPToolCallRecord:
        """Invoke an MCP tool with sandboxed validation and latency measurement."""
        if tool_name not in self.tool_registry:
            return MCPToolCallRecord(
                tool_name=tool_name,
                server_name="Unknown",
                arguments=arguments,
                output={"error": f"Tool '{tool_name}' not registered in MCP capability catalog."},
                latency_ms=0.0,
                status="error",
                error_message=f"Tool '{tool_name}' not found"
            )

        meta = self.tool_registry[tool_name]
        fn = meta["fn"]
        server_name = meta["server"]

        start_time = time.perf_counter()
        try:
            # Safe call
            res = fn(**arguments)
            latency = (time.perf_counter() - start_time) * 1000
            return MCPToolCallRecord(
                tool_name=tool_name,
                server_name=server_name,
                arguments=arguments,
                output=res,
                latency_ms=round(latency, 2),
                status="success"
            )
        except Exception as e:
            latency = (time.perf_counter() - start_time) * 1000
            return MCPToolCallRecord(
                tool_name=tool_name,
                server_name=server_name,
                arguments=arguments,
                output={"error": str(e), "success": False},
                latency_ms=round(latency, 2),
                status="error",
                error_message=str(e)
            )
