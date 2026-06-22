"""Recommendation schemas"""
from pydantic import BaseModel
from typing import Optional


class RecommendationResponse(BaseModel):
    id: str
    user_id: str
    risk_assessment_id: Optional[str] = None
    category: Optional[str] = None
    text: str
    priority: int
    created_at: str

    class Config:
        from_attributes = True