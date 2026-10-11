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
import json
import httpx

NVIDIA_API_KEY = "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"

@router.post("/chat")
async def clinician_chat(req: ChatRequest):
    """Conversational Clinician Copilot - LLM Powered via NVIDIA NIM"""
    system_prompt = """
    You are BioTwin AI Copilot, assisting a clinician with a Digital Twin. 
    The clinician might ask to simulate an intervention. 
    Extract the following parameters from their query if present:
    - medication (e.g. Semaglutide, Insulin, Metformin)
    - walk_mins (integer, minutes of walking)
    - meal_carbs (integer, grams of carbs)

    Respond ONLY with a valid JSON object (no markdown, no backticks, no other text) matching this schema:
    {
      "reply": "Your conversational, clinical response",
      "action": {
         "type": "SIMULATE",
         "params": {
             "medication": "Metformin", // default
             "post_meal_walk_mins": 0, // default
             "meal_carbs": 70 // default
         }
      } // Or set "action": null if no intervention is requested
    }
    """

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {NVIDIA_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-ai/deepseek-v4.1-flash",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": req.query}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 1024,
                    "stream": False
                },
                timeout=15.0
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            
            # Clean up potential markdown formatting from LLM response
            content = content.replace("```json", "").replace("```", "").strip()
            
            parsed = json.loads(content)
            return parsed
            
    except Exception as e:
        print(f"LLM Chat Error: {e}")
        # Fallback if API fails
        return {
            "reply": "I'm having trouble connecting to my AI brain right now. Please adjust the parameters manually on the dashboard.",
            "action": None
        }

# Curated Indian Synthetic Patient Cohort (DPDP Act & HIPAA Compliant)
INDIAN_PATIENT_COHORT = [
    {
        "id": "synthetic_1",
        "name": "Rajesh Sharma",
        "age": 55,
        "gender": "Male",
        "region": "North (Delhi NCR)",
        "diet": "Vegetarian",
        "has_t2d": True,
        "diabetes_duration_years": 5,
        "hba1c": 8.2,
        "fasting_glucose": 142,
        "bmi": 28.4,
        "prs_score": 0.75,
        "last_glucose": 195,
        "trend_arrow": "UP",
        "risk_tier": "high",
        "medications": ["Metformin 1000mg"],
        "comorbidities": ["Hypertension (Stage 1)"],
        "active_alerts": ["Predicted hyperglycemic excursion in ~45 min (P = 0.88)"]
    },
    {
        "id": "synthetic_2",
        "name": "Priya Nair",
        "age": 42,
        "gender": "Female",
        "region": "South (Kerala)",
        "diet": "Vegetarian",
        "has_t2d": False,
        "diabetes_duration_years": 0,
        "hba1c": 5.4,
        "fasting_glucose": 92,
        "bmi": 22.8,
        "prs_score": 0.22,
        "last_glucose": 95,
        "trend_arrow": "FLAT",
        "risk_tier": "low",
        "medications": ["None"],
        "comorbidities": ["None"],
        "active_alerts": []
    },
    {
        "id": "synthetic_3",
        "name": "Ananya Banerjee",
        "age": 49,
        "gender": "Female",
        "region": "East (West Bengal)",
        "diet": "Non-Vegetarian",
        "has_t2d": True,
        "diabetes_duration_years": 3,
        "hba1c": 7.4,
        "fasting_glucose": 128,
        "bmi": 26.1,
        "prs_score": 0.58,
        "last_glucose": 164,
        "trend_arrow": "FLAT",
        "risk_tier": "moderate",
        "medications": ["Metformin 500mg"],
        "comorbidities": ["Dyslipidemia"],
        "active_alerts": []
    },
    {
        "id": "synthetic_4",
        "name": "Vikram Patel",
        "age": 62,
        "gender": "Male",
        "region": "West (Gujarat)",
        "diet": "Vegetarian",
        "has_t2d": True,
        "diabetes_duration_years": 10,
        "hba1c": 9.1,
        "fasting_glucose": 168,
        "bmi": 29.8,
        "prs_score": 0.84,
        "last_glucose": 218,
        "trend_arrow": "UP",
        "risk_tier": "high",
        "medications": ["Metformin 1000mg", "Glimepiride 2mg"],
        "comorbidities": ["Hypertension", "Microalbuminuria"],
        "active_alerts": ["Frequent nocturnal hyperglycemia flagged"]
    },
    {
        "id": "synthetic_5",
        "name": "Mohammed Farooq",
        "age": 51,
        "gender": "Male",
        "region": "South (Hyderabad)",
        "diet": "Non-Vegetarian",
        "has_t2d": True,
        "diabetes_duration_years": 6,
        "hba1c": 7.9,
        "fasting_glucose": 136,
        "bmi": 27.2,
        "prs_score": 0.68,
        "last_glucose": 178,
        "trend_arrow": "UP",
        "risk_tier": "moderate",
        "medications": ["Dapagliflozin 10mg", "Metformin 500mg"],
        "comorbidities": ["Mild Non-Alcoholic Fatty Liver"],
        "active_alerts": []
    }
]

@router.get("/patients")
async def list_patients():
    """List synthetic patients with risk tier, last glucose, regional tags"""
    return INDIAN_PATIENT_COHORT

@router.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    """Full virtual patient snapshot"""
    p = next((x for x in INDIAN_PATIENT_COHORT if x["id"] == patient_id), INDIAN_PATIENT_COHORT[0])
    return {
        "id": p["id"],
        "name": p["name"],
        "age": p["age"],
        "gender": p["gender"],
        "region": p["region"],
        "diet": p["diet"],
        "ehr_summary": {
            "diabetes_duration": p["diabetes_duration_years"],
            "hba1c": p["hba1c"],
            "fasting_glucose": p["fasting_glucose"],
            "bmi": p["bmi"],
            "medications": p["medications"],
            "comorbidities": p["comorbidities"],
            "prs_badge": str(p["prs_score"])
        },
        "latest_sensor_stats": {
            "glucose": p["last_glucose"],
            "heart_rate": 82 if p["has_t2d"] else 68,
            "hrv": 25 if p["has_t2d"] else 44,
            "steps_today": 3200,
            "sleep_quality": "poor" if p["has_t2d"] else "good"
        }
    }

@router.get("/patients/{patient_id}/summary/24h")
async def get_patient_summary_24h(patient_id: str):
    """24-Hour Grounded Clinician Summary with ADA Metrics"""
    from ..services.summary import generate_patient_summary
    is_at_risk = "2" not in patient_id
    stats = {
        "tir_70_180": 64.5 if is_at_risk else 95.0,
        "tar_180": 33.2 if is_at_risk else 4.0,
        "tbr_70": 2.3 if is_at_risk else 1.0,
        "alerts_24h": 3 if is_at_risk else 0
    }
    return generate_patient_summary(patient_id, stats)

@audit_router.get("/")
async def get_audit_log():
    """Access/audit log for clinician access"""
    return {
        "logs": [
            {"timestamp": datetime.utcnow().isoformat(), "clinician_id": "demo_doc", "action": "view_patient", "patient_id": "synthetic_1"},
            {"timestamp": datetime.utcnow().isoformat(), "clinician_id": "demo_doc", "action": "simulate_what_if", "patient_id": "synthetic_1"},
            {"timestamp": datetime.utcnow().isoformat(), "clinician_id": "demo_doc", "action": "export_fhir", "patient_id": "synthetic_1"}
        ]
    }

