from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel

router = APIRouter()
audit_router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    patient_id: str

@router.post("/chat")
async def clinician_chat(req: ChatRequest):
    """Conversational Clinician Copilot"""
    query = req.query.lower()
    
    # Simple heuristic to mock LLM behavior
    if "semaglutide" in query or "ozempic" in query:
        return {
            "reply": "Switching to Semaglutide with a 15-minute daily walk significantly reduces the 30-day glycemic variance. The projected peak drops from 200 mg/dL to 155 mg/dL. I've updated the What-If simulation with these parameters.",
            "action": {
                "type": "SIMULATE",
                "params": {
                    "medication": "Semaglutide",
                    "post_meal_walk_mins": 15,
                    "meal_carbs": 70
                }
            }
        }
    
    return {
        "reply": "Based on the digital twin, that intervention is safe. Would you like me to run a simulation for it?",
        "action": None
    }

# Mocking the synthetic patients list for now
@router.get("/patients")
async def list_patients():
    """List synthetic patients with risk tier, last glucose, etc."""
    return [
        {
            "id": "synthetic_1",
            "age": 55,
            "has_t2d": True,
            "last_glucose": 195,
            "trend_arrow": "UP",
            "risk_tier": "high",
            "active_alerts": ["Predicted hyperglycemic excursion in ~30 min"]
        },
        {
            "id": "synthetic_2",
            "age": 42,
            "has_t2d": False,
            "last_glucose": 95,
            "trend_arrow": "FLAT",
            "risk_tier": "low",
            "active_alerts": []
        }
    ]

@router.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    """Full virtual patient snapshot"""
    return {
        "id": patient_id,
        "ehr_summary": {
            "diabetes_duration": 5,
            "hba1c": 8.2,
            "medications": ["Metformin"],
            "comorbidities": ["Hypertension"],
            "prs_badge": "0.75"
        },
        "latest_sensor_stats": {
            "glucose": 195,
            "heart_rate": 82,
            "hrv": 25,
            "steps_today": 2500,
            "sleep_quality": "poor"
        }
    }

@audit_router.get("/")
async def get_audit_log():
    """Access/audit log for clinician access"""
    return {
        "logs": [
            {"timestamp": datetime.utcnow().isoformat(), "clinician_id": "demo_doc", "action": "view_patient", "patient_id": "synthetic_1"}
        ]
    }
