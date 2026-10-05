from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ReadingData(BaseModel):
    patient_id: str
    ts: datetime
    sim_ts: datetime
    glucose: float
    hr: float
    hrv: float
    steps: int
    sleep_stage: str
    meal_carbs: Optional[float] = 0.0

class IngestPayload(BaseModel):
    readings: List[ReadingData]

class PredictEventResponse(BaseModel):
    patient_id: str
    timestamp: datetime
    sim_ts: datetime
    prob_hyper_120: float
    prob_hypo_60: float
    tier: str # 'low', 'moderate', 'high'
    forecast_30: dict # { '10': val, '50': val, '90': val }
    forecast_60: dict
    forecast_90: dict
    forecast_120: dict
    top_drivers: List[dict] # [ {'feature': name, 'value': val, 'impact': val, 'phrase': text} ]

class StreamMessage(BaseModel):
    type: str # 'reading', 'prediction', 'alert', 'heartbeat'
    patient_id: Optional[str] = None
    sim_ts: Optional[datetime] = None
    wall_ts: datetime = Field(default_factory=datetime.utcnow)
    seq: int
    payload: dict
