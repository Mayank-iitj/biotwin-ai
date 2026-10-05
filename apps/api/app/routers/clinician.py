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
