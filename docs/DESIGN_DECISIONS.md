# Design Decisions: BIS & AIS Statutory RAG Engine

## Stack Rationale
- **Selection**: `Python (FastAPI, ONNX, FAISS), Vanilla JavaScript / HTML5`
- **Reasoning**: Balances developer velocity, component modularity, and smooth user interactions.

## Trade-offs
- **Client-Side vs Server-Side**: Architecture optimized for fast initial render and responsive client state transitions.
- **Data Persistence**: Clear separation between stateless frontend clients and secured backend services.
