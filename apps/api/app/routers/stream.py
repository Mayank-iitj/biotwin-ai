from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import asyncio
import random
from datetime import datetime

router = APIRouter()

@router.get("/{patient_id}")
async def stream_patient_data(patient_id: str):
    """Live replay of a patient's sensor data via SSE"""
    async def event_generator():
        glucose = 150
        while True:
            # Simulate streaming data
            glucose += random.uniform(-2, 2.5)
            data = {
                "timestamp": datetime.utcnow().isoformat(),
                "glucose_mgdl": glucose,
                "heart_rate": random.randint(60, 90),
                "prediction": {
                    "prob_hyper": 0.5 if glucose < 170 else 0.8,
                    "tier": "moderate" if glucose < 170 else "high"
                }
            }
            yield {
                "event": "message",
                "data": str(data)
            }
            await asyncio.sleep(1) # Accelerated speed
            
    return EventSourceResponse(event_generator())
