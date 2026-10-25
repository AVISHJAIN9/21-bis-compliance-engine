# BIS & AIS Regulatory Compliance Engine Documentation

Welcome to the comprehensive technical documentation for the **BIS & AIS Regulatory Compliance Engine**, built in the style of the Vue.js documentation with pure black OLED dark mode, interactive Mermaid diagrams, and detailed interview preparation guides.

---

## Complete Reading Order & Documentation Index

### 1. Foundation & Scan
1. [00. Project Type Classification](./00-project-type.md) — Pre-check detection evidence, package manager analysis, and runtime stack categorization.
2. [00a. Full Project Analysis](./00a-project-analysis.md) — Full-stack trace, screen-by-screen breakdown, connection maps, and verified inventory counts.
3. [00b. Spoken Project Pitch](./00b-project-pitch.md) — 30-second and 2-minute spoken interview pitch scripts.
4. [00. Repository & Project Map](./00-project-map.md) — Folder tree, dependency catalog, environment variables, and process entry points.

### 2. Features & Build Manual
5. [01. Feature Inventory](./01-features.md) — Master feature catalog with dependencies and spoken scripts.
   - [F1: Semantic Standard Identification RAG](./features/F1-standard-identification-rag.md)
   - [F2: Regulatory Guardrailing & Out-of-Domain Filter](./features/F2-regulatory-guardrail.md)
   - [F3: Factory Readiness & Gap Analysis Engine](./features/F3-factory-readiness-gap-engine.md)
   - [F4: Statutory Audit Pack CSV Export](./features/F4-statutory-audit-pack-export.md)
   - [F5: Conversational Officer & Intent Resolver](./features/F5-conversational-compliance-officer.md)
6. [02. Build Order & Step-by-Step Rebuild Manual](./02-build-order.md) — Chronological greenfield rebuilding guide with code explanations.
7. [03. Complete API Reference](./03-api-reference.md) — Detailed OpenAPI/REST endpoint specifications, status codes, schemas, and cURL examples.
8. [04. Technology Choice Comparisons](./04-tech-comparisons.md) — Deep architectural matrices comparing FastAPI, FAISS, FastEmbed, and React 19 against alternatives.

### 3. Architecture, Security & AI Deep Dive
9. [05. Architecture & System Design](./05-architecture.md) — High-level diagrams, request lifecycles, schema design, and scaling bottlenecks.
10. [06. Security Audit & Threat Assessment](./06-security.md) — OWASP Top 10 mapping, air-gapped immunity, and prompt injection defense.
11. [07. AI Integration & Local RAG Architecture](./07-ai-integration.md) — FastEmbed ONNX runtime, vector geometry, and zero-hallucination guarantees.
12. [08. Engineering Quality, DevOps & Operations](./08-quality-and-ops.md) — Testing suites, Dockerization, profiling benchmarks, and technical debt log.

### 4. Distributed System Design Deep Dive (19 Topics)
13. [System Design Overview](./system-design/index.md)
    - [14.1 Requirements & Capacity Estimation](./system-design/14.1-requirements-and-estimation.md)
    - [14.2 Architecture Styles: Monolith vs Microservices](./system-design/14.2-architecture-styles.md)
    - [14.3 Networking & Communication Protocols](./system-design/14.3-networking-and-communication.md)
    - [14.4 Load Balancing & Scaling Strategy](./system-design/14.4-load-balancing-and-scaling.md)
    - [14.5 Databases, Vector Stores & CAP Theorem](./system-design/14.5-databases-and-storage.md)
    - [14.6 Caching Strategy & Vector Optimization](./system-design/14.6-caching.md)
    - [14.7 Messaging, Queues & Async Processing](./system-design/14.7-messaging-and-queues.md)
    - [14.8 Concurrency, Consistency & Threading](./system-design/14.8-consistency-and-concurrency.md)
    - [14.9 Reliability, Resilience & Fault Tolerance](./system-design/14.9-reliability-and-resilience.md)
    - [14.10 API Design, Versioning & Rate Limiting](./system-design/14.10-api-design-and-rate-limiting.md)
    - [14.11 Security Architecture & Air-Gap Defense](./system-design/14.11-security-architecture.md)
    - [14.12 Search, RAG & Vector AI Architecture](./system-design/14.12-search-and-ai-architecture.md)
    - [14.13 Real-Time Systems & Push Transports](./system-design/14.13-real-time-systems.md)
    - [14.14 Observability, Monitoring & Operations](./system-design/14.14-observability-and-operations.md)
    - [14.15 Performance Engineering & Profiling](./system-design/14.15-performance-engineering.md)
    - [14.16 Total Cost of Ownership (TCO) & Trade-offs](./system-design/14.16-cost-and-trade-offs.md)
    - [14.17 Classic System Design Problems Applied](./system-design/14.17-classic-system-design.md)
    - [14.18 Architecture Decision Records (ADR Log)](./system-design/decisions.md)

### 5. Interview Prep & Verification Checklists
14. [09. Complete Interview Preparation (150+ Q&A)](./09-interview-qa.md) — 150+ categorized project-specific questions and full answers.
15. [10. Gaps, Known Debt & Roadmap](./10-gaps-and-improvements.md) — Prioritized production enhancements.
16. [11. Technical & Regulatory Glossary](./11-glossary.md) — Dictionary of statutory and systems engineering terms.
17. [12. Confirm List [CONFIRM WITH DEVELOPER]](./12-confirm-list.md) — List of architectural assumptions for developer verification.
18. [13. Master Technical Checklist (All 275 Items)](./13-master-checklist.md) — Complete 275-point exhaustive audit with coverage matrix.
19. [14. Spoken Rehearsal Guide ('Say It Out Loud')](./14-say-it-out-loud.md) — Consolidated first-person scripts and rehearsal checklist.

---

## Running the Documentation Locally

To launch the VitePress documentation server with Hot Module Replacement:
```bash
npm run docs:dev
```
Open your browser at `http://localhost:5173/` to view the pure black dark-mode documentation.

To build the static HTML production bundle:
```bash
npm run docs:build
```
The output will be emitted into `docs/.vitepress/dist/`.
