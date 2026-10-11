from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

router = APIRouter(tags=["alerts"])

class AlertActionRequest(BaseModel):
    alert_id: str
    action: str # "acknowledge", "acting", "dismiss"
    reason: Optional[str] = None # "already_managed", "sensor_artifact", "not_clinically_relevant", "prescribed_intervention"
    notes: Optional[str] = None

# In-memory store for alert states and feedback
ALERTS_STORE: Dict[str, Dict[str, Any]] = {
    "alert-synthetic_1": {
        "id": "alert-synthetic_1",
        "patient_id": "synthetic_1",
        "alert_type": "hyper_120",
        "severity": "high",
        "title": "Predicted Hyperglycemic Excursion (>180 mg/dL)",
        "lead_time_min": 45,
        "probability": 0.88,
        "status": "new",
        "created_at": datetime.utcnow().isoformat(),
        "recommended_action": "Prescribe 15-min post-prandial walk or evaluate 4u bolus adjustment",
        "feedback": None
    }
}

@router.get("/patients/{patient_id}")
async def get_patient_alerts(patient_id: str):
    """Fetch active and recent alerts for a given patient"""
    patient_alerts = [a for a in ALERTS_STORE.values() if a.get("patient_id") == patient_id]
    if not patient_alerts and "2" not in patient_id:
        # Default active alert for demo
        default_alert = {
            "id": f"alert-{patient_id}",
            "patient_id": patient_id,
            "alert_type": "hyper_120",
            "severity": "high",
            "title": "Predicted Hyperglycemic Excursion (>180 mg/dL)",
            "lead_time_min": 45,
            "probability": 0.88,
            "status": "new",
            "created_at": datetime.utcnow().isoformat(),
            "recommended_action": "Prescribe 15-min post-prandial walk or evaluate 4u bolus adjustment",
            "feedback": None
        }
        ALERTS_STORE[f"alert-{patient_id}"] = default_alert
        patient_alerts = [default_alert]
    return {"alerts": patient_alerts}

@router.post("/action")
@router.post("/feedback")
async def take_alert_action(req: AlertActionRequest):
    """
    Clinician feedback loop:
    Acknowledge, mark as acting, or dismiss with structured reasoning.
    """
    alert = ALERTS_STORE.get(req.alert_id)
    if not alert:
        # Create on the fly if needed
        alert = {
            "id": req.alert_id,
            "patient_id": "synthetic_1",
            "alert_type": "hyper_120",
            "severity": "high",
            "title": "Predicted Hyperglycemic Excursion",
            "status": "new",
            "created_at": datetime.utcnow().isoformat()
        }
        ALERTS_STORE[req.alert_id] = alert
        
    status_map = {
        "acknowledge": "acknowledged",
        "acting": "acting",
        "dismiss": "dismissed"
    }
    
    new_status = status_map.get(req.action.lower(), "acknowledged")
    alert["status"] = new_status
    alert["updated_at"] = datetime.utcnow().isoformat()
    alert["feedback"] = {
        "action": req.action,
        "reason": req.reason,
        "notes": req.notes,
        "timestamp": datetime.utcnow().isoformat(),
        "clinician_id": "Dr. Demo (IIT Jodhpur)"
    }
    
    return {
        "status": "success",
        "alert_id": req.alert_id,
        "new_status": new_status,
        "message": f"Alert marked as '{new_status}'."
    }
