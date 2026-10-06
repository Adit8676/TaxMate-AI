# TaxMate AI — System Architecture Specification

## 1. Architectural Philosophy
TaxMate AI is an agentic Indian tax and personal finance copilot designed with strict separation of concerns:
- **LLM / Agent**: Responsible for intent classification, capability routing, workflow orchestration, contextual synthesis, and conversational clarity.
- **Deterministic Tax Engine**: System of record for all computations (income tax slabs, Chapter VI-A deductions, Section 87A rebate, surcharge, cess, capital gains). Arithmetic is never delegated to LLM generation.
- **RAG Engine**: Grounded retrieval from authoritative, versioned Indian tax documents (CBDT circulars, Finance Acts, Form 16 guidelines) with dense + BM25 hybrid search and citation generation.
- **Model Context Protocol (MCP)**: Decoupled capability layer standardizing access to deterministic calculation, market benchmarks, and document intelligence.
- **Document Intelligence**: Structured parser for Form 16 (Part A & Part B) with confidence scoring and profile reconciliation.
- **Security & Guardrails**: Untrusted input isolation, prompt-injection defense, and human-in-the-loop confirmation for state-mutating actions.

---

## 2. High-Level Architecture Diagram

```
                                  ┌──────────────────────┐
                                  │      React UI        │
                                  │  Tailwind + Lucide   │
                                  └──────────┬───────────┘
                                             │ HTTP / JSON
                                             ▼
                                  ┌──────────────────────┐
                                  │   FastAPI Gateway    │
                                  │  X-Request-ID / PII  │
                                  └──────────┬───────────┘
                                             │
                         ┌───────────────────┼────────────────────┐
                         │                   │                    │
                         ▼                   ▼                    ▼
                  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
                  │ RAG Engine  │     │ Agent Engine │     │ Doc Registry │
                  │ Hybrid RRF  │     │  Orchestrator│     │  & Profiler  │
                  └──────┬──────┘     └──────┬───────┘     └──────┬───────┘
                         │                   │                    │
                         ▼                   ▼                    ▼
                  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
                  │ Vector &    │     │  MCP Client  │     │   Profile    │
                  │ BM25 Store  │     └──────┬───────┘     │  Data Store  │
                  └─────────────┘            │             └──────────────┘
                                             │
                  ┌──────────────────────────┼─────────────────────────┐
                  │                          │                         │
                  ▼                          ▼                         ▼
          ┌───────────────┐          ┌───────────────┐         ┌───────────────┐
          │ Tax MCP       │          │ Finance MCP   │         │ Document MCP  │
          │ Server        │          │ Server        │         │ Server        │
          └──────┬────────┘          └──────┬────────┘         └──────┬────────┘
                 │                          │                         │
                 ▼                          ▼                         ▼
          Deterministic Tax          Market/Finance            Source & Doc
          Calculation Engine         Adapters (Simulated)      Extractors
```

---

## 3. Component Details

### 3.1 Deterministic Tax Engine
- **Supported Financial Years:** FY 2023-24 (AY 2024-25), FY 2024-25 (AY 2025-26), FY 2025-26 (AY 2026-27).
- **Regimes:**
  - **Old Regime:** Slabs up to ₹2.5L nil, 5%, 20%, 30%; Senior Citizen concessions; Chapter VI-A deductions (80C up to ₹1.5L, 80D up to ₹25k/₹50k, 80CCD(1B) up to ₹50k, Section 24b up to ₹2L); Standard deduction ₹50k; Section 87A rebate up to ₹12,500.
  - **New Regime (Section 115BAC):** Concessional slabs revised in Budget 2024 (nil up to ₹3L, 5% up to ₹7L, 10% up to ₹10L, 15% up to ₹12L, 20% up to ₹15L, 30% above ₹15L); Enhanced Standard deduction ₹75,000 for salaried; Section 87A rebate up to ₹25,000 (net tax zero up to ₹7.75L gross salary) with marginal relief.
- **Capital Gains:** STCG under Sec 111A (20% post-July 2024); LTCG under Sec 112A (12.5% above ₹1.25L exemption post-July 2024).

### 3.2 Hybrid RAG Engine
- Dense semantic vector embeddings (normalized cosine similarity) + Lexical BM25 keyword search.
- Reciprocal Rank Fusion (RRF with $k=60$) ensures both semantic concepts and exact statutory tax sections (e.g., "80CCD(1B)", "115BAC") rank at top positions.
- Generates structured citations (`document_title`, `organization`, `section_id`, `snippet`, `source_url`, `confidence_score`).

### 3.3 Model Context Protocol (MCP) Capabilities
- **Tax Server (`TaxMCP`):** `calculate_tax`, `compare_tax_regimes`, `validate_tax_inputs`, `get_tax_rule_metadata`.
- **Finance Server (`FinanceMCP`):** `calculate_capital_gains`, `get_market_data`.
- **Document Server (`DocumentMCP`):** `search_tax_sources`, `get_source_document`, `extract_financial_document`.

### 3.4 Evaluation & Empirical Metrics
- Golden dataset containing 35 test cases across 7 categories.
- Tracks Hit Rate, Tool Selection Accuracy, Correctness, Injection Defense Rate, Latency P50/P95, and Token Cost Proxy.
