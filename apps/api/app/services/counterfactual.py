from typing import Dict, Any, List
from .whatif_t2d import simulate_whatif

def find_counterfactual(patient_id: str, current_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Search a bounded intervention space to find the smallest intervention
    that flips the prediction below the high-tier threshold.
    """
    base_tier = current_state.get("tier", "low")
    
    # If not high risk, no intervention needed
    # We still allow searching for moderate to low if needed, but primary is high to moderate
    
    # Define search space (grid)
    # 1. Carb reductions (10g steps up to 50g)
    # 2. Walk minutes (10, 15, 20 mins)
    # 3. Adherence (1.0)
    
    interventions = [
        {"walk_minutes": 10},
        {"walk_minutes": 15},
        {"carbs_delta": -10},
        {"carbs_delta": -20},
        {"walk_minutes": 10, "carbs_delta": -10},
        {"walk_minutes": 15, "carbs_delta": -20},
        {"adherence": 1.0},
        {"adherence": 1.0, "walk_minutes": 15}
    ]
    
    best_intervention = None
    best_prob = 1.0
    
    for inv in interventions:
        res = simulate_whatif(patient_id, current_state, inv)
        if "error" in res:
            continue
            
        new_tier = res["intervention"]["tier"]
        new_prob = res["intervention"]["probability"]
        
        # We want to flip from high to moderate/low
        if new_tier in ["moderate", "low"]:
            if new_prob < best_prob:
                best_prob = new_prob
                best_intervention = inv
                # Greedy: stop at the first simplest intervention that works 
                # (interventions array ordered by complexity)
                break
                
    if best_intervention:
        return {
            "found": True,
            "intervention": best_intervention,
            "new_probability": best_prob
        }
    else:
        return {
            "found": False,
            "message": "No minimal intervention found to prevent the excursion within the search space."
        }
