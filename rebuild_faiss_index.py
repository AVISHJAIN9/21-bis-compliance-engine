import json
import faiss
import numpy as np
from fastembed import TextEmbedding

print("Loading FastEmbed engine (zero-PyTorch, ~60MB RAM footprint)...")
embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

with open("model2_corpus.json", "r") as f:
    corpus = json.load(f)

docs = [f"{item['product_name']} {item.get('text', '')} {item['standard']}" for item in corpus]
print(f"Encoding {len(docs)} corpus documents...")

embeddings = np.array(list(embedder.embed(docs)), dtype="float32")
# Normalize vectors for cosine inner product
faiss.normalize_L2(embeddings)

dim = embeddings.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(embeddings)

faiss.write_index(index, "model2_rag_faiss.index")
print(f"Index created with {index.ntotal} records at dimension {dim}!")
