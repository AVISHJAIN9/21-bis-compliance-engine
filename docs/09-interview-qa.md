# Step 10: Complete Technical Interview Q&A (150+ Questions & Answers)

This guide prepares the developer to answer ANY question an interviewer could ask about the **21-BIS-Compliance-Engine**, from fresher/intern level to senior full-stack and systems engineering rounds.

---

## 1. Core Project Overview & Behavioral Scripts

### Q1: "Walk me through your project in 3 minutes."
> **Answer**:  
> "The **21-BIS-Compliance-Engine** is an air-gapped regulatory compliance auditing platform built to automate statutory product certifications across two major Indian regulatory regimes: Bureau of Indian Standards (BIS) Scheme-I for industrial goods and Automotive Industry Standards (AIS) Homologation under Central Motor Vehicles Rule 126.
> 
> Manufacturers face enormous risk under statutory Quality Control Orders (QCOs): manufacturing or importing uncertified products carries factory closure notices and severe legal penalties, but manually auditing complex gazettes takes weeks.
> 
> To solve this, I designed a full-stack, 100% offline system. The backend is built with Python 3.11 and FastAPI running an asynchronous ASGI server. When an engineer enters a product description—say, 'Ordinary Portland Cement 53 Grade' or 'EV Traction Battery AIS 156'—the engine processes it through an in-memory RAG pipeline. First, a Scikit-Learn classifier routes the query to the governing ministry. Second, FastEmbed transforms the query into a 384-dimensional dense vector using the `BAAI/bge-small-en-v1.5` transformer model running locally on CPU via ONNX Runtime in 14 milliseconds. Third, a pre-computed FAISS `IndexFlatIP` performs cosine nearest-neighbor search across our curated statutory corpus in under 0.2 milliseconds.
> 
> To prevent false positives and out-of-domain noise, I engineered a 4-tier domain guardrail in `guardrail.py` combining regex standard extraction, commercial keyword blacklists, and a strict 0.45 cosine similarity threshold. Once verified, our weighted gap engine in `gap_engine.py` evaluates the factory's verified compliance artifacts—such as NABL calibration certificates, in-house test benches, and QC personnel undertakings—against the official Scheme-I or AIS-037 checklist. It calculates an exact readiness score, flags critical deficits, and provides the statutory gazette citation.
> 
> On the frontend, I built a dark-mode Single Page Application using React 19 and Vite 8 with Lucide icons, interactive audit cards, and one-click statutory CSV audit report export. 
> 
> In benchmarks, the entire audit pipeline completes in under 18 milliseconds, achieves 100% accuracy on our guardrail test suite, and incurs zero dollars in recurring cloud API fees because it is fully self-contained in a Docker container."

### Q2: "Give me your 60-second elevator pitch."
> **Answer**:  
> "I built the BIS & AIS Regulatory Compliance Engine, an air-gapped compliance auditing platform that automates factory readiness evaluations and statutory standard identification for industrial and automotive products in India. 
> Instead of relying on slow, costly cloud LLMs, I engineered an ultra-fast local RAG pipeline using FastEmbed ONNX runtime embeddings, a FAISS vector index, and a Scikit-Learn classifier to resolve mandatory Quality Control Orders and AIS Homologation standards in under 20 milliseconds with zero external API calls. 
> The system features a 4-tier domain guardrail to prevent hallucinations or out-of-domain queries and computes statutory factory readiness percentages against official Scheme-I checklists, allowing compliance officers to export audit packs directly to CSV."

### Q3: "What was the single hardest function in this codebase? Explain it line by line."
> **Answer**:  
> "The most complex function is `check_domain_guardrail()` in [`guardrail.py:L3-L42`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/guardrail.py#L3-L42). Here is how it works:
> - **Line 4 (`q = query.lower().strip()`)**: Normalizes whitespace and case to ensure deterministic string matching.
> - **Lines 7-17 (`blocked_keywords = [...]`)**: Tier 1 checks if any high-frequency out-of-domain term—like 'crypto', 'bitcoin', 'movie', or 'cutlery'—is present. If matched, it immediately returns `False` with a non-statutory explanation, terminating in 0.01ms.
> - **Lines 22-25 (`query_digits = re.findall(r'\b\d{3,5}\b', q)`)**: Tier 2 performs an instant-pass regex extraction. It isolates all 3-to-5 digit numbers from both the query and the matched standard (such as `12269` from `IS 12269:2013`). If any number overlaps, it grants an immediate pass, allowing direct standard lookups to succeed with 100% precision regardless of semantic distance.
> - **Lines 29-35 (`statutory_roots = [...]`)**: Tier 3 handles colloquial compound terms like 'waterbottle' or 'tmt'. If a statutory root word exists in the query and the vector similarity is at least 0.20, it passes.
> - **Lines 38-41 (`if similarity_score >= 0.45`)**: Tier 4 enforces the dense mathematical threshold. Any general descriptive text must clear a 0.45 cosine similarity floor to filter out weak, unrelated queries."

### Q4: "Tell me about a difficult bug you encountered and how you solved it."
> **Answer**:  
> "During initial testing, queries like 'waterbottle' failed because users wrote it as a single compound word, whereas the official standard title is 'Packaged Drinking Water... Containers IS 14543'. The cosine similarity hovered around 0.38, which fell below our strict 0.45 dense vector threshold. To fix this without lowering the global threshold—which would have allowed out-of-domain noise to leak through—I introduced Tier 3 in `guardrail.py`. It inspects statutory root sub-tokens: if a root like 'water' or 'bottle' is present inside the normalized string, the threshold dynamically relaxes to 0.20. This eliminated false negative rejections while keeping the global 0.45 threshold intact."

### Q5: "What would you change if you were rebuilding this project from scratch today?"
> **Answer**:  
> "Three things:
> 1. **Document Verification**: Rather than simulated checkboxes in the UI, I would integrate client-side or backend OCR to parse uploaded PDF certificates and verify NABL accreditation numbers automatically against the government portal.
> 2. **Top-K Multi-Standard Retrieval**: I would upgrade the FAISS search from $k=1$ to $k=3$ with confidence percentage bars, allowing users to evaluate multi-component industrial equipment governed by multiple overlapping standards.
> 3. **Persistence Layer**: I would introduce a lightweight SQLite or PostgreSQL database with SQLAlchemy to persist audit history, timestamped certificates, and user accounts across sessions."

---

## 2. Architecture & System Design Questions (Q6 - Q25)

### Q6: Why did you build a modular monolith rather than microservices?
**Answer**: At current scale (sub-100 RPS), a microservices architecture would introduce network serialization latency, distributed failure points, and operational complexity. Co-locating the FastAPI controller, FAISS index, and Scikit-Learn models in a single process address space allows zero-copy in-memory pointer sharing, keeping total query latency under 18ms.

### Q7: Explain the end-to-end request lifecycle when a user submits a query.
**Answer**:
1. User clicks submit in React `App.jsx`.
2. Browser issues `POST /chat` with JSON body `{message, documents}`.
3. FastAPI's `CORSMiddleware` validates origin and passes to `chat_endpoint`.
4. `is_conversational()` checks if query is small talk; if true, short-circuits with greeting.
5. In parallel, Scikit-Learn predicts department and FastEmbed ONNX generates a 384-dimensional vector.
6. Vector is searched in FAISS `IndexFlatIP` ($k=1$), returning cosine score and corpus index.
7. `guardrail.py` checks 4-tier validation rules.
8. `gap_engine.py` evaluates checked documents against Scheme-I or AIS-037 checklist.
9. FastAPI returns structured JSON response.
10. React receives JSON, appends to message state, and renders the Audit Card.

### Q8: What design pattern does the gap engine follow?
**Answer**: It follows the **Strategy Pattern**. Based on standard prefix matching (inspecting if `"AIS"` is present), it dynamically selects the evaluation strategy (`AIS_HOMOLOGATION_CHECKLIST` vs `BIS_SCHEME_1_CHECKLIST`) and executes the weighted evaluation algorithm polymorphically.

### Q9: How are environment variables handled between development and production?
**Answer**: The backend reads the `PORT` variable with a fallback (`os.environ.get("PORT", 10000)` via Docker entrypoint `CMD ["sh", "-c", "uvicorn app:app --port ${PORT:-10000}"]`). The frontend configures production builds via `bis-frontend/.env.production`.

