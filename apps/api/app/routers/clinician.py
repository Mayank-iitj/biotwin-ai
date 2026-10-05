from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel

router = APIRouter()
audit_router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    patient_id: str

import re

@router.post("/chat")
async def clinician_chat(req: ChatRequest):
    """Conversational Clinician Copilot - Dynamic Parsing"""
    query = req.query.lower()
    
    # Defaults
    medication = "Metformin"
    walk_mins = 0
    meal_carbs = 70
    
    # Extract medication
    if "semaglutide" in query or "ozempic" in query:
        medication = "Semaglutide"
    elif "insulin" in query:
        medication = "Insulin"
        
    # Extract walk minutes (e.g. "15 mins", "walk 20m")
    walk_match = re.search(r'(\d+)\s*(min|m\b)', query)
    if walk_match:
        walk_mins = int(walk_match.group(1))
        
    # Extract carbs (e.g. "50g carbs", "50 carbs")
    carbs_match = re.search(r'(\d+)\s*(g|carbs)', query)
    if carbs_match:
        meal_carbs = int(carbs_match.group(1))
        
    if medication != "Metformin" or walk_mins > 0 or meal_carbs != 70:
        return {
            "reply": f"Understood. Simulating the effect of {medication}, with {meal_carbs}g of carbs and a {walk_mins}-minute post-meal walk. I've updated the Digital Twin trajectories below.",
            "action": {
                "type": "SIMULATE",
                "params": {
                    "medication": medication,
                    "post_meal_walk_mins": walk_mins,
                    "meal_carbs": meal_carbs
                }
            }
        }
    
    return {
        "reply": "I can help you simulate interventions. Try asking: 'What if we switch to Semaglutide and they walk 20 mins?'",
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
