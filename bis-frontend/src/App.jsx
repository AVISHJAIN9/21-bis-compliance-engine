import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, Send, Bot, User, CheckSquare, Square, Download } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

const AVAILABLE_DOCS = [
  { id: "factory_layout", label: "Factory Layout & Machinery List (15%)" },
  { id: "test_equipment", label: "Clause-Specific In-House Test Benches (20%)" },
  { id: "calibration_certs", label: "Valid NABL Calibration Certs (10%)" },
  { id: "qc_personnel", label: "Qualified QC Personnel Undertaking (15%)" },
  { id: "raw_material_certs", label: "Raw Material Test Certificates (10%)" },
  { id: "test_log_register", label: "Routine Inspection & Test Register (10%)" },
  { id: "homologation_drawings", label: "Automotive CMVR Form 22 Drawings (10%)" },
  { id: "cop_plan", label: "Conformity of Production (COP) Plan AIS-037 (10%)" }
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your automated BIS & AIS Regulatory Compliance Assistant. You can ask procedural questions (Scheme-I, ARAI Homologation, Manakonline) or input a product like 'Cement 53 Grade', 'EV Battery AIS 156', or 'TMT Rebars' to trigger an automated audit."
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedDocs, setSelectedDocs] = useState(["factory_layout", "qc_personnel"]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleDoc = (id) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, documents: selectedDocs })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
          auditData: data.audit_data || null,
          queryText: userText
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Connection error: Unable to reach the local compliance backend on port 8000." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async (queryText) => {
    try {
      const res = await fetch(`${API_URL}/audit/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: queryText, documents: selectedDocs })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Audit_Summary_${queryText.replace(/ /g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to download CSV summary.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1120", color: "#f8fafc", padding: "20px 14px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", height: "94vh" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: 10, marginBottom: 10 }}>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0, color: "#38bdf8" }}>
              BIS & AIS Regulatory Compliance Engine
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
              100% Offline Multi-Regime Governance & Factory Readiness Engine
            </p>
          </div>
          <span style={{ fontSize: "0.75rem", backgroundColor: "#065f46", color: "#6ee7b7", padding: "4px 10px", borderRadius: 12, fontWeight: 600 }}>
            Local Model Active
          </span>
        </div>

        {/* Checkbox Grid */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
            Compliance Artifacts Present (BIS Scheme-I & Automotive AIS Homologation)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {AVAILABLE_DOCS.map(doc => {
              const active = selectedDocs.includes(doc.id);
              return (
                <div 
                  key={doc.id} 
                  onClick={() => toggleDoc(doc.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.78rem", color: active ? "#38bdf8" : "#64748b" }}
                >
                  {active ? <CheckSquare size={14} color="#38bdf8" /> : <Square size={14} />}
                  <span>{doc.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Stream */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: m.sender === "user" ? "80%" : "95%" }}>
              {m.sender === "bot" && (
                <div style={{ backgroundColor: "#0284c7", borderRadius: "50%", padding: 6, display: "flex" }}>
                  <Bot size={15} color="#fff" />
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  backgroundColor: m.sender === "user" ? "#0369a1" : "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "9px 13px",
                  fontSize: "0.85rem",
                  lineHeight: 1.45,
                  color: "#f8fafc"
                }}>
                  {m.text}
                </div>

                {/* Audit Card */}
                {m.auditData && (
                  <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#38bdf8" }}>
                        Standard: {m.auditData.audit_pack.governance.standard}
                      </span>
                      <button
                        onClick={() => handleDownloadCsv(m.queryText)}
                        style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#0284c7", border: "none", color: "#fff", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}
                      >
                        <Download size={12} /> Export CSV
                      </button>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: 3 }}>
                      <div><strong>Department / Regime:</strong> {m.auditData.classification.predicted_department}</div>
                      <div><strong>Order / Notification:</strong> {m.auditData.audit_pack.governance.qco_order}</div>
                      <div><strong>Certification Scheme:</strong> {m.auditData.audit_pack.governance.scheme}</div>
                      <div><strong>Assigned Agency / Lab:</strong> {m.auditData.audit_pack.testing_and_labs.authorized_lab}</div>
                      <div><strong>Filing Route:</strong> {m.auditData.audit_pack.governance.filing_portal}</div>
                    </div>

                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Computed Readiness:</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: m.auditData.audit_pack.gap_and_readiness.critical_gap_flag ? "#f87171" : "#4ade80" }}>
                        {m.auditData.audit_pack.gap_and_readiness.readiness_score} ({m.auditData.audit_pack.gap_and_readiness.status})
                      </span>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      {m.auditData.audit_pack.gap_and_readiness.gaps_identified.slice(0, 3).map((g, i) => (
                        <div key={i} style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          • {g.item}: <span style={{ color: "#e2e8f0" }}>{g.action_required}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.sender === "user" && (
                <div style={{ backgroundColor: "#334155", borderRadius: "50%", padding: 6, display: "flex" }}>
                  <User size={15} color="#fff" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            type="text"
            placeholder="Ask a question or enter a product (e.g. 'EV battery AIS 156')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "9px 12px",
              color: "#f8fafc",
              fontSize: "0.88rem",
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#0284c7",
              border: "none",
              borderRadius: 8,
              padding: "0 16px",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <Send size={15} />
          </button>
        </form>

      </div>
    </div>
  );
}
