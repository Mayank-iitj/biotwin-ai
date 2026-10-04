"""Risk assessment schemas"""
from pydantic import BaseModel
from typing import Optional, List


class RiskFactor(BaseModel):
    feature: str
    contribution: float
    direction: str  # positive or negative


class RiskAssessmentResponse(BaseModel):
    id: str
    user_id: str
    disease: str
    risk_score: float
    risk_band: str
    top_factors: Optional[List[RiskFactor]] = None
    model_version: str
    assessed_at: str

    class Config:
        from_attributes = True


class RiskHistoryResponse(BaseModel):
    assessments: List[RiskAssessmentResponse]
    disease: str