import numpy as np
import json
import joblib
import faiss
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import List, Optional
from fastembed import TextEmbedding
from gap_engine import evaluate_readiness, generate_csv_report
from guardrail import check_domain_guardrail

app = FastAPI(title="BIS & AIS Compliance Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
dept_model = joblib.load("bis_product_department_model_v3.pkl")
index = faiss.read_index("model2_rag_faiss.index")

with open("model2_corpus.json", "r") as f:
    corpus = json.load(f)

SMALL_TALK_RESPONSES = {
    "greeting": "Namaste! I am your regulatory compliance assistant. You can ask me to evaluate industrial products under BIS Scheme-I or automotive safety components under AIS Homologation.",
    "identity": "I am an air-gapped compliance officer built to audit products against Indian Standards (IS/QCO) and Automotive Industry Standards (AIS/CMVR Rule 126).",
    "help": "State your product name (e.g., 'Portland Pozzolana Cement' or 'EV Traction Battery') to inspect the mandatory standard, testing lab, and factory readiness checklist.",
    "gratitude": "You're welcome! Let me know if you need to run another statutory evaluation or export a CSV compliance pack.",
    "farewell": "Goodbye! Ensure all mandatory QCO checkpoints and NABL test registers are verified before submitting on Manakonline."
}

CONVERSATIONAL_TRIGGERS = [
    "hi", "hello", "hey", "namaste", "good morning", "good afternoon",
    "who are you", "what are you", "what can you do", "help",
    "thank you", "thanks", "bye", "goodbye"
]

def is_conversational(query: str) -> bool:
    q = query.lower().strip()
    return any(q == t or q.startswith(t + " ") or q.endswith(" " + t) for t in CONVERSATIONAL_TRIGGERS)

def resolve_small_talk(query: str) -> str:
    q = query.lower()
    if any(w in q for w in ["who are you", "what are you", "your name"]):
        return SMALL_TALK_RESPONSES["identity"]
    if any(w in q for w in ["help", "what can you do", "purpose", "how does"]):
        return SMALL_TALK_RESPONSES["help"]
    if any(w in q for w in ["thank", "thanks"]):
        return SMALL_TALK_RESPONSES["gratitude"]
    if any(w in q for w in ["bye", "goodbye"]):
        return SMALL_TALK_RESPONSES["farewell"]
    return SMALL_TALK_RESPONSES["greeting"]

class QueryRequest(BaseModel):
    message: str
    documents: Optional[List[str]] = ["factory_layout", "qc_personnel"]

class AuditExportRequest(BaseModel):
    text: str
    documents: Optional[List[str]] = ["factory_layout", "qc_personnel"]

@app.get("/")
def health_check():
    return {"status": "live", "service": "BIS & AIS Compliance Engine"}

@app.post("/chat")
def chat_endpoint(req: QueryRequest):
    query = req.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Empty query.")

    if is_conversational(query):
        return {
            "reply": resolve_small_talk(query),
            "audit_data": None
        }

    predicted_dept = dept_model.predict([query])[0]
    if predicted_dept == "small_talk":
        predicted_dept = "General Compliance"

    query_vec = np.array(list(embedder.embed([query])), dtype="float32")
    distances, indices = index.search(query_vec, k=1)
    top_score = float(distances[0][0])
    matched_item = corpus[indices[0][0]]

    is_valid, reason = check_domain_guardrail(query, matched_item.get("standard", ""), top_score)
    if not is_valid:
        return {
            "reply": f"The query '{query}' does not fall under statutory BIS or AIS mandatory standards. {reason}",
            "audit_data": None
        }

    readiness = evaluate_readiness(req.documents or [], standard=matched_item.get("standard", ""))
    citation = matched_item.get("citation", {
        "clause_reference": f"{matched_item.get('standard')} Statutory Provisions",
        "source_url": "https://www.manakonline.in",
        "statutory_act": "Bureau of Indian Standards Act, 2016"
    })

    audit_pack = {
        "classification": {
            "predicted_department": predicted_dept,
            "similarity_score": round(top_score, 4)
        },
        "audit_pack": {
            "governance": {
                "standard": matched_item.get("standard"),
                "qco_order": matched_item.get("qco_order", "Mandatory QCO Applicable"),
                "scheme": matched_item.get("scheme", "Scheme-I (ISI Mark)"),
                "filing_portal": matched_item.get("portal", "Manakonline Portal"),
                "citation": citation
            },
            "testing_and_labs": {
                "authorized_lab": matched_item.get("lab", "BIS Central Laboratory / NABL Accredited"),
                "surveillance_audit": matched_item.get("surveillance", "Annual Surveillance")
            },
            "gap_and_readiness": readiness
        }
    }

    reply_msg = (
        f"Verified standard: {matched_item.get('standard')}. "
        f"Governing Order: {matched_item.get('qco_order', 'Statutory QCO')}. "
        f"Calculated readiness score: {readiness['readiness_score']} ({readiness['status']})."
    )

    return {
        "reply": reply_msg,
        "audit_data": audit_pack
    }

@app.post("/audit/export")
def export_audit(req: AuditExportRequest):
    query_vec = np.array(list(embedder.embed([req.text])), dtype="float32")
    distances, indices = index.search(query_vec, k=1)
    matched_item = corpus[indices[0][0]]
    readiness = evaluate_readiness(req.documents or [], standard=matched_item.get("standard", ""))
    
    csv_content = generate_csv_report(matched_item, readiness, req.text)
    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Audit_{req.text.replace(' ', '_')}.csv"}
    )
