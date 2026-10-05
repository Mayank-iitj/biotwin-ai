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


class HistoricalHealth(BaseModel):
    month: str
    heartRate: float
    bloodPressure: float
    sleep: float
    activity: float
    steps: int
    calories: int
    weight: float

class Biomarker(BaseModel):
    name: str
    value: float
    target: float
    unit: str
    status: str

class RiskDistribution(BaseModel):
    name: str
    value: float
    fill: str

class DashboardSummaryResponse(BaseModel):
    user_id: str
    risk_summaries: List[RiskSummary]
    total_recommendations: int
    recent_activities: List[RecentActivity]
    historicalHealthData: List[HistoricalHealth] = []
    biomarkerData: List[Biomarker] = []
    riskDistribution: List[RiskDistribution] = []
    disclaimer: str = "BioTwin AI provides wellness risk estimates, not medical diagnoses."