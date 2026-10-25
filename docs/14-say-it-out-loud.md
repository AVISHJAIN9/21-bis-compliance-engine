# Consolidated Spoken Scripts & Interview Rehearsal Guide

This single reference document compiles every first-person spoken script across the platform. Use this page to rehearse answering technical interview questions out loud without notes.

---

## 1. Project Pitches

### 30-Second Elevator Pitch
> "I built the **BIS & AIS Regulatory Compliance Engine**, an air-gapped compliance auditing platform that automates factory readiness evaluations and statutory standard identification for industrial and automotive products in India. 
> 
> Instead of relying on slow, costly cloud LLMs, I engineered an ultra-fast local RAG pipeline using FastEmbed ONNX runtime embeddings, a FAISS vector index, and a Scikit-Learn classifier to resolve mandatory Quality Control Orders and AIS Homologation standards in under 20 milliseconds with zero external API calls. 
> 
> The system features a 4-tier domain guardrail to prevent hallucinations or out-of-domain queries and computes statutory factory readiness percentages against official Scheme-I checklists, allowing compliance officers to export audit packs directly to CSV."

### 2-Minute Technical Pitch
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

## 2. Feature-by-Feature Spoken Scripts

### Feature F1: Semantic Standard Identification (Dense Vector RAG)
> "I built the Semantic Standard Identification feature so that manufacturers and compliance officers don't have to manually comb through hundreds of Indian Standard gazettes to figure out which statutory rules apply to their product. 
> 
> When a user enters a product description like 'Ordinary Portland Cement 53 Grade' into the chat box in App.jsx, the frontend sends an HTTP POST request to the /chat endpoint in app.py. The backend takes that text and passes it to an air-gapped FastEmbed model running BAAI/bge-small-en-v1.5 on CPU via ONNX Runtime. This converts the text into a 384-dimensional dense vector in about fourteen milliseconds without making any external cloud API calls. Next, that vector is passed to a FAISS IndexFlatIP vector index, which computes the inner product cosine similarity against our pre-indexed master corpus in model2_corpus.json in less than a millisecond. In parallel, our serialized Scikit-Learn model bis_product_department_model_v3.pkl predicts the governing department, such as Civil Engineering or Automotive Homologation.
> 
> I chose this local ONNX and FAISS architecture over a third-party LLM API like OpenAI because industrial clients require complete confidentiality for unreleased products, and local embeddings guarantee zero token costs and sub-twenty-millisecond response times. If the user submits an empty string, the API throws an HTTP 400 validation error, and if the query doesn't match any statutory regulatory scope, our downstream guardrail catches it. 
> 
> One honest limitation right now is that the retrieval is set to k equals one, which only returns the single top standard; in the next version, I plan to expose the top-three candidate standards with confidence bars so users can evaluate composite products."

### Feature F2: Regulatory Guardrailing & Out-of-Domain Filter
> "I built the Regulatory Guardrail feature to solve a classic problem with vector search: cosine similarity will always return a nearest neighbor even if the user asks something completely ridiculous like 'what is the price of bitcoin' or 'give me a recipe for pizza.' Without a guardrail, the system would hallucinate an official Indian Standard for unregulated goods.
> 
> In app.py, right after FAISS returns the top-matching standard and its similarity score, the query is passed into check_domain_guardrail in guardrail.py. I designed this as a four-tier filtering pipeline. In tier one, it scans against a blacklist of non-statutory commercial terms like cryptocurrency, entertainment, or dining cutlery. In tier two, if the user explicitly typed a three-to-five digit standard number like 12269 or 156, it uses a regular expression to give an instant pass. In tier three, it looks for core statutory keywords like cement, rebar, or battery; if one is present and the vector similarity is at least 0.20, it passes. Finally, in tier four, any generalized product description must clear a dense semantic similarity threshold of 0.45.
> 
> I chose this hybrid approach of rule-based regex combined with vector scoring over an LLM-based safety checker because it executes in less than a tenth of a millisecond and requires zero tokens or GPU memory. When a query fails, the backend returns a polite explanation stating that the product does not fall under statutory BIS or AIS mandates and suppresses the audit pack. 
> 
> One trade-off is that very novel or emerging products that don't share our defined roots might require tuning the 0.45 similarity threshold."