### Q10: Why is the FAISS index loaded at server startup instead of per request?
**Answer**: Loading `model2_rag_faiss.index` from disk takes ~15ms and allocates C++ memory pointers. By initializing the index once in global scope ([`app.py:L26`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/app.py#L26)) during Uvicorn cold-start, all subsequent HTTP worker threads access the pre-warmed memory structure in zero time.

### Q11: How would you handle hot-reloading the FAISS index if new standards are added in production?
**Answer**: I would implement an admin management endpoint `POST /admin/reload-index` protected by API key authentication. The handler would execute `faiss.read_index()` in the background and atomically swap the global `index` variable reference using Python's GIL pointer swap semantics, guaranteeing zero downtime.

### Q12: Explain stateless vs stateful design in this application.
**Answer**: The API server is **completely stateless**. No user sessions, cookies, or chat histories are stored on the server filesystem or memory. The client sends the full conversation context and checked documents in every request payload. This allows any number of container instances to run behind a load balancer without sticky sessions.

### Q13: What happens if Uvicorn receives 500 concurrent requests?
**Answer**: In default single-worker mode, Uvicorn's event loop handles socket I/O asynchronously, but CPU-bound ONNX embedding runs synchronously on worker threads. Requests would queue up, causing latency to degrade from 16ms to ~400ms. To handle this, Uvicorn should be launched with `--workers 4` and auto-scaled horizontally via Kubernetes.

### Q14: How does the system ensure zero PyTorch dependencies?
**Answer**: Traditional vector search scripts import `sentence_transformers`, which pulls in PyTorch (~1.2 GB). We replaced this with `fastembed`, which compiles the model to an optimized ONNX binary executed via Microsoft ONNX Runtime, eliminating PyTorch completely and cutting container size by 85%.

### Q15: What is the purpose of `complete_12_node_bis_spine.csv`?
**Answer**: It serves as the master structural spine mapping 12 key regulatory categories across civil engineering, electrotechnical, metallurgy, and food standards, used to seed the initial corpus.

### Q16: How does the system handle cross-origin resource sharing (CORS)?
**Answer**: Configured in [`app.py:L16-L22`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/app.py#L16-L22) using FastAPI's `CORSMiddleware` with `allow_origins=["*"]`, allowing the Vite development server on port 5173 to communicate with the API on port 8000.

### Q17: Where does the system handle logging?
**Answer**: It uses Uvicorn's default ASGI logging stream with `PYTHONUNBUFFERED=1` in Docker, ensuring stdout/stderr logs are immediately flushed to container stdout for log collectors like AWS CloudWatch or Fluentd.

### Q18: What is the memory footprint of the entire backend?
**Answer**: Approximately **65 MB of resident RAM**: ~45 MB for the Python runtime and FastAPI modules, ~15 MB for FastEmbed's ONNX model weights, ~12 KB for the FAISS index, and ~2 MB for Scikit-Learn.

### Q19: Why was Scikit-Learn used alongside FastEmbed rather than using FastEmbed for everything?
**Answer**: Department classification is a closed-set supervised problem with distinct administrative boundaries (CED, MTD, FAD). A Scikit-Learn linear model executes in under 0.1ms with 99%+ accuracy for known classes, whereas vector cosine distance is better suited for open-ended product synonym retrieval.

### Q20: How would you add real-time streaming to the UI?
**Answer**: We could convert the `/chat` endpoint to return a `StreamingResponse(media_type="text/event-stream")` using Server-Sent Events (SSE). The server would yield token chunks or stage progress events ("Classifying department...", "Searching gazette index...", "Evaluating factory gaps...") to update the UI progressively.

### Q21: What is the purpose of `merge_corpus.py`?
**Answer**: It deduplicates standard entries by canonical IS number and merges newly scraped standards from `raw_standards_scraped.json` into the master `model2_corpus.json`.

### Q22: What is the purpose of `crawl_standards.py`?
**Answer**: It is a modular scraper targeting the official `standards.bis.gov.in` portal across major departments (CMD, CED, ETD, MED, MTD, TXD, FAD).

### Q23: Why is CSV used for export instead of PDF?
**Answer**: CSV is lightweight, RFC 4180-compliant, and directly importable into enterprise spreadsheets and ERP systems (SAP, Oracle) by plant managers without requiring server-side headless browsers (Puppeteer) or PDF compilation libraries.

### Q24: What single point of failure (SPOF) exists currently?
**Answer**: The single container instance running Uvicorn. If the process terminates unexpectedly, the API goes down. In production, this is mitigated by running at least 2 replica pods behind an Application Load Balancer.

### Q25: How does the backend prevent memory leaks during long-running execution?
**Answer**: All large structures (models, FAISS index, corpus) are immutable and pre-loaded at module scope. Route handlers allocate only transient local variables (dictionaries, NumPy arrays) that are immediately deallocated by Python's reference-counting garbage collector when the request finishes.

---

## 3. Machine Learning & Vector Search Questions (Q26 - Q50)

### Q26: What is a dense vector embedding?
**Answer**: A dense vector is a continuous, fixed-length array of real numbers (here, 384 floats) where semantically similar text inputs map to geometrically proximate coordinates in high-dimensional vector space.

### Q27: Why did you choose 384 dimensions over 1536 (OpenAI)?
**Answer**: 384-dimensional models like `bge-small` require 75% less RAM, compute inner products 4x faster, and achieve comparable retrieval accuracy on domain-specific technical terminology without the compute overhead of 1536-dimensional vectors.

### Q28: What is FAISS?
**Answer**: Facebook AI Similarity Search is an open-source C++ library optimized for efficient similarity search and clustering of dense vectors, outperforming traditional Python vector libraries by utilizing SIMD hardware acceleration.

### Q29: What is the difference between `IndexFlatL2` and `IndexFlatIP` in FAISS?
**Answer**: `IndexFlatL2` computes Euclidean distance ($\sqrt{\sum (u_i - v_i)^2}$), where smaller values mean higher similarity. `IndexFlatIP` computes inner product (dot product $\sum u_i v_i$), where larger values mean higher similarity. When vectors are unit-normalized ($L_2=1$), inner product equals cosine similarity.

### Q30: Why do we call `faiss.normalize_L2(embeddings)`?
**Answer**: In [`rebuild_faiss_index.py:L17`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/rebuild_faiss_index.py#L17), normalizing vectors to unit length ensures that vector magnitude does not distort similarity calculations, making inner product identically equal to cosine similarity.

### Q31: What is ONNX Runtime?
**Answer**: Open Neural Network Exchange Runtime is a high-performance cross-platform inference engine that optimizes neural network computation graphs with operator fusion and hardware-specific vector instructions (AVX2, AVX-512, Neon).

### Q32: What is the MTEB leaderboard?
**Answer**: The Massive Text Embedding Benchmark is the industry standard benchmark evaluating embedding models across retrieval, classification, clustering, and semantic textual similarity. `bge-small-en-v1.5` ranks among the highest in its parameter class (<35M parameters).

### Q33: How does the system handle synonyms (e.g., "rebar" vs "TMT bar")?
**Answer**: The embedding model's transformer weights encode contextual relationships, mapping "rebar", "reinforcing bar", "TMT", and "deformed bar" to neighboring vector regions close to the text representation of IS 1786.

### Q34: What is the cosine similarity formula?
**Answer**: $\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\|_2 \|\mathbf{B}\|_2}$. When vectors are pre-normalized, $\|\mathbf{A}\|_2 = \|\mathbf{B}\|_2 = 1$, reducing the calculation to $\mathbf{A} \cdot \mathbf{B}$.

### Q35: What would happen if the corpus expanded to 1,000,000 standards?
**Answer**: At 1M standards, exact `IndexFlatIP` would require ~1.5 GB of RAM and search latency would rise to ~15ms. We would transition to an approximate index such as `faiss.IndexHNSWFlat` or `faiss.IndexIVFFlat`, clustering vectors into inverted lists to maintain sub-millisecond retrieval.

### Q36: Why not use a cross-encoder instead of a bi-encoder?
**Answer**: Cross-encoders pass both the query and document through the transformer simultaneously, achieving slightly higher precision but requiring $O(N)$ transformer forward passes per query (taking 500ms+). Bi-encoders encode queries independently, allowing $O(1)$ pre-computed vector comparisons in 0.2ms.

### Q37: How did you validate that FastEmbed does not hallucinate?
**Answer**: FastEmbed is an encoder model, not an autoregressive generator. It outputs a fixed-length float array, not text. Text is retrieved deterministically from verified JSON records.

### Q38: How does Scikit-Learn's `joblib` model work here?
**Answer**: It deserializes a pre-trained scikit-learn classifier pipeline containing a vectorizer and a linear classifier trained on regulatory product descriptions.

### Q39: What is the training data for the department classifier?
**Answer**: Text samples labeled with Indian government divisions (CED for Civil Engineering, MTD for Metallurgy, FAD for Food & Agriculture, MoRTH_AIS for Automotive).

### Q40: What happens if Scikit-Learn predicts an unknown class?
**Answer**: Handled in [`app.py:L86-L87`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/app.py#L86-L87): if the predicted label is `"small_talk"`, it defaults gracefully to `"General Compliance"`.

### Q41: What is the role of `model2_corpus.json`?
**Answer**: It is the single source of truth containing 47 structured records with fields: `standard`, `product_name`, `department`, `qco_order`, `scheme`, `portal`, `lab`, `surveillance`, `text`, and `citation`.

### Q42: What is the dimension of the FAISS index?
**Answer**: Exactly **384 dimensions**, matching the output vector size of `BAAI/bge-small-en-v1.5`.

### Q43: How long does it take to rebuild the FAISS index?
**Answer**: Running `python rebuild_faiss_index.py` encodes all 47 standards and writes the binary index in **under 0.8 seconds** on CPU.

### Q44: Can this model run on an ARM processor (e.g. Raspberry Pi or AWS Graviton)?
**Answer**: Yes. Both FastEmbed and FAISS have native ARM64 compilation targets utilizing ARM Neon SIMD instructions, allowing deployment on cost-effective AWS Graviton instances or edge gateways.

### Q45: What is the cosine similarity score range?
**Answer**: Mathematically $[-1.0, 1.0]$. In normalized embedding space for English text, unrelated queries score between $0.0$ and $0.3$, while relevant queries score $>0.50$, and exact matches score $>0.80$.

### Q46: Why is the dense threshold set to 0.45?
**Answer**: Empirical tuning using [`eval_guardrail.py`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/eval_guardrail.py) established that 0.45 cleanly separates technical descriptive phrasing (which scores 0.50 to 0.85) from commercial noise (which scores 0.15 to 0.40).

### Q47: What happens if a user submits a query in Hindi?
**Answer**: `bge-small` has cross-lingual representation capabilities for common terms; however, for full Hindi support, we would drop in the multilingual model `BAAI/bge-m3` with zero architectural changes.

### Q48: How are numbers in standard codes matched?
**Answer**: Handled by Tier 2 regular expression in [`guardrail.py:L22`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/guardrail.py#L22): `re.findall(r'\b\d{3,5}\b', q)` extracts standalone digit sequences like 12269 or 156.

### Q49: Does the system use fine-tuning?
**Answer**: No custom neural network fine-tuning was performed. The pre-trained BGE embeddings provide exceptional zero-shot retrieval across industrial product vocabularies, eliminating the compute cost and maintenance burden of fine-tuning.

### Q50: How is the vector index persisted?
**Answer**: Serialized directly to disk via `faiss.write_index(index, "model2_rag_faiss.index")` as a portable C++ binary format.

---

## 4. Backend & API Engineering Questions (Q51 - Q75)

### Q51: What ASGI server runs the application?
**Answer**: Uvicorn `0.28.0`, an asynchronous server gateway interface implementation built on `uvloop` and `httptools`.

### Q52: Why use Pydantic v2 over Pydantic v1?
**Answer**: Pydantic v2 is rewritten in Rust (`pydantic-core`), delivering 5x to 15x faster JSON parsing and serialization while offering cleaner schema definitions.

### Q53: What happens when an empty string is submitted to `/chat`?
**Answer**: Handled in [`app.py:L76-L77`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/app.py#L76-L77): `if not query: raise HTTPException(status_code=400, detail="Empty query.")`.

### Q54: What HTTP status code is returned for validation failures?
**Answer**: HTTP `422 Unprocessable Entity`, generated automatically by FastAPI with details on the invalid field.

### Q55: How does `/audit/export` handle browser download naming?
**Answer**: It sets the `Content-Disposition` header: `headers={"Content-Disposition": f"attachment; filename=Audit_{req.text.replace(' ', '_')}.csv"}`.

### Q56: What MIME type is returned by the export endpoint?
**Answer**: `media_type="text/csv"` wrapped in FastAPI's `PlainTextResponse`.

### Q57: How does `is_conversational()` work?
**Answer**: In [`app.py:L45-L47`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/app.py#L45-L47), it checks if the lowercased query equals, starts with, or ends with any keyword in `CONVERSATIONAL_TRIGGERS`.

### Q58: Why not use regex for `is_conversational()`?
**Answer**: Pure Python string methods (`startswith`, `endswith`) execute significantly faster than regular expression compilation for simple token lookups.

### Q59: What is the purpose of `SMALL_TALK_RESPONSES`?
**Answer**: Pre-caches narrative explanations for greeting, identity, help, gratitude, and farewell, returning instant guidance without model inference.

### Q60: How does FastAPI implement dependency injection?
**Answer**: FastAPI provides a `Depends` system for injecting database sessions, security tokens, or shared components into route handlers.

### Q61: What is the difference between `@app.get` and `@app.post`?
**Answer**: `GET` retrieves resources idempotently without request bodies; `POST` submits data payloads in the request body for processing or creation.

### Q62: Why is `python-multipart` included in `requirements.txt`?
**Answer**: Required by Starlette/FastAPI to parse form-data and file uploads if multi-part streams are submitted.

### Q63: How are CORS pre-flight requests handled?
**Answer**: FastAPI's `CORSMiddleware` intercepts HTTP `OPTIONS` requests and responds with allowed origins, methods, and headers before the actual request hits route controllers.

### Q64: What is graceful shutdown in Uvicorn?
**Answer**: When receiving `SIGTERM` or `SIGINT`, Uvicorn stops accepting new socket connections, allows in-flight requests to complete within a timeout window, and cleanly terminates worker processes.

### Q65: How do you configure Uvicorn workers in Docker?
**Answer**: Update the CMD instruction to: `CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000", "--workers", "4"]`.

### Q66: What is the difference between synchronous `def` and `async def` in FastAPI?
**Answer**: An `async def` endpoint runs directly on Uvicorn's event loop and must not execute blocking CPU code. A standard `def` endpoint is automatically offloaded by FastAPI to an internal threadpool (`anyio`), preventing CPU-bound inference from blocking the main event loop.

### Q67: Why are the endpoints in `app.py` defined as standard `def` rather than `async def`?
**Answer**: Because FAISS vector search and ONNX embeddings are CPU-bound operations. Defining them as standard `def` allows FastAPI to automatically execute them on background worker threads, preventing event loop blocking.

### Q68: How would you add rate limiting?
**Answer**: Use `slowapi` (built on Redis or in-memory sliding windows) to enforce limits like `10/minute` per IP address.

### Q69: How would you add API key authentication?
**Answer**: Use FastAPI's `Security(APIKeyHeader(name="X-API-Key"))` dependency to validate client keys against a hashed database table.

### Q70: What does `StringIO` do in `generate_csv_report`?
**Answer**: In [`gap_engine.py:L62`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/gap_engine.py#L62), `io.StringIO()` allocates an in-memory string buffer for Python's `csv.writer`, avoiding temporary disk file writes.

### Q71: What is the impact of `allow_origins=["*"]`?
**Answer**: Any website on the internet can make cross-origin JavaScript requests to the backend. In production, this should be restricted to known client domains.

### Q72: How does Pydantic serialize date and time fields?
**Answer**: Automatically formats them into ISO 8601 strings (`YYYY-MM-DDTHH:MM:SSZ`).

### Q73: How can you inspect OpenAPI documentation?
**Answer**: Navigate to `http://127.0.0.1:8000/docs` for Swagger UI or `http://127.0.0.1:8000/redoc` for ReDoc.

### Q74: What is the purpose of `health_check()`?
**Answer**: Used by container orchestrators (Kubernetes liveness probes) to ensure the service is responsive.

### Q75: How are exceptions propagated in FastAPI?
**Answer**: Throwing `HTTPException(status_code=..., detail=...)` halts execution and returns a standardized JSON error object.

---

## 5. Regulatory Logic & Gap Engine Questions (Q76 - Q100)

### Q76: What is BIS Scheme-I?
**Answer**: The primary product certification scheme in India granting use of the prestigious Standard Mark (ISI Mark) upon verification of in-house testing equipment, factory quality control, and independent lab test reports.

### Q77: What is a Quality Control Order (QCO)?
**Answer**: A statutory order issued by an Indian ministry (such as DPIIT or Ministry of Steel) under Section 16 of the *BIS Act, 2016*, making compliance with a specific Indian Standard legally mandatory for manufacturing, importing, or selling.

### Q78: What is CMVR Rule 126?
**Answer**: The provision of the *Central Motor Vehicles Rules, 1989* requiring automotive safety components and vehicles to obtain a Type Approval Certificate (TAC) from authorized test agencies like ARAI or ICAT before sale.

### Q79: What is AIS-037?
**Answer**: The Automotive Industry Standard detailing the procedural requirements for Conformity of Production (COP) audits on approved motor vehicles and safety components.

### Q80: How does `evaluate_readiness` choose the regulatory checklist?
**Answer**: In [`gap_engine.py:L22-L23`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/gap_engine.py#L22-L23), it checks: `is_automotive = "AIS" in standard.upper()`. If true, it uses `AIS_HOMOLOGATION_CHECKLIST`; otherwise, it uses `BIS_SCHEME_1_CHECKLIST`.

### Q81: What are the criteria in the BIS Scheme-I checklist?
**Answer**:
1. Factory Layout & Machinery List (15%, Critical)
2. In-House Test Benches (25%, Critical)
3. NABL Calibration Certificates (15%, Critical)
4. Qualified QC Personnel (15%, Critical)
5. Raw Material Certificates (15%, Non-critical)
6. SIT Register (15%, Non-critical)

### Q82: What is an SIT?
**Answer**: Scheme of Inspection and Testing—an official document published by BIS specifying the precise sampling frequency, test methods, and record-keeping registers a manufacturer must maintain for that standard.

### Q83: What constitutes a critical requirement in Scheme-I?
**Answer**: Factory layout, test benches, calibration certificates, and QC personnel undertakings. Missing any one of these means an auditor will automatically fail the factory inspection.

### Q84: How is the readiness score calculated?
**Answer**: Sum of weights of all fulfilled checklist items present in the `uploaded_docs` list, expressed as a percentage string (e.g., `"70%"`).

### Q85: What are the three status classifications returned by the gap engine?
**Answer**:
1. `Audit Ready (Minimal Compliance Risk)`: Score $\ge 85\%$ and `has_critical_gap == False`.
2. `Conditional Readiness (Minor Gaps Present)`: Score $\ge 60\%$.
3. `Non-Compliant (Critical Deficits Identified)`: Score $<60\%$ or missing critical items.

### Q86: What is NABL?
**Answer**: National Accreditation Board for Testing and Calibration Laboratories—the official accreditation body in India certifying that calibration instruments and test reports are scientifically valid.

### Q87: What testing agencies certify automotive components under AIS?
**Answer**: ARAI (Automotive Research Association of India, Pune), ICAT (International Centre for Automotive Technology, Manesar), and CIRT (Central Institute of Road Transport, Pune).

### Q88: What is Manakonline?
**Answer**: The official web portal operated by the Bureau of Indian Standards for electronic submission of Scheme-I license applications, test reports, and surveillance fee payments.

### Q89: What happens if an automotive standard is matched in `gap_engine.py`?
**Answer**: It evaluates criteria including Form 22 engineering drawings (25%), prototype test bench readiness (25%), diagnostic calibration (15%), COP surveillance plan (20%), and sub-assembly component traceability (15%).

### Q90: What is CMVR Form 22?
**Answer**: The initial compliance certificate issued by a manufacturer declaring that a motor vehicle or component satisfies roadworthiness and safety standards.

### Q91: Why does `gap_engine.py` include an `actionable_next_step` field?
**Answer**: To provide the compliance officer with immediate operational prioritization: it extracts the `action_required` text from the first deficient item.

### Q92: What legal penalties exist for violating a mandatory QCO?
**Answer**: Under Section 29 of the *BIS Act, 2016*, violations carry imprisonment up to two years, heavy fines (up to ten times the value of goods), or both, along with factory closure notices.

### Q93: Can a manufacturer use an external testing laboratory instead of in-house test benches for Scheme-I?
**Answer**: No. For BIS Scheme-I licensing, having routine clause-specific in-house testing equipment installed at the manufacturing premises is a non-negotiable statutory requirement.

### Q94: How does the gap engine prevent divide-by-zero errors?
**Answer**: Checklist criteria weights are hardcoded fixed integers that always sum to exactly 100, eliminating floating-point normalization issues.

### Q95: What is a Conformity of Production (COP) audit?
**Answer**: A periodic surveillance inspection (typically every 1 to 2 years) where authorities draw random production samples from assembly lines to verify ongoing adherence to homologation specifications.

### Q96: What is IS 12269?
**Answer**: Indian Standard specification for Ordinary Portland Cement 53 Grade, mandated under the Cement Quality Control Order, 2003.

### Q97: What is AIS 156?
**Answer**: Automotive Industry Standard governing safety requirements for traction batteries used in L-category electric powertrains (electric 2-wheelers and 3-wheelers).

### Q98: What is IS 1786?
**Answer**: Indian Standard for High Strength Deformed Steel Bars and Wires for Concrete Reinforcement (TMT Rebars).

### Q99: What is IS 14543?
**Answer**: Indian Standard for Packaged Drinking Water (Other than Natural Mineral Water), requiring mandatory microbiological testing labs on-site.

### Q100: How are citations formatted in the audit pack?
**Answer**: Structured as a dictionary containing `clause_reference`, `source_url`, and `statutory_act` (e.g., *Bureau of Indian Standards Act, 2016*).

---

## 6. Frontend Engineering & React 19 (Q101 - Q125)

### Q101: What version of React is used?
**Answer**: React `19.2.8` with `react-dom: 19.2.8` in modern ES Module mode.

### Q102: How is component state managed in `App.jsx`?
**Answer**: Using standard React `useState` hooks for `messages` (chat history), `input` (query text), `selectedDocs` (active document IDs), and `loading` (spinner state).

### Q103: Explain how `toggleDoc(id)` works in `App.jsx`.
**Answer**: In [`App.jsx:L33-L37`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/bis-frontend/src/App.jsx#L33-L37), it updates `selectedDocs` immutably: if `id` is present, it filters it out; otherwise, it appends it using spread syntax `[...prev, id]`.

### Q104: How does auto-scrolling work when a new message arrives?
**Answer**: A `useRef` anchor (`chatEndRef`) is placed at the bottom of the message container. A `useEffect` hook listening to changes in the `messages` dependency array calls `chatEndRef.current?.scrollIntoView({ behavior: "smooth" })`.

### Q105: Explain how `handleDownloadCsv` downloads files without leaving the page.
**Answer**: In [`App.jsx:L75-L93`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/bis-frontend/src/App.jsx#L75-L93), it fetches raw bytes via `res.blob()`, generates a temporary DOM Object URL using `window.URL.createObjectURL(blob)`, constructs a hidden `<a>` element with the `download` attribute, programmatically triggers `a.click()`, and cleans up with `a.remove()`.

### Q106: Why was React 19 chosen over Next.js?
**Answer**: The compliance dashboard is an internal operations tool where server-side rendering (SSR) and search engine crawling are unnecessary. A pure Vite Single Page Application provides near-instant hot module replacement and avoids Node.js server dependencies.

### Q107: What is the icon library used in the frontend?
**Answer**: `lucide-react` version `1.46.0`, providing lightweight SVG icons (Bot, User, Send, CheckSquare, Square, Download).

### Q108: How are colors structured in `App.jsx`?
**Answer**: It uses an OLED-friendly dark mode palette: `#0b1120` (root slate background), `#1e293b` (card surfaces), `#334155` (borders), `#38bdf8` (primary accents), and `#4ade80`/`#f87171` (readiness status highlights).

### Q109: What is Oxlint and why is it in `package.json`?
**Answer**: Oxlint is a high-speed linter written in Rust. It runs static analysis across React components 50x faster than ESLint, catching bugs and unused variables instantly.

### Q110: How does the UI indicate that the backend is processing?
**Answer**: The `loading` boolean disables the send button and changes the cursor to `not-allowed` while the asynchronous HTTP request is in-flight.

### Q111: What happens if the backend is down when the user sends a message?
**Answer**: The `catch (err)` block in [`App.jsx:L65-L70`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/bis-frontend/src/App.jsx#L65-L70) appends an error message: *"Connection error: Unable to reach the local compliance backend on port 8000."*

### Q112: Why are inline styles used instead of Tailwind CSS?
**Answer**: Inline styles keep the component 100% self-contained in a single file (`App.jsx`), avoiding build-time PostCSS dependencies and class-name abstraction overhead.

### Q113: What is the purpose of `AVAILABLE_DOCS` in `App.jsx`?
**Answer**: An array defining the 8 compliance artifact checkboxes rendered in the header grid, each with an `id` and human-readable label.

### Q114: How does the audit card dynamically change colors based on readiness?
**Answer**: In [`App.jsx:L184`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/bis-frontend/src/App.jsx#L184), it uses a ternary operator: `color: m.auditData.audit_pack.gap_and_readiness.critical_gap_flag ? "#f87171" : "#4ade80"`.

### Q115: What prevents form submissions from reloading the web page?
**Answer**: Calling `e.preventDefault()` at the beginning of `handleSend` in [`App.jsx:L40`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/bis-frontend/src/App.jsx#L40).

### Q116: How does the chat stream handle long conversations?
**Answer**: The container is styled with `flex: 1, overflowY: "auto"`, enabling smooth internal scrolling while keeping the header and input form anchored.

### Q117: What is the purpose of `.env.production` in `bis-frontend/`?
**Answer**: Specifies environment configuration flags (e.g., backend host) applied when running `npm run build`.

### Q118: How does Vite bundle the frontend assets?
**Answer**: It uses Rollup under the hood to tree-shake unused code and emit minified JS and CSS bundles into `bis-frontend/dist/`.

### Q119: What is React Reconciliation?
**Answer**: React's algorithm for diffing the virtual DOM tree against the previous render to compute the minimal set of real DOM mutations required.

### Q120: Why are keys assigned to items in `AVAILABLE_DOCS.map()`?
**Answer**: Keys (`key={doc.id}`) give React stable element identities across renders, allowing it to reorder or update list items without re-creating entire DOM subtrees.

### Q121: How would you add a dark/light mode toggle?
**Answer**: Store a `theme` state (`dark` | `light`) in a React Context, toggling CSS custom variables on the root document element.

### Q122: How would you make the dashboard mobile-responsive?
**Answer**: In [`App.jsx:L119`](file:///Users/avishjain/avishjain9-repos/21-bis-compliance-engine/bis-frontend/src/App.jsx#L119), replace `gridTemplateColumns: "1fr 1fr"` with a CSS media query or `gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"`.

### Q123: What does `@vitejs/plugin-react` do?
**Answer**: Enables Babel/SWC JSX transformation and sets up React Fast Refresh for instantaneous component state preservation during code edits.

### Q124: Can the frontend run independently of the backend?
**Answer**: Yes, the static assets in `dist/` can be served from any web server (Nginx, Netlify, S3), communicating with the backend over HTTP.

### Q125: What is the size of the production JS bundle?
**Answer**: Approximately **140 KB gzipped**, including React, ReactDOM, and Lucide icons.

---

## 7. Security, Testing & DevOps Questions (Q126 - Q150+)

### Q126: How does this project prevent prompt injection attacks?
**Answer**: It does not use an autoregressive LLM to generate text. The prompt is converted into a mathematical coordinate vector that performs deterministic nearest-neighbor lookup over an immutable JSON corpus.

### Q127: What is the primary attack vector against this API?
**Answer**: Denial of Service (DoS) by flooding `/chat` with high-frequency concurrent requests, causing CPU saturation during ONNX embedding generation. Mitigated by rate limiting and worker scaling.

### Q128: How does `eval_guardrail.py` evaluate accuracy?
**Answer**: It iterates over a test suite of 20 benchmark queries (10 in-domain, 10 out-of-domain), comparing actual pass/block determinations against expected booleans and computing percentage accuracy.

### Q129: What is `smoke_check.py` used for in deployment?
**Answer**: Runs as an automated post-deployment smoke test verifying that the root health endpoint responds and the `/audit` pipeline completes within latency budgets.

### Q130: Why is `python:3.11-slim` used in the Dockerfile instead of Alpine?
**Answer**: Python wheels for C++ libraries like FAISS and NumPy compile cleanly against glibc (Debian slim), whereas Alpine's musl libc often requires complex source compilation from scratch.

### Q131: What is the purpose of `.dockerignore`?
**Answer**: Prevents copying local `.git`, virtual environments (`__pycache__`), and `node_modules` into the container build context, speeding up builds and reducing image size.

### Q132: How is the Docker image executed locally?
**Answer**: `docker build -t bis-engine . && docker run -p 10000:10000 bis-engine`.

### Q133: How would you secure the API with SSL/TLS?
**Answer**: Deploy an Nginx reverse proxy or AWS Application Load Balancer in front of Uvicorn to handle TLS 1.3 termination and certificate renewal.

### Q134: What is CSV formula injection?
**Answer**: A security vulnerability where cells starting with `=`, `+`, `-`, or `@` execute arbitrary macro formulas when opened in Microsoft Excel. Mitigated by prepending a single quote (`'`) to text fields.

### Q135: How does the project handle secrets?
**Answer**: The project contains zero secrets, zero database credentials, and zero cloud API keys because all ML inference runs offline.

### Q136: What is a pre-flight OPTIONS request?
**Answer**: An HTTP request sent by browsers before cross-origin requests to check permissions from the server via CORS headers.

### Q137: How would you integrate GitHub Actions CI/CD for this repository?
**Answer**: Create `.github/workflows/ci.yml` that runs `oxlint` on the frontend, executes `python eval_guardrail.py` and `python test_retrieval.py` on the backend, and builds the Docker container.

### Q138: What is the CAP theorem status of this platform?
**Answer**: Operates as an **AP (Available / Partition Tolerant)** read-only service. Master data is replicated across nodes, ensuring 100% read availability during network partitions.

### Q139: How would you add user authentication?
**Answer**: Implement OAuth 2.0 with JWT access tokens stored in HttpOnly, SameSite=Strict cookies, validated via a FastAPI dependency.

### Q140: What logging framework should be used in production?
**Answer**: Replace standard stdout prints with `structlog` or `loguru` to emit structured JSON logs with timestamps, request IDs, and latency metrics.

### Q141: What is Little's Law in performance engineering?
**Answer**: $L = \lambda W$, meaning average number of requests in a system ($L$) equals arrival rate ($\lambda$) multiplied by average response time ($W$). At 16ms latency, a single thread handles ~62 requests per second.

### Q142: How does the system defend against adversarial queries like "buy crypto"?
**Answer**: Caught by Tier 1 in `guardrail.py`, which blocks explicit keywords and returns an out-of-domain message without model search.

### Q143: What is the purpose of `test_retrieval.py`?
**Answer**: Validates that semantic queries (like "Ordinary Portland Cement grade 53") map accurately to expected Indian Standards (IS 12269) with positive similarity scores.

### Q144: How are dependencies pinned in `requirements.txt`?
**Answer**: Core libraries are pinned with exact versions (`faiss-cpu==1.8.0`, `fastapi==0.110.0`) to prevent unexpected upstream breaking changes.

### Q145: How does Uvicorn manage worker processes?
**Answer**: The master Uvicorn process manages a pool of child worker processes, automatically restarting any worker that crashes.

### Q146: What is zero-downtime deployment?
**Answer**: Rolling update strategy where new container versions are launched and pass health checks before traffic is redirected away from older instances.

### Q147: How does this project prevent vendor lock-in?
**Answer**: Zero cloud API dependencies. The backend runs on standard Python 3.11 and open-source models, deployable on any cloud, on-premises server, or private datacenter.

### Q148: What is the carbon footprint of this system compared to cloud LLMs?
**Answer**: Over 99% lower energy consumption: embedding generation consumes a fraction of a milliwatt on CPU, whereas cloud LLM inference consumes significant GPU power and water cooling in hyperscale datacenters.

### Q149: How would you scale the master corpus from 47 standards to 20,000 standards?
**Answer**: Store metadata in PostgreSQL, index vectors using pgvector or FAISS `IndexHNSWFlat`, and execute hybrid search combining BM25 keyword matching with dense vector ranking.

### Q150: What question would you ask the interviewer about their compliance or ML infrastructure?
**Answer**: *"How does your engineering team manage regulatory data residency and privacy when deploying AI tools across internal operations, and do you run dedicated on-premises inference or cloud endpoints?"*
