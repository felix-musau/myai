ML microservice (FastAPI)

Quick start:

1. python -m venv .venv-ml
2. .venv-ml\Scripts\activate
3. pip install -r requirements.txt
4. uvicorn main:app --host 0.0.0.0 --port 8000

The service trains on `Training.csv` (expected in repo root) and exposes `/predict`.
