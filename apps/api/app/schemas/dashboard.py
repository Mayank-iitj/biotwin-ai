"""Dashboard schemas"""
from pydantic import BaseModel
from typing import List, Optional


class RiskSummary(BaseModel):
    disease: str
    risk_score: float
    risk_band: str


class RecentActivity(BaseModel):
    type: str
    description: str
    date: str


class DashboardSummaryResponse(BaseModel):
    user_id: str
    risk_summaries: List[RiskSummary]
    total_recommendations: int
    recent_activities: List[RecentActivity]
    disclaimer: str = "BioTwin AI provides wellness risk estimates, not medical diagnoses."