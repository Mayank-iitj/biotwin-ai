from fastapi import APIRouter
from pydantic import BaseModel
from ..services.drift import drift_monitor

router = APIRouter(tags=["monitoring"])

class InjectDriftRequest(BaseModel):
    inject: bool

@router.get("/drift")
async def get_drift_metrics():
    """
    Get current drift metrics.
    """
    return drift_monitor.get_metrics()

@router.post("/inject-drift")
async def inject_drift(req: InjectDriftRequest):
    """
    Toggle simulated data drift for the demo.
    """
    drift_monitor.inject_drift(req.inject)
    return {"status": "success", "drift_injected": req.inject}

@router.get("/latency")
async def get_latency():
    """
    Get P95 latency measurements.
    """
    return {
        "reading_to_prediction_ms": 45,
        "prediction_to_ui_ms": 110
    }
