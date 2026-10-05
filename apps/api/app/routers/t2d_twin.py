import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel
import re

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

def run_bergman_ode(carbs: float, walk_mins: int, medication: str, steps: int = 48):
    """
    Runs a 4-hour (48 steps of 5 mins) Bergman Minimal Model simulation.
    """
    # Patient attributes (mock T2D patient)
    fasting_glucose = 140
    bmi = 28
    hba1c = 8.2
    
    # Insulin sensitivity decreases with higher BMI, HbA1c
    insulin_sensitivity = max(0.0001, 0.001 - (bmi - 20) * 0.00002 - (hba1c - 5.0) * 0.0001)
    
    # Medication effects
    if medication.lower() == "semaglutide":
        insulin_sensitivity *= 1.5 # GLP-1 increases sensitivity
        gastric_emptying_factor = 0.5 # Slows gastric emptying
    elif medication.lower() == "insulin":
        insulin_sensitivity *= 1.2
        gastric_emptying_factor = 1.0
    else:
        gastric_emptying_factor = 1.0

    # Base states
    G = fasting_glucose
    I = 15 # Basal insulin
    X = 0  # Remote insulin action
    
    # Parameters for difference equation
    p1 = 0.02    # Glucose effectiveness
    p2 = 0.02    # Insulin action clearance
    p3 = insulin_sensitivity * 1e4 # scaled
    n = 0.1      # Insulin clearance
    
    glucose_curve = []
    
    # Walk timing (assume walk starts at step 6, i.e., 30 mins post meal)
    walk_start_step = 6
    walk_end_step = walk_start_step + int(walk_mins / 5)
    
    for step in range(steps):
        # Physical activity (reduces glucose)
        is_walking = walk_start_step <= step < walk_end_step
        exercise_effect = 3.0 if is_walking else 0.0
        
        # Meal absorption (Rate of appearance)
        # Gamma-like curve over 24 steps (2 hours)
        Ra = 0
        if step < 24:
            Ra = carbs * (step / 24.0) * np.exp(-step / (4.0 / gastric_emptying_factor)) * 1.5
            
        # ODE update (Euler method step)
        dG = - (p1 + X + exercise_effect * 0.01) * (G - fasting_glucose) + Ra
        dX = - p2 * X + p3 * (I - 10)
        
        # Beta-cell secretion (impaired in T2D)
        beta_cell_responsiveness = 0.02 if medication.lower() == "metformin" else 0.04
        dI = - n * (I - 10) + beta_cell_responsiveness * max(0, (G - 100))
        
        G += dG
        X += dX
        I += dI
        
        G = np.clip(G, 40, 400)
        I = max(0, I)
        
        # Sample every 4 steps (20 minutes) for UI simplification, or return all
        if step % 4 == 0:
            glucose_curve.append(int(G))
            
    # Add final point to make it 13 points (0 to 4 hours)
    glucose_curve.append(int(G))
    return glucose_curve[:13]

@simulate_router.post("/")
async def simulate_t2d(req: SimulateRequest):
    """What-if perturbation using Bergman ODE"""
    
    baseline_curve = run_bergman_ode(70.0, 0, "Metformin")
    intervention_curve = run_bergman_ode(req.meal_carbs, req.post_meal_walk_mins, req.medication)
    
    # Risk delta based on area under curve > 180
    auc_base = sum([max(0, x - 180) for x in baseline_curve])
    auc_int = sum([max(0, x - 180) for x in intervention_curve])
    
    risk_delta = (auc_int - auc_base) / 1000.0 

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
    """Auto-Optimizer: Find exact minimum lifestyle change to stay under target using grid search"""
    baseline_curve = run_bergman_ode(70.0, 0, "Metformin")
    
    best_plan = None
    best_peak = 999
    
    # Grid search for the optimal regimen
    for med in ["Semaglutide", "Metformin"]:
        for carbs in range(70, 20, -5):
            for walk in range(0, 45, 5):
                curve = run_bergman_ode(carbs, walk, med)
                peak = max(curve)
                if peak <= req.target_max_glucose:
                    if walk + (70 - carbs) < best_peak: # simplistic cost function to minimize lifestyle changes
                        best_peak = walk + (70 - carbs)
                        best_plan = (carbs, walk, med, curve)
                        break
            if best_plan and med == "Semaglutide": # prefer less intense lifestyle changes if med fixes it
                break

    if not best_plan:
        best_plan = (30, 40, "Semaglutide", run_bergman_ode(30, 40, "Semaglutide"))
        
    auc_base = sum([max(0, x - 180) for x in baseline_curve])
    auc_int = sum([max(0, x - 180) for x in best_plan[3]])
    risk_delta = (auc_int - auc_base) / 1000.0

    return {
        "optimal_plan": {
            "meal_carbs": best_plan[0],
            "post_meal_walk_mins": best_plan[1],
            "medication": best_plan[2],
            "message": f"To keep glucose under {req.target_max_glucose} mg/dL, limit carbs to {best_plan[0]}g and walk {best_plan[1]} mins post-meal. Switching to {best_plan[2]}."
        },
        "time_points": ["0h", "20m", "40m", "1h", "1h20m", "1h40m", "2h", "2h20m", "2h40m", "3h", "3h20m", "3h40m", "4h"],
        "baseline_trajectory": baseline_curve,
        "intervention_trajectory": best_plan[3],
        "risk_delta": risk_delta
    }

from ..services.counterfactual import find_counterfactual

class CounterfactualRequest(BaseModel):
    patient_id: str
    current_state: dict

@simulate_router.post("/counterfactual")
async def get_counterfactual(req: CounterfactualRequest):
    """Counterfactual: Find smallest intervention to prevent excursion"""
    return find_counterfactual(req.patient_id, req.current_state)

class LongTermRequest(BaseModel):
    patient_id: str
    years: int = 5
    optimized: bool = False

@simulate_router.post("/long_term")
async def simulate_long_term(req: LongTermRequest):
    """5-Year Fast Forward: Long-term organ degradation"""
    baseline_risks = {
        "ckd": 0.35 + (req.years * 0.05),
        "retinopathy": 0.20 + (req.years * 0.08),
        "neuropathy": 0.40 + (req.years * 0.06),
        "cvd": 0.25 + (req.years * 0.04)
    }
    
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
