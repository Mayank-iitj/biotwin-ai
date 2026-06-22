#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting FastAPI backend server..."
cd apps/api && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
