from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
import json
import random
import math

from ..services.explain import explain_prediction
from ..services.inference import inference_engine
from ..services.alert_engine import alert_engine

router = APIRouter(tags=["streaming"])

class StreamManager:
    def __init__(self):
        # patient_id -> list of connected websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # cohort connections
        self.cohort_connections: List[WebSocket] = []
        self.seq_counter = 0

    def next_seq(self) -> int:
        self.seq_counter += 1
        return self.seq_counter

    async def connect_patient(self, websocket: WebSocket, patient_id: str):
        await websocket.accept()
        if patient_id not in self.active_connections:
            self.active_connections[patient_id] = []
        self.active_connections[patient_id].append(websocket)

    def disconnect_patient(self, websocket: WebSocket, patient_id: str):
        if patient_id in self.active_connections:
            if websocket in self.active_connections[patient_id]:
                self.active_connections[patient_id].remove(websocket)
            if not self.active_connections[patient_id]:
                del self.active_connections[patient_id]

    async def broadcast_to_patient(self, patient_id: str, message: dict):
        if patient_id in self.active_connections:
            for connection in self.active_connections[patient_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass
                    
    async def connect_cohort(self, websocket: WebSocket):
        await websocket.accept()
        self.cohort_connections.append(websocket)
        
    def disconnect_cohort(self, websocket: WebSocket):
        if websocket in self.cohort_connections:
            self.cohort_connections.remove(websocket)
            
    async def broadcast_cohort(self, message: dict):
        for connection in self.cohort_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

stream_manager = StreamManager()

# Realistic physiological trajectory generator for Demo & Live Replay
def generate_patient_history(patient_id: str, num_points: int = 24) -> List[dict]:
    now = datetime.utcnow()
    history = []
    
    # Baseline for patient
    base_glucose = 135 if "2" not in patient_id else 95
    has_t2d = "2" not in patient_id
    
    # Simulate a post-prandial excursion curve
    for i in range(num_points):
        ts = now - timedelta(minutes=(num_points - 1 - i) * 5)
        # Excursion curve peaking 4-6 points ago
        progress = i / max(1, num_points - 1)
        if has_t2d:
            # Rise from 120 to ~195 mg/dL
            wave = math.sin(progress * math.pi) * 65.0
            glucose = round(base_glucose + wave + random.uniform(-4, 4), 1)
            hr = round(72 + (glucose - 100) * 0.12 + random.uniform(-3, 3))
            prob = min(0.96, max(0.2, (glucose - 130) / 70.0 + random.uniform(-0.03, 0.03)))
        else:
            glucose = round(92 + random.uniform(-5, 6), 1)
            hr = round(68 + random.uniform(-3, 3))
            prob = 0.08
            
        tier = "high" if prob >= 0.70 else ("moderate" if prob >= 0.40 else "low")
        
        history.append({
            "timestamp": ts.isoformat(),
            "time": ts.strftime("%H:%M:%S"),
            "glucose": glucose,
            "glucose_mgdl": glucose,
            "hr": hr,
            "heart_rate": hr,
            "hrv": round(38 - (hr - 70) * 0.3, 1),
            "steps": random.randint(20, 150),
            "probability": round(prob, 2),
            "tier": tier
        })
    return history


@router.get("/patients/{patient_id}/timeline")
async def get_patient_timeline(patient_id: str):
    """Initial timeline for the clinician chart"""
    history = generate_patient_history(patient_id, num_points=24)
    return {"patient_id": patient_id, "timeline": history}


@router.post("/{patient_id}/control")
async def control_stream(patient_id: str, req: Request):
    """Play, pause, speed control for replay stream"""
    body = await req.json()
    action = body.get("action", "play")
    speed = body.get("speed", 60)
    return {"status": "ok", "action": action, "speed": speed, "patient_id": patient_id}


@router.websocket("/patients/{patient_id}")
async def websocket_endpoint(websocket: WebSocket, patient_id: str):
    await stream_manager.connect_patient(websocket, patient_id)
    
    # Track stream state
    is_paused = False
    speed_factor = 60 # 60x speed default: 5 min of bio-time every 1.5 seconds
    interval_sec = 1.5
    
    # State tracking for continuous curve
    current_glucose = 188.0 if "2" not in patient_id else 96.0
    current_hr = 82
    sim_time = datetime.utcnow()
    trend = 1.2 # rising
    
    # 1. Send initial history backfill immediately so the UI is NEVER empty
    initial_history = generate_patient_history(patient_id, num_points=20)
    if initial_history:
        current_glucose = initial_history[-1]["glucose"]
        current_hr = initial_history[-1]["hr"]
        
    await websocket.send_json({
        "type": "init",
        "patient_id": patient_id,
        "payload": {
            "history": initial_history
        }
    })

    # Background streamer loop
    async def stream_worker():
        nonlocal current_glucose, current_hr, sim_time, trend
        while True:
            try:
                if not is_paused:
                    sim_time += timedelta(minutes=5)
                    
                    # Physiological drift/oscillation
                    if current_glucose > 225:
                        trend = -1.8 # begins clearing
                    elif current_glucose < 140 and "2" not in patient_id:
                        trend = 1.5 # post-prandial rise
                    elif "2" in patient_id:
                        trend = random.uniform(-0.5, 0.5)
                        
                    current_glucose = round(max(55.0, min(360.0, current_glucose + trend + random.uniform(-2.0, 2.0))), 1)
                    current_hr = round(max(50, min(140, 74 + (current_glucose - 120) * 0.1 + random.uniform(-2, 2))))
                    current_hrv = round(max(15.0, 45.0 - (current_hr - 65) * 0.4), 1)
                    
                    # Model probability & tier calculation
                    if "2" in patient_id:
                        prob_hyper = round(random.uniform(0.04, 0.12), 2)
                        prob_hypo = 0.01
                        tier = "low"
                    else:
                        prob_hyper = round(min(0.98, max(0.15, (current_glucose - 130) / 75.0 + random.uniform(-0.02, 0.02))), 2)
                        prob_hypo = round(0.02 if current_glucose > 80 else 0.85, 2)
                        tier = "high" if prob_hyper >= 0.75 else ("moderate" if prob_hyper >= 0.40 else "low")
                    
                    # SHAP explanations
                    features = {
                        "glucose": current_glucose,
                        "hr": current_hr,
                        "meal_carbs": 75 if "2" not in patient_id else 30,
                        "sleep_duration": 5.4 if "2" not in patient_id else 7.8,
                        "hba1c": 8.2 if "2" not in patient_id else 5.4
                    }
                    drivers = explain_prediction(features)
                    
                    # Quantile Forecast
                    forecast_band = {
                        "30m": {"p10": round(current_glucose + 5), "p50": round(current_glucose + 18), "p90": round(current_glucose + 32)},
                        "60m": {"p10": round(current_glucose + 10), "p50": round(current_glucose + 26), "p90": round(current_glucose + 48)},
                        "90m": {"p10": round(current_glucose + 2), "p50": round(current_glucose + 15), "p90": round(current_glucose + 35)},
                        "120m": {"p10": round(current_glucose - 15), "p50": round(current_glucose - 5), "p90": round(current_glucose + 15)}
                    }
                    
                    # Alert generation
                    alert_payload = None
                    if tier == "high" and current_glucose >= 170:
                        alert_payload = {
                            "id": f"alert-{int(sim_time.timestamp())}",
                            "alert_type": "hyper_120",
                            "severity": "high",
                            "title": "Predicted Hyperglycemic Excursion (>180 mg/dL)",
                            "lead_time_min": 45,
                            "probability": prob_hyper,
                            "status": "new",
                            "recommended_action": "Administer 15-min post-prandial walk or evaluate 4u bolus"
                        }
                    
                    seq = stream_manager.next_seq()
                    payload = {
                        "timestamp": sim_time.isoformat(),
                        "sim_ts": sim_time.isoformat(),
                        "time": sim_time.strftime("%H:%M:%S"),
                        "glucose": current_glucose,
                        "glucose_mgdl": current_glucose,
                        "heart_rate": current_hr,
                        "hr": current_hr,
                        "hrv": current_hrv,
                        "steps": random.randint(10, 80),
                        "prob_hyper_120": prob_hyper,
                        "probability": prob_hyper,
                        "prob_hypo_60": prob_hypo,
                        "tier": tier,
                        "forecast": forecast_band,
                        "top_drivers": drivers,
                        "alert": alert_payload
                    }
                    
                    # Broadcast packet
                    await websocket.send_json({
                        "type": "prediction",
                        "patient_id": patient_id,
                        "seq": seq,
                        "payload": payload
                    })
                    
                await asyncio.sleep(interval_sec)
            except asyncio.CancelledError:
                break
            except Exception as e:
                # Connection dropped or error
                break

    worker_task = asyncio.create_task(stream_worker())
    
    try:
        while True:
            # Receive client control messages
            text_data = await websocket.receive_text()
            try:
                msg = json.loads(text_data)
                action = msg.get("action")
                if action == "pause":
                    is_paused = True
                elif action == "play" or action == "resume":
                    is_paused = False
                elif action == "speed":
                    val = msg.get("value", 60)
                    interval_sec = max(0.3, 90.0 / float(val))
                elif action == "meal":
                    carbs = msg.get("carbs", 70)
                    trend += (carbs / 25.0)
            except Exception:
                pass
    except WebSocketDisconnect:
        worker_task.cancel()
        stream_manager.disconnect_patient(websocket, patient_id)
    except Exception:
        worker_task.cancel()
        stream_manager.disconnect_patient(websocket, patient_id)


@router.websocket("/cohort")
async def websocket_cohort_endpoint(websocket: WebSocket):
    await stream_manager.connect_cohort(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        stream_manager.disconnect_cohort(websocket)

