"""Simulation schemas"""
from pydantic import BaseModel
from typing import Dict, Optional


class SimulationCreate(BaseModel):
    modified_factors: Dict[str, float]


class ProjectedScore(BaseModel):
    disease: str
    baseline: float
    projected: float
    delta: float


class SimulationResponse(BaseModel):
    id: str
    user_id: str
    baseline_assessment_id: Optional[str] = None
    modified_factors: Dict[str, float]
    projected_scores: Dict[str, float]
    created_at: str
    scores: Optional[list[ProjectedScore]] = None

    class Config:
        from_attributes = True