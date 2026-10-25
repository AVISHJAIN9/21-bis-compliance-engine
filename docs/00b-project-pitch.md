# Project Pitch & Interview Scripts

## 30-Second Elevator Pitch

> "I built the **BIS & AIS Regulatory Compliance Engine**, an air-gapped compliance auditing platform that automates factory readiness evaluations and statutory standard identification for industrial and automotive products in India. 
> 
> Instead of relying on slow, costly cloud LLMs, I engineered an ultra-fast local RAG pipeline using FastEmbed ONNX runtime embeddings, a FAISS vector index, and a Scikit-Learn classifier to resolve mandatory Quality Control Orders and AIS Homologation standards in under 20 milliseconds with zero external API calls. 
> 
> The system features a 4-tier domain guardrail to prevent halluncinations or out-of-domain queries and computes statutory factory readiness percentages against official Scheme-I checklists, allowing compliance officers to export audit packs directly to CSV."

---

## 2-Minute Comprehensive Technical Pitch

> "Hello! The project I built is the **BIS & AIS Regulatory Compliance Engine**. In India, manufacturers and importers face massive regulatory hurdles complying with mandatory Bureau of Indian Standards Quality Control Orders and Automotive Industry Standards homologation under CMVR Rule 126. Getting this wrong leads to factory shutdown notices, port confiscations, and heavy fines, while manually reviewing thousands of statutory gazettes takes weeks.
> 
> To solve this, I designed a full-stack, 100% air-gapped compliance audit engine. The system has two primary components: a high-performance Python FastAPI backend and a clean, responsive React 19 Single Page Application.
> 
> When a user queries a product—such as 'Ordinary Portland Cement 53 Grade' or 'EV Traction Battery AIS 156'—the backend processes the query through three distinct ML and search stages. First, a serialized Scikit-Learn model classifies the administrative ministry or department. Second, FastEmbed transforms the query into a 384-dimensional dense vector using the `BAAI/bge-small-en-v1.5` model running entirely locally on CPU via ONNX Runtime, requiring only 60 megabytes of memory and zero PyTorch dependencies. Third, a FAISS `IndexFlatIP` performs cosine nearest-neighbor search across our curated statutory corpus in less than 2 milliseconds.
> 
> To guarantee regulatory accuracy and prevent false positives, I implemented a 4-tiered domain guardrail in `guardrail.py`. It instantly passes exact statutory numbers with regular expressions, filters common commercial noise with keyword blacklists, verifies domain-specific terminology, and enforces a dense semantic threshold.
> 
> Once validated, our weighted gap engine in `gap_engine.py` dynamically evaluates the factory's verified artifacts—such as NABL calibration certificates, in-house test benches, and QC personnel undertakings—against the official BIS Scheme-I or AIS-037 checklist. It calculates an exact readiness percentage, flags critical non-compliances, and provides the statutory clause citations. Users can then export this complete determination as an RFC-4180 compliant CSV audit report.
> 
> In testing, the engine delivers sub-20ms inference latency, achieves 100% accuracy on our out-of-domain evaluation suite, and costs zero dollars per month in cloud AI API fees because it runs completely self-contained in a Docker container."

---

## Behavioral Story: The 'Why' Behind the Architecture

### Why Air-Gapped Local ML Instead of OpenAI or Anthropic?
1. **Confidentiality & Statutory Privacy**: Manufacturing companies entering new hardware or automotive prototypes will not submit proprietary formulations or bill of materials to third-party public cloud APIs.
2. **Deterministic Citations**: Generic LLMs hallucinate non-existent Indian Standard numbers or cite outdated 1989 amendments. A vector index over vetted BIS gazettes guarantees 100% regulatory citation integrity.
3. **Zero Operating Expense**: Operating an air-gapped FastEmbed ONNX model costs $0 in API tokens and functions in remote factory testing labs with zero internet connectivity.
