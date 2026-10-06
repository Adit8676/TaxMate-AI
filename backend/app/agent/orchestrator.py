"""Agentic Orchestration Engine.
Coordinates intent classification, tool invocation via MCP Client,
and LLM synthesis with safety boundaries.
"""
import time
import uuid
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from .mcp_client import MCPClient
from app.services.llm_provider import get_llm_provider, AgentResponse

class ConversationTurn(BaseModel):
    turn_id: str
    user_message: str
    response: AgentResponse
    tools_invoked: List[str]
    retrieved_sources: List[str]
    latency_ms: float
    timestamp: str

class AgentOrchestrator:
    _instance: Optional['AgentOrchestrator'] = None

    def __init__(self):
        self.mcp_client = MCPClient()
        self.llm_provider = get_llm_provider()
        self.conversations: Dict[str, List[ConversationTurn]] = {}

    @classmethod
    def get_instance(cls) -> 'AgentOrchestrator':
        if cls._instance is None:
            cls._instance = AgentOrchestrator()
        return cls._instance

    def process_message(
        self,
        message: str,
        profile: Optional[Dict[str, Any]] = None,
        conversation_id: Optional[str] = None
    ) -> AgentResponse:
        start_time = time.perf_counter()
        conv_id = conversation_id or f"conv-{uuid.uuid4().hex[:8]}"

        # PII Sanitization for internal logging
        masked_msg = re.sub(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', '[PAN-MASKED]', message)
        masked_msg = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[AADHAAR-MASKED]', masked_msg)

        tools = self.mcp_client.list_tools()
        response = self.llm_provider.generate_agent_response(
            user_message=message,
            profile=profile,
            tools_available=tools,
            mcp_client=self.mcp_client
        )

        total_latency = (time.perf_counter() - start_time) * 1000

        # Save turn for evaluation and audit
        turn = ConversationTurn(
            turn_id=response.request_id,
            user_message=masked_msg,
            response=response,
            tools_invoked=response.tools_used,
            retrieved_sources=[s.get("citation_id", "") for s in response.sources],
            latency_ms=round(total_latency, 2),
            timestamp=datetime.now(timezone.utc).isoformat()
        )

        if conv_id not in self.conversations:
            self.conversations[conv_id] = []
        self.conversations[conv_id].append(turn)

        return response
