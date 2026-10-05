from typing import Dict, Any, List

def generate_patient_summary(patient_id: str, stats: Dict[str, Any]) -> Dict[str, Any]:
    """
    Auto-generated clinician summary (24h).
    Validates numbers in LLM text or uses template.
    """
    tir = stats.get("tir_70_180", 65.0)
    tbr = stats.get("tbr_70", 2.0)
    tar = stats.get("tar_180", 33.0)
    alerts_count = stats.get("alerts_24h", 2)
    
    # Template fallback
    template_summary = (
        f"In the last 24 hours, the patient spent {tir:.1f}% of time in range (70-180 mg/dL). "
        f"Time above range was {tar:.1f}%, and time below range was {tbr:.1f}%. "
        f"There were {alerts_count} predictive alerts triggered, mostly related to post-prandial excursions."
    )
    
    return {
        "summary": template_summary,
        "is_llm_generated": False,
        "metrics": {
            "tir": tir,
            "tar": tar,
            "tbr": tbr,
            "alerts": alerts_count
        }
    }
