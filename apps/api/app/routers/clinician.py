from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime

router = APIRouter()
audit_router = APIRouter()

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
