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
    medication: str = "Metformin"

@simulate_router.post("/")
async def simulate_t2d(req: SimulateRequest):
    """What-if perturbation"""
    # Calculate baseline curve (peaks at ~200)
    baseline_curve = []
    for i in range(13): # 4 hours (20-min intervals roughly)
        if i < 3: baseline_curve.append(140 + i*20)
        elif i < 7: baseline_curve.append(200 - (i-3)*10)
        else: baseline_curve.append(160 - (i-7)*5)
        
    # Calculate intervention curve based on carbs and walk and med
    carb_factor = req.meal_carbs / 70.0 # 70g is baseline
    walk_factor = (req.post_meal_walk_mins / 30.0) # 30 min is good
    med_factor = 0.8 if req.medication.lower() == "semaglutide" else 1.0

    intervention_curve = []
    for i in range(13):
        base_val = baseline_curve[i]
        if i >= 3: # post-meal
            val = 140 + (base_val - 140) * carb_factor * (1.0 - walk_factor * 0.4) * med_factor
            intervention_curve.append(int(val))
        else:
            intervention_curve.append(base_val)

    # Risk delta based on area under curve > 180
    auc_base = sum([max(0, x - 180) for x in baseline_curve])
    auc_int = sum([max(0, x - 180) for x in intervention_curve])
    
    risk_delta = (auc_int - auc_base) / 1000.0 # simple scaling

    return {
        "time_points": ["0h", "20m", "40m", "1h", "1h20m", "1h40m", "2h", "2h20m", "2h40m", "3h", "3h20m", "3h40m", "4h"],
        "baseline_trajectory": baseline_curve,
        "intervention_trajectory": intervention_curve,
        "risk_delta": risk_delta,
        "message": f"Simulated: {req.meal_carbs}g carbs, {req.post_meal_walk_mins}m walk, {req.medication}. Peak reduced."
    }

class OptimizeRequest(BaseModel):
    patient_id: str
    target_max_glucose: float = 160.0

@simulate_router.post("/optimize")
async def optimize_t2d(req: OptimizeRequest):
    """Auto-Optimizer: Find exact minimum lifestyle change to stay under target"""
    # Just a mock optimization returning a perfect plan
    return {
        "optimal_plan": {
            "meal_carbs": 55,
            "post_meal_walk_mins": 25,
            "medication": "Semaglutide",
            "message": "To keep glucose 100% under 160 mg/dL, limit carbs to 55g and walk 25 mins post-meal. Switching to Semaglutide recommended."
        },
        "time_points": ["0h", "20m", "40m", "1h", "1h20m", "1h40m", "2h", "2h20m", "2h40m", "3h", "3h20m", "3h40m", "4h"],
        "baseline_trajectory": [140, 160, 180, 200, 190, 180, 170, 160, 155, 150, 145, 140, 140],
        "intervention_trajectory": [140, 145, 150, 155, 158, 155, 150, 145, 140, 140, 140, 140, 140],
        "risk_delta": -0.45
    }

class LongTermRequest(BaseModel):
    patient_id: str
    years: int = 5
    optimized: bool = False

@simulate_router.post("/long_term")
async def simulate_long_term(req: LongTermRequest):
    """5-Year Fast Forward: Long-term organ degradation"""
    # Current trajectory risk
    baseline_risks = {
        "ckd": 0.35 + (req.years * 0.05),
        "retinopathy": 0.20 + (req.years * 0.08),
        "neuropathy": 0.40 + (req.years * 0.06),
        "cvd": 0.25 + (req.years * 0.04)
    }
    
    # Optimized trajectory risk (if they follow recommendations)
    optimized_risks = {
        "ckd": 0.35 + (req.years * 0.01),
        "retinopathy": 0.20 + (req.years * 0.02),
        "neuropathy": 0.40 + (req.years * 0.01),
        "cvd": 0.25 + (req.years * 0.01)
    }
    
    risks = optimized_risks if req.optimized else baseline_risks
    
    return {
        "years_simulated": req.years,
        "risks": risks,
        "message": "Long-term simulation completed."
    }
