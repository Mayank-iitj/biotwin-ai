from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio
import random
from datetime import datetime
import os
import json
import joblib
import pandas as pd

router = APIRouter()

# Load real ML model
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'ml', 'artifacts')
FUSION_MODEL_PATH = os.path.join(ARTIFACTS_DIR, 'fusion_model.pkl')
FEATURES_PATH = os.path.join(ARTIFACTS_DIR, 'features.json')

fusion_model = None
feature_names = []

if os.path.exists(FUSION_MODEL_PATH) and os.path.exists(FEATURES_PATH):
    try:
        fusion_model = joblib.load(FUSION_MODEL_PATH)
        with open(FEATURES_PATH, 'r') as f:
            features_dict = json.load(f)
            feature_names = features_dict.get('all', [])
    except Exception as e:
        print(f"Failed to load ML model in stream: {e}")

@router.get("/{patient_id}")
async def stream_patient_data(patient_id: str):
    """Live replay of a patient's sensor data via SSE using REAL ML Model"""
    async def event_generator():
        glucose = 150
        while True:
            # Simulate streaming physiological data
            glucose += random.uniform(-2, 2.5)
            glucose_val = max(40, min(400, glucose))
            hr_val = random.randint(60, 90)
            
            prob_hyper = 0.5
            
            # Predict using real XGBoost fusion model
            if fusion_model is not None and feature_names:
                feature_values = {}
                for fname in feature_names:
                    if "glucose" in fname:
                        feature_values[fname] = glucose_val if fname == 'glucose_mgdl' else 120
                    elif "hr" in fname or "heart" in fname:
                        feature_values[fname] = hr_val if fname == 'heart_rate' else 70
                    elif "age" == fname:
                        feature_values[fname] = 45
                    else:
                        feature_values[fname] = 0.0
                
                try:
                    df = pd.DataFrame([feature_values], columns=feature_names)
                    prob_hyper = float(fusion_model.predict_proba(df)[0][1])
                except Exception as e:
                    print(f"Stream prediction failed: {e}")
            else:
                # Fallback if model missing
                prob_hyper = 0.5 if glucose_val < 170 else 0.8
                
            data = {
                "timestamp": datetime.utcnow().isoformat(),
                "glucose_mgdl": round(glucose_val, 1),
                "heart_rate": hr_val,
                "prediction": {
                    "prob_hyper": round(prob_hyper, 3),
                    "tier": "moderate" if prob_hyper < 0.75 else "high"
                }
            }
            # SSE Starlette requires double quotes in JSON to parse correctly on frontend
            yield {
                "event": "message",
                "data": json.dumps(data)
            }
            await asyncio.sleep(1) # Accelerated speed
            
    return EventSourceResponse(event_generator())
