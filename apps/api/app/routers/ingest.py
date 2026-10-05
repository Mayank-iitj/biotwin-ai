from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import List
from ..schemas.stream import IngestPayload
from ..services.feature_stream import feature_store
from ..services.inference import inference_engine
from ..services.alert_engine import alert_engine
from .stream import stream_manager
import asyncio

router = APIRouter(tags=["ingestion"])

seq_counter = 0

async def process_patient_stream(patient_id: str, readings: List[dict]):
    global seq_counter
    # 1. Add to feature store
    await feature_store.ingest_readings(patient_id, readings)
    
    # 2. Get latest features
    latest_features = await feature_store.get_latest_features(patient_id)
    if not latest_features:
        return
        
    last_ts = latest_features.get('timestamp')
    
    # 3. Inference
    prediction = inference_engine.predict(latest_features)
    
    # 4. Alerts
    alert = alert_engine.process_prediction(patient_id, last_ts, prediction)
    
    # 5. Broadcast to patient channel
    seq_counter += 1
    
    # Broadcast reading
    await stream_manager.broadcast_to_patient(patient_id, {
        "type": "reading",
        "patient_id": patient_id,
        "seq": seq_counter,
        "payload": readings[-1]
    })
    
    # Broadcast prediction
    if prediction:
        seq_counter += 1
        # Convert timestamp to iso format for json serialization
        prediction['timestamp'] = last_ts.isoformat()
        await stream_manager.broadcast_to_patient(patient_id, {
            "type": "prediction",
            "patient_id": patient_id,
            "seq": seq_counter,
            "payload": prediction
        })
        
    # Broadcast alert
    if alert:
        seq_counter += 1
        await stream_manager.broadcast_to_patient(patient_id, {
            "type": "alert",
            "patient_id": patient_id,
            "seq": seq_counter,
            "payload": alert
        })
        
    # Also broadcast cohort tile update occasionally (simplified)
    # Could throttle this in production
    if prediction:
        await stream_manager.broadcast_cohort({
            "type": "cohort_update",
            "patient_id": patient_id,
            "payload": {
                "glucose": readings[-1].get('glucose'),
                "tier": prediction.get('tier'),
                "alert": alert['alert_type'] if alert else None
            }
        })

@router.post("/readings")
async def ingest_readings(payload: IngestPayload, background_tasks: BackgroundTasks):
    # Group readings by patient
    by_patient = {}
    for r in payload.readings:
        if r.patient_id not in by_patient:
            by_patient[r.patient_id] = []
        # Dump model to dict
        d = r.model_dump()
        d['ts'] = d['ts'].isoformat()
        d['sim_ts'] = d['sim_ts'].isoformat()
        by_patient[r.patient_id].append(d)
        
    for pid, readings in by_patient.items():
        # Process asynchronously so we don't block the API response
        background_tasks.add_task(process_patient_stream, pid, readings)
        
    return {"status": "accepted", "count": len(payload.readings)}
