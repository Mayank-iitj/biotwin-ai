import sys
import os
from typing import Dict, Any, List

sys.path.append(os.path.join(os.path.dirname(__file__), "../../../../"))
try:
    from ml.synth.cgm_simulator import simulate_patient, get_patient_params
    from ml.features.build_windows import compute_dynamic_features
except ImportError:
    # mock fallback if ml package not reachable
    pass

from .inference import inference_engine

def simulate_whatif(patient_id: str, current_state: Dict[str, Any], intervention: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulate what-if intervention by adjusting simulation parameters and re-computing prediction.
    intervention format: {
        "carbs_delta": -20, # reduce 20g
        "walk_minutes": 15, # add 15 min walk
        "sleep_delta_hours": 1.5,
        "adherence": 1.0
    }
    """
    # 1. Base prediction (from current_state)
    base_pred = inference_engine.predict(current_state)
    
    # In a fully integrated system, we would:
    # 2. Re-run ml.synth.cgm_simulator forward by 120 minutes with intervention
    # 3. Re-compute features using ml.features
    # 4. Predict new state
    
    # Fast proxy implementation for the Challenge API (to meet <2s latency):
    # We apply physiological heuristics to the base probability.
    
    if not base_pred:
        return {"error": "Could not compute base prediction"}
        
    prob = base_pred.get("probability", 0.5)
    
    # Heuristic deltas
    carbs = intervention.get("carbs_delta", 0)
    walk = intervention.get("walk_minutes", 0)
    sleep = intervention.get("sleep_delta_hours", 0)
    adherence = intervention.get("adherence", None)
    
    new_prob = prob
    # Carb reduction lowers probability (e.g., -10g carbs = -0.05 prob)
    new_prob += (carbs / 10.0) * 0.05 
    
    # Walking lowers probability (-0.08 per 10 mins)
    new_prob -= (walk / 10.0) * 0.08
    
    # Better sleep lowers probability
    if sleep > 0:
        new_prob -= 0.02 * sleep
        
    # Better adherence lowers probability
    if adherence == 1.0:
        new_prob -= 0.10
        
    new_prob = max(0.01, min(0.99, new_prob))
    
    # Recalculate tier
    thresholds = {"high": 0.75, "moderate": 0.40}
    if new_prob >= thresholds["high"]:
        tier = "high"
    elif new_prob >= thresholds["moderate"]:
        tier = "moderate"
    else:
        tier = "low"
        
    # Simulate trajectory
    # Baseline vs Intervention points
    trajectory = []
    base_glucose = current_state.get("glucose", 120)
    for i in range(12): # next 60 mins (5-min intervals)
        t = i * 5
        # naive rise
        g_base = base_glucose + (i * 2) if prob > 0.5 else base_glucose + (i * 0.5)
        # modified rise
        g_int = base_glucose + (i * 2 * (new_prob / prob)) if prob > 0 else base_glucose
        trajectory.append({
            "offset_min": t,
            "baseline_glucose": g_base,
            "intervention_glucose": g_int
        })
        
    return {
        "baseline": base_pred,
        "intervention": {
            "probability": new_prob,
            "tier": tier,
            "risk_delta": new_prob - prob
        },
        "trajectory": trajectory
    }
