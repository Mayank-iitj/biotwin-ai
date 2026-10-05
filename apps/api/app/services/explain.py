from typing import Dict, Any, List

def explain_prediction(features: Dict[str, Any], shap_values: Dict[str, float] = None) -> List[Dict[str, Any]]:
    """
    Map features to plain language explanations based on SHAP values.
    Returns a list of top drivers.
    """
    # Mocking SHAP logic for speed if not provided
    if not shap_values:
        shap_values = {}
        # synthesize some drivers based on features
        if features.get("glucose", 0) > 140:
            shap_values["glucose"] = 0.3
        if features.get("meal_carbs", 0) > 50:
            shap_values["meal_carbs"] = 0.2
        if features.get("sleep_duration", 8) < 6:
            shap_values["sleep_duration"] = 0.1
            
    drivers = []
    
    # Phrase mapping
    phrases = {
        "glucose": lambda v: f"Glucose rising ({v} mg/dL)",
        "meal_carbs": lambda v: f"Recent meal high in carbs ({v}g)",
        "sleep_duration": lambda v: f"Poor sleep last night ({v} hrs)",
        "hr": lambda v: f"Elevated heart rate ({v} bpm)",
        "hba1c": lambda v: f"Baseline HbA1c ({v}%)",
    }
    
    # Sort by absolute SHAP value
    sorted_features = sorted(shap_values.items(), key=lambda item: abs(item[1]), reverse=True)
    
    for feat, shap_val in sorted_features[:3]:
        val = features.get(feat, "N/A")
        phrase_fn = phrases.get(feat, lambda v: f"Feature {feat} ({v})")
        
        drivers.append({
            "feature": feat,
            "value": val,
            "shap_value": shap_val,
            "direction": "up" if shap_val > 0 else "down",
            "phrase": phrase_fn(val)
        })
        
    return drivers
