FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PORT=10000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "from fastembed import TextEmbedding; list(TextEmbedding(model_name='BAAI/bge-small-en-v1.5').embed(['warmup']))"

COPY . .

EXPOSE 10000

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000}"]
