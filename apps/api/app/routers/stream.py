from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from sse_starlette.sse import EventSourceResponse
from typing import Dict, List
import asyncio
import json

router = APIRouter(tags=["streaming"])

class StreamManager:
    def __init__(self):
        # patient_id -> list of connected websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # cohort connections
        self.cohort_connections: List[WebSocket] = []

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
                except:
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
            except:
                pass

stream_manager = StreamManager()

@router.websocket("/patients/{patient_id}")
async def websocket_endpoint(websocket: WebSocket, patient_id: str):
    await stream_manager.connect_patient(websocket, patient_id)
    try:
        while True:
            # wait for messages (e.g. control messages)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        stream_manager.disconnect_patient(websocket, patient_id)

@router.websocket("/cohort")
async def websocket_cohort_endpoint(websocket: WebSocket):
    await stream_manager.connect_cohort(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        stream_manager.disconnect_cohort(websocket)
