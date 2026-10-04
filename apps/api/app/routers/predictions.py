from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
import random

router = APIRouter()
model_router = APIRouter()

class PredictionRequest(BaseModel):
    patient_id: str
    timestamp: str

@router.post("/event")
async def predict_event(req: PredictionRequest):
    """Fused prediction for a patient at time t"""
    # Mocking actual inference for demo purposes
    # A real implementation would load the ML model and feature vectors
    return {
        "probability": 0.85,
        "tier": "high",
        "lead_time_minutes": 30,
        "forecast_band": {
            "30m": {"p10": 170, "p50": 195, "p90": 210},
            "60m": {"p10": 180, "p50": 210, "p90": 230}
        },
        "top_shap_drivers": [
            {"feature": "Rising glucose slope", "contribution": 0.4, "unit": "mg/dL/min"},
            {"feature": "Poor sleep last night", "contribution": 0.2, "unit": "hours"}
        ]
    }

@router.get("/{patient_id}/history")
async def prediction_history(patient_id: str):
    return {"history": []}

@model_router.get("/info")
async def model_info():
    artifacts_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'ml', 'artifacts')
    metrics_path = os.path.join(artifacts_dir, 'metrics.json')
    metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            metrics = json.load(f)
            
    return {
        "version": "1.0",
        "training_date": "2026-10-04",
        "metrics_summary": metrics,
        "data_card_link": "/docs/DATA_CARD.md"
    }
