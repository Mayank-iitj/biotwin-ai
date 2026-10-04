"""Digital Twin schemas"""
from pydantic import BaseModel
from typing import Optional, List
from app.schemas.user import FamilyHistoryResponse
from app.schemas.health_data import BloodReportResponse, BloodReportValueResponse, WearableDataCreate
from app.schemas.risk import RiskAssessmentResponse
from app.schemas.recommendation import RecommendationResponse


class DigitalTwinResponse(BaseModel):
    user_id: str
    latest_blood_report: Optional[BloodReportResponse] = None
    blood_markers: Optional[List[BloodReportValueResponse]] = None
    recent_wearable: Optional[List[WearableDataCreate]] = None
    lifestyle: Optional[dict] = None
    family_history: Optional[List[FamilyHistoryResponse]] = None
    risk_assessments: List[RiskAssessmentResponse]
    recommendations: List[RecommendationResponse]