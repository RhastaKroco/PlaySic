#!/usr/bin/env bash
# Mode dev: backend (FastAPI :8000) + frontend (Vite :5173)
set -e
cd "$(dirname "$0")"
trap 'kill 0' EXIT
(cd backend && [ -d .venv ] || python3 -m venv .venv
 cd backend && . .venv/bin/activate && pip install -q -r requirements.txt && uvicorn main:app --reload --port 8000) &
(cd frontend && npm install && npm run dev) &
wait
