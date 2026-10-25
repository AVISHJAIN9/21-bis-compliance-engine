# Step 1: Project Map & Repository Scan

## Folder Tree & File Purpose

```
21-bis-compliance-engine/
├── .dockerignore                           # Excludes git, cache, and node_modules from Docker build
├── Dockerfile                              # Multi-stage/Slim Python 3.11 container definition (Port 10000)
├── app.py                                  # Core FastAPI application, route handlers, ML pipeline & inference
├── bis_product_department_model_v3.pkl     # Serialized Scikit-Learn classifier for regulatory department routing
├── bulk_ingest.py                          # Ingestion pipeline expanding corpus with mandatory QCO standards
├── complete_12_node_bis_spine.csv          # Reference CSV dataset mapping 12 primary BIS regulatory nodes
├── crawl_standards.py                      # Crawler script designed for standards.bis.gov.in portal extraction
├── eval_guardrail.py                       # Test suite validating 4-tier domain guardrail against adversarial queries
├── export_route_patch.py                   # Utility patch enabling CSV export endpoint integration
├── gap_engine.py                           # Weighted readiness evaluation engine & RFC-4180 CSV report generator
├── guardrail.py                            # 4-tier domain validation guardrail (regex, blacklist, dense threshold)
├── merge_corpus.py                         # Deduplication and staging merger script for model2_corpus.json
├── model2_corpus.json                      # Master static knowledge base of 47 vetted Indian Standards
├── model2_rag_faiss.index                  # Pre-computed 384-dimensional FAISS IndexFlatIP vector index
├── rebuild_faiss_index.py                  # Script using FastEmbed ONNX to regenerate model2_rag_faiss.index
├── requirements.txt                        # Pinned Python package dependencies for backend runtime
├── smoke_check.py                          # Pre-flight latency benchmark and HTTP endpoint verification script
├── test_retrieval.py                       # Sanity verification script testing retrieval accuracy against test queries
├── package.json                            # Workspace root package manifest (VitePress docs scripts & dependencies)
│
├── bis-frontend/                           # React 19 Single Page Application
│   ├── .env.production                     # Production environment variable configuration
│   ├── index.html                          # HTML5 root template mounting React application
│   ├── package.json                        # Frontend dependencies and npm scripts
│   ├── vite.config.js                      # Vite 8 configuration with React plugin
│   └── src/
│       ├── App.jsx                         # Main React application component (UI, state, API calls, export)
│       ├── App.css                         # Application-level layout and responsive styles
│       ├── index.css                       # Base stylesheet and typography definitions
│       └── main.jsx                        # Entry script rendering React 19 root into DOM
│
└── docs/                                   # Complete Interview-Ready Documentation Suite (VitePress)
    ├── .vitepress/
    │   ├── config.mjs                      # VitePress documentation configuration and sidebar tree
    │   └── theme/
    │       ├── custom.css                  # Pure black OLED dark theme styling overrides
    │       └── index.js                    # VitePress custom theme entry point
    ├── 00-project-type.md                  # Pre-check project categorization and detection evidence
    ├── 00a-project-analysis.md             # Complete full-stack trace, connections, and system inventory
    ├── 00b-project-pitch.md                # 30-second and 2-minute spoken interview pitch scripts
    ├── 00-project-map.md                   # Repository folder map, dependencies, and environment variables
    ├── 01-features.md                      # Comprehensive feature catalog (F1-F5)
    ├── 02-build-order.md                   # Step-by-step rebuild manual from greenfield to production
    ├── 03-api-reference.md                 # Complete OpenAPI/REST endpoint documentation
    ├── 04-tech-comparisons.md              # Deep technical decision matrices and trade-off tables
    ├── 05-architecture.md                  # System architecture, data flow, and scaling diagrams
    ├── 06-security.md                      # OWASP Top 10 audit, air-gapped immunity, and safety measures
    ├── 07-ai-integration.md                # FastEmbed ONNX, FAISS vector search, and guardrail deep dive
    ├── 08-quality-and-ops.md               # Testing suites, Dockerization, profiling, and tech debt analysis
    ├── 09-interview-qa.md                  # 150+ project-specific interview questions and model answers
    ├── 10-gaps-and-improvements.md         # Production roadmap and prioritized architectural enhancements
    ├── 11-glossary.md                      # Exhaustive dictionary of regulatory, ML, and web engineering terms
    ├── 12-confirm-list.md                  # Verification list of codebase decisions marked for confirmation
    ├── 13-master-checklist.md              # 275-point exhaustive engineering readiness checklist
    ├── 14-say-it-out-loud.md               # Consolidated spoken scripts for every feature and rehearsal guide
    ├── README.md                           # Documentation hub and navigation guide
    ├── index.md                            # VitePress homepage layout with feature cards
    ├── features/                           # Detailed per-feature specifications (F1 - F5)
    └── system-design/                      # 19-part comprehensive distributed system design deep dive
```

