from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()
simulate_router = APIRouter()

@router.get("/{patient_id}/timeline")
async def get_timeline(patient_id: str, _from: str = None, to: str = None):
    """Glucose/HR/HRV/steps/sleep series"""
    return {
        "data": [
            {"time": "08:00", "glucose": 110, "hr": 70},
            {"time": "08:30", "glucose": 140, "hr": 75, "event": "Breakfast"},
            {"time": "09:00", "glucose": 170, "hr": 72},
            {"time": "09:30", "glucose": 195, "hr": 75}
        ]
    }

class SimulateRequest(BaseModel):
    patient_id: str
    meal_carbs: float = 0
    post_meal_walk_mins: int = 0
    sleep_hours: float = 7.0
    medication_adherence: float = 1.0

@simulate_router.post("/")
async def simulate_t2d(req: SimulateRequest):
    """What-if perturbation"""
    risk_delta = -0.15 if req.post_meal_walk_mins > 15 else (0.1 if req.meal_carbs > 60 else 0)
    
    return {
        "baseline_trajectory": [140, 170, 195, 200, 180],
        "intervention_trajectory": [140, 160, 170, 165, 140] if req.post_meal_walk_mins > 15 else [140, 175, 205, 210, 190],
        "risk_delta": risk_delta,
        "message": f"Adding a {req.post_meal_walk_mins} min walk reduces peak glucose by ~25 mg/dL."
    }
