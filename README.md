# TaxMate AI — Agentic Indian Tax & Finance Copilot

[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat&logo=TypeScript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB.svg?style=flat&logo=Python&logoColor=white)](https://python.org)
[![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-Official%20Standard-8A2BE2.svg)](https://modelcontextprotocol.io)
[![Test Suite](https://img.shields.io/badge/Pytest-18%2F18%20Passed-brightgreen.svg)]()
[![Evaluation](https://img.shields.io/badge/Golden%20Eval-100%25%20(35%2F35)-brightgreen.svg)]()

> **TaxMate AI** is an production-grade agentic copilot for Indian personal income tax research, regime comparison, and financial document intelligence. It combines deterministic computation, authoritative hybrid RAG (Retrieval-Augmented Generation), standard Model Context Protocol (MCP) servers, and zero-trust security guardrails.

---

## 🏛️ Architectural Philosophy

The core architectural principle of TaxMate AI is **strict separation of cognitive and mathematical duties**:
1. **The LLM is NEVER the source of truth for arithmetic**: Financial calculations (slabs, cess, standard deductions, Section 87A rebates, and capital gains) are executed by an auditable, deterministic tax engine.
2. **Authoritative Grounding (Hybrid RAG)**: Legal claims are retrieved from versioned statutory sources (CBDT notifications, Finance (No. 2) Act 2024, Income Tax Act 1961) using Reciprocal Rank Fusion (RRF) combining dense semantic search and BM25 lexical search.
3. **Model Context Protocol (MCP)**: System capabilities are decoupled into independent MCP server modules (`TaxMCP`, `FinanceMCP`, `DocumentMCP`), providing standard tool calling interfaces.
4. **Human-in-the-Loop Approval**: Financial document extractions (Form 16) are reconciled against user profiles and require explicit user confirmation before state mutations.
5. **Empirical Evaluation**: System quality is measured using a 35-case Golden Dataset with automated latency, tool routing accuracy, and injection defense benchmarks.

---

## 📐 System Architecture

```
                                  ┌──────────────────────┐
                                  │   React 19 Frontend  │
                                  │ (Chat/Compare/Docs)  │
                                  └──────────┬───────────┘
                                             │ HTTP / JSON
                                             ▼
                                  ┌──────────────────────┐
                                  │   FastAPI Gateway    │
                                  │ (X-Request-ID / PII) │
                                  └──────────┬───────────┘
                                             │
                         ┌───────────────────┼────────────────────┐
                         │                   │                    │
                         ▼                   ▼                    ▼
                  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
                  │ RAG Engine  │     │ Agent Engine │     │ Doc Registry │
                  │ Hybrid RRF  │     │ Orchestrator │     │  & Profiler  │
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
          │    Tax MCP    │          │  Finance MCP  │         │  Document MCP │
          │    Server     │          │    Server     │         │    Server     │
          └──────┬────────┘          └──────┬────────┘         └──────┬────────┘
                 │                          │                         │
                 ▼                          ▼                         ▼
         Deterministic Tax           Market/Finance            Form 16 & Doc
         Engine (CBDT Slabs)         Capital Gains (2024)      Extractors + PII
```

---

## ✨ Key Capabilities & Modules

### 1. 🤖 Agentic Copilot Chat
- Intent classification across factual inquiries, profile calculations, capital gains simulations, and document reconciliation.
- Multi-step tool orchestration via MCP Client with execution traces and latency diagnostics.
- Transparent citations previewing source documents, statutory section IDs, and confidence scores.

### 2. 🧮 Deterministic Tax Calculation & Regime Comparator
- Full compliance with **Budget 2024 amendments** for **FY 2024-25 (AY 2025-26)** and **FY 2023-24 (AY 2024-25)**.
- **New Tax Regime (Section 115BAC)**: Slabs (0%, 5%, 10%, 15%, 20%, 30%), enhanced Standard Deduction of **₹75,000**, Section 87A rebate of up to **₹25,000** (zero tax up to ₹7.75L gross salary), and marginal relief computation.
- **Old Tax Regime**: Basic slabs, senior citizen threshold (**₹3,00,000**), Chapter VI-A deductions (80C, 80D, 80CCD(1B), 24(b), 80TTA/TTB), standard deduction of ₹50,000, and Section 87A rebate.
- Step-by-step audit trail exposing exact tax slab line items, cess (**4%**), and savings drivers.

### 3. 📈 Capital Gains Engine (Post-July 2024 Framework)
- **STCG (Section 111A)**: Taxed at **20%** for listed equities and equity mutual funds.
- **LTCG (Section 112A)**: Taxed at **12.5%** with annual exemption increased to **₹1,25,000**.
- **Holding Period Verification**: Automatic classification (12 months for equity, 24 months for real estate).
- **Real Estate Grandfathering**: 12.5% without indexation vs. 20% with indexation for pre-23 July 2024 purchases.

### 4. 📄 Document Intelligence & Form 16 Reconciliation
- PDF and Text statement parsing (Employer TAN, masked employee PAN, gross salary under 17(1), standard deduction 16(ia), Chapter VI-A deductions, and TDS).
- Field-level OCR extraction confidence scoring.
- Automated reconciliation against active tax profile: identifies exact matches, numeric discrepancies, and missing deductions.
- **Human-in-the-Loop Gate**: Checkbox review modal ensuring state updates are explicitly authorized by the user.

### 5. 🛡️ Security, Privacy & Guardrails
- **Prompt Injection Defense**: Untrusted content isolation; jailbreak attempts (*"ignore previous instructions"*, *"developer mode"*, *"set tax to 0"*) are blocked by security guardrails.
- **PII Masking**: PAN and Aadhaar numbers are automatically sanitized before entering logs or execution records.
- **Zero Hallucination Policy**: Returns transparent fallback when knowledge evidence is insufficient.

### 6. 📊 Empirical Evaluation Framework & Live Dashboard
- **35-case Golden Dataset** covering:
  - Factual Q&A (14 cases)
  - Regime Comparison (5 cases)
  - Capital Gains (4 cases)
  - Document Extraction (4 cases)
  - Adversarial Prompt Injections (4 cases)
  - Insufficient Evidence handling (2 cases)
  - Deterministic Math Verification (2 cases)
- Evaluates Retrieval Hit Rate, Tool Accuracy, Answer Correctness, Safety Defense, Latency P50/P95, and Token Cost Proxy.
- Verified Benchmark: **100.0% Pass Rate** across all 35 cases.

---

## 🚀 Quickstart & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # On Windows PowerShell
# source venv/bin/activate    # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Run unit and integration tests
python -m pytest

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now running at `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Build to verify TypeScript compilation
npm run build

# Start Vite dev server
npm run dev
```
The application UI is now accessible at `http://localhost:5173`.

### 3. Run Automated Evaluation Benchmark
```bash
# Run benchmark from project root
.\backend\venv\Scripts\python scripts\run_evaluation.py
```

---

## 📁 Repository Structure

```
TaxMate AI/
├── backend/
│   ├── app/
│   │   ├── agent/                 # Agentic orchestrator & MCP client
│   │   │   ├── orchestrator.py
│   │   │   └── mcp_client.py
│   │   ├── api/                   # REST API routes (FastAPI)
│   │   │   └── routes.py
│   │   ├── documents/             # Form 16 extraction & reconciliation
│   │   │   ├── extractor.py
│   │   │   └── models.py
│   │   ├── rag/                   # Hybrid RAG (Dense + BM25 RRF + Chunker)
│   │   │   ├── chunker.py
│   │   │   ├── embedder.py
│   │   │   ├── models.py
│   │   │   ├── retriever.py
│   │   │   └── vector_store.py
│   │   ├── services/              # LLM provider & Evaluation benchmark
│   │   │   ├── evaluator.py
│   │   │   └── llm_provider.py
│   │   ├── tax_engine/            # Deterministic calculation engine
│   │   │   ├── calculator.py
│   │   │   ├── models.py
│   │   │   └── rules_config.py
│   │   └── main.py                # FastAPI bootstrap & lifespan
│   ├── tests/
│   │   ├── integration/           # End-to-end API tests
│   │   └── unit/                  # Engine, RAG, and Agent tests
│   └── requirements.txt
├── data/
│   ├── evaluation/                # 35-case golden dataset & benchmark results
│   │   ├── golden_dataset.json
│   │   └── evaluation_results.json
│   ├── knowledge_base/            # Versioned statutory tax documents
│   │   ├── capital_gains_budget_2024_amendments.md
│   │   ├── chapter_via_deductions_old_regime.md
│   │   ├── form_16_structure_and_filing_guide.md
│   │   ├── income_tax_act_sec_115bac.md
│   │   └── section_87a_rebate_and_marginal_relief.md
│   └── sample_documents/          # Test Form 16 statements
│       └── sample_form_16.txt
├── docs/
│   ├── architecture.md            # In-depth architectural design
│   ├── demo_script.md             # 3-minute interview presentation walkthrough
│   └── threat-model.md            # Security boundaries & mitigations
├── frontend/
│   ├── src/
│   │   ├── api/                   # Typed API client
│   │   ├── components/            # UI Views (Chat, Compare, Profile, Docs, Eval)
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── mcp_servers/                   # Model Context Protocol Capability Servers
│   ├── document_server/server.py  # Document & RAG MCP server
│   ├── finance_server/server.py   # Capital gains & Market MCP server
│   └── tax_server/server.py       # Deterministic Tax Engine MCP server
├── scripts/
│   └── run_evaluation.py          # CLI Benchmark runner
├── .env.example
├── extracted_requirements.md      # Master Project Requirements Specification
├── pytest.ini
└── README.md
```

---

## 🧪 Benchmark Results

| Metric | Target | Actual (TaxMate AI) | Status |
| :--- | :--- | :--- | :--- |
| **Overall Golden Pass Rate** | $\ge 90\%$ | **100.0%** (35/35) | ✅ Exceeded |
| **Retrieval Hit Rate (RRF)** | $\ge 85\%$ | **100.0%** | ✅ Exceeded |
| **Tool Selection Accuracy** | $\ge 90\%$ | **100.0%** | ✅ Exceeded |
| **Answer Correctness** | $\ge 85\%$ | **100.0%** | ✅ Exceeded |
| **Safety / Injection Defense** | $100\%$ | **100.0%** (4/4 blocked) | ✅ Perfect |
| **Calculation Engine Precision**| $100\%$ | **100.0%** (Unit-tested) | ✅ Perfect |
| **Average Latency** | $< 100\text{ ms}$ | **6.1 ms** | ✅ Ultra-fast |
| **P95 Latency** | $< 250\text{ ms}$ | **9.9 ms** | ✅ Ultra-fast |

---

## ⚖️ Legal & Statutory Disclaimer

*TaxMate AI provides informational and calculation assistance based on publicly published Income Tax Department guidelines. It is not an authorized Chartered Accountancy practice or legal advisor. Tax laws are subject to annual amendments and individual interpretations; users should consult a qualified tax professional or Chartered Accountant for consequential filing decisions.*