---

## Tech Stack & Exact Versions

### Backend (Python Runtime)
| Technology / Library | Exact Version | Purpose in Codebase |
| :--- | :--- | :--- |
| **Python** | `3.11` (Docker base) | Core runtime environment |
| **FastAPI** | `0.110.0` | High-performance asynchronous REST web framework |
| **Uvicorn** | `0.28.0` | Lightning-fast ASGI production web server |
| **Pydantic** | `2.6.4` | Request payload schema validation & serialization |
| **FastEmbed** | `>=0.5.0` | Zero-PyTorch ONNX runtime embedding generator (`BAAI/bge-small-en-v1.5`) |
| **FAISS CPU** | `1.8.0` | Dense vector similarity index and nearest-neighbor search |
| **Scikit-Learn** | `1.4.1.post1` | Supervised department classification model execution |
| **NumPy** | Latest compatible | High-performance multidimensional array manipulation for vector math |
| **Python-Multipart** | `0.0.9` | Form-data and multipart payload parsing support |

### Frontend (JavaScript Runtime)
| Technology / Library | Exact Version | Purpose in Codebase |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Declarative UI component library |
| **React DOM** | `^19.2.8` | React DOM renderer |
| **Lucide React** | `^1.46.0` | Modern, lightweight SVG iconography |
| **@huggingface/transformers** | `^4.2.0` | In-browser model integration client (reserved for edge inference) |
| **Vite** | `^8.3.0` | Next-generation frontend build tool and development server |
| **@vitejs/plugin-react** | `^6.1.1` | Fast Refresh and JSX transformation plugin for Vite |
| **Oxlint** | `^1.81.0` | High-performance Rust-based JavaScript/JSX linter |

### Documentation Site
| Technology / Library | Exact Version | Purpose in Codebase |
| :--- | :--- | :--- |
| **VitePress** | `^1.6.3` | Static site generator powered by Vite and Vue |
| **Mermaid** | `^11.4.1` | Diagramming and charting tool using markdown syntax |
| **VitePress Plugin Mermaid** | `^2.0.17` | Seamless Mermaid diagram rendering inside VitePress pages |

---

## Environment Variables

| Variable | Default Value | Used In Code | Description | Where to Obtain |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | `10000` (Docker) / `8000` (Local) | [`Dockerfile:L4,L15`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/Dockerfile#L4) | Port on which Uvicorn binds the FastAPI server | Set via environment or container config |
| `PYTHONUNBUFFERED` | `1` | [`Dockerfile:L3`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/Dockerfile#L3) | Forces Python standard output streams to be unbuffered | Docker runtime flag |

*Note: This platform has **ZERO external API keys or cloud credentials** (such as OpenAI, AWS, or Pinecone keys) because the system operates 100% offline and air-gapped.*

---

## Entry Points

| Tier / Process | Entry Point File | Launch Command |
| :--- | :--- | :--- |
| **Backend API** | [`app.py`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/app.py) | `uvicorn app:app --reload --port 8000` |
| **Frontend UI** | [`bis-frontend/src/main.jsx`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/bis-frontend/src/main.jsx) | `npm run dev` (inside `bis-frontend/`) |
| **Documentation** | [`docs/index.md`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/docs/index.md) | `npm run docs:dev` |
| **Docker Container** | [`Dockerfile`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/Dockerfile) | `docker build -t bis-engine . && docker run -p 10000:10000 bis-engine` |
| **Evaluation Suite** | [`eval_guardrail.py`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/eval_guardrail.py) | `python eval_guardrail.py` |
| **Pre-Flight Smoke Check** | [`smoke_check.py`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/smoke_check.py) | `python smoke_check.py` |
| **Vector Index Rebuilder** | [`rebuild_faiss_index.py`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/rebuild_faiss_index.py) | `python rebuild_faiss_index.py` |