### Feature F3: Factory Readiness & Gap Analysis Engine
> "I built the Factory Readiness Gap Engine so that factories don't just find out which standard applies, but know exactly whether they can pass a surprise government audit tomorrow morning.
> 
> In gap_engine.py, the evaluate_readiness function dynamically detects whether the identified standard belongs to Bureau of Indian Standards Scheme-I or Automotive Industry Standards Homologation. If the standard contains the letters 'AIS', it activates our automotive checklist; otherwise, it defaults to the BIS Scheme-I checklist. It then matches the factory's verified artifacts against weighted criteria totaling one hundred percent. For example, under BIS Scheme-I, having clause-specific in-house test benches carries twenty-five percent weight, while valid NABL calibration certificates carry fifteen percent. If any mandatory item marked critical is missing, the engine automatically flags a critical deficit and drops the status to Non-Compliant, even if the factory has a passing numerical score.
> 
> I selected a transparent, deterministic rule-based scoring engine instead of an LLM because compliance calculations must be completely mathematically reproducible and auditable in legal proceedings. 
> 
> When evaluated, the engine returns an exact percentage, a list of specific missing items, and the exact remediation action, which renders live on the React frontend. One limitation is that currently documents are verified via checkbox selection; in future releases, we plan to parse uploaded PDF certificates using optical character recognition to verify NABL accreditation numbers automatically."

### Feature F4: Statutory Audit Pack CSV Export
> "I built the Statutory Audit Pack Export feature so that quality managers can immediately download an official compliance record and share it with plant managers or regulatory inspectors without doing manual data entry.
> 
> When the user clicks the Export CSV button on an audit card in App.jsx, the frontend issues a POST request to /audit/export in app.py, carrying the query text and the list of checked factory documents. The backend retrieves the matched standard from FAISS, computes the gap evaluation, and calls generate_csv_report in gap_engine.py. This function utilizes Python's native csv writer and StringIO to structure the report with the official standard title, Quality Control Order notification, assigned NABL laboratory, computed readiness score, and an itemized breakdown of every missing document along with its specific remedial action. The backend streams this as a plain text response with a text/csv MIME type and a Content-Disposition attachment header. The frontend turns the stream into a dynamic browser Blob URL and triggers an automatic download.
> 
> I chose CSV over PDF for the initial release because compliance officers and operations managers need to import audit findings directly into enterprise Excel trackers and ERP systems. 
> 
> One limitation is that it currently only outputs CSV; adding a styled PDF export with official QR code verification is our next planned milestone."

### Feature F5: Conversational Compliance Officer
> "I built the Conversational Compliance Officer feature because in real-world usage, users don't always start by typing a rigid product code; they often begin with 'hello', 'who are you', or 'how do I use this.' 
> 
> In app.py, before executing the Scikit-Learn classifier or generating dense ONNX embeddings, the chat endpoint passes the raw message to is_conversational. This helper checks if the query matches our list of conversational triggers like 'namaste', 'help', or 'thanks'. If a match is found, resolve_small_talk routes the prompt to a pre-defined regulatory guidance message. For instance, if the user asks 'who are you', it immediately clarifies that it is an air-gapped compliance officer built to audit products against Indian Standards and Automotive AIS regulations, and gives them examples of valid queries like 'Portland Pozzolana Cement.'
> 
> I chose this rule-based short-circuit rather than letting an embedding model process small talk because it executes in less than a microsecond, eliminates unnecessary vector computation, and prevents the system from accidentally matching 'hello' to a random steel or chemical standard. 
> 
> When it responds, it sets the audit data field to null so the frontend displays a clean narrative bubble without rendering an empty audit card."

---

## 3. Rehearsal Checklist

Tick each box once you have explained the topic out loud, in simple spoken English without consulting notes, within the target duration:

- [ ] **30-Second Elevator Pitch** *(Target: ~30 seconds)*
- [ ] **2-Minute Technical Walkthrough** *(Target: ~110-120 seconds)*
- [ ] **Feature F1: Semantic Standard Identification RAG** *(Target: ~60-75 seconds)*
- [ ] **Feature F2: Regulatory Guardrailing & Out-of-Domain Filter** *(Target: ~45-60 seconds)*
- [ ] **Feature F3: Factory Readiness Gap Engine** *(Target: ~60-75 seconds)*
- [ ] **Feature F4: Statutory Audit Pack CSV Export** *(Target: ~40-50 seconds)*
- [ ] **Feature F5: Conversational Intent Resolver** *(Target: ~35-45 seconds)*
- [ ] **"Why Air-Gapped ONNX over OpenAI Cloud APIs?"** *(Target: ~45 seconds)*
- [ ] **"How the System Scales to 1,000 req/sec"** *(Target: ~60 seconds)*
