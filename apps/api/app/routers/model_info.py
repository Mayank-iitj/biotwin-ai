from fastapi import APIRouter

router = APIRouter(tags=["model_info"])

@router.get("/info")
async def get_model_info():
    """
    Get model info and data card summaries.
    """
    return {
        "model_version": "1.0.0-fusion",
        "date_trained": "2026-10-01",
        "description": "XGBoost fusion model (EHR + CGM features) for T2D hyperglycemia prediction",
        "metrics": {
            "auroc": 0.92,
            "auprc": 0.85,
            "false_alerts_per_day": 0.8,
            "lead_time_median_min": 45
        },
        "data_provenance": "Synthea v3 + CGM Simulator (Indian Demographics)",
        "limitations": [
            "Synthetic data only",
            "Not clinically validated",
            "Assumes continuous sensor wear"
        ]
    }
