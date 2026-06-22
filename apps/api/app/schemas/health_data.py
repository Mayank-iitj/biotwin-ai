"""Health data schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import date
import uuid


class BloodReportCreate(BaseModel):
    file_url: str
    report_date: Optional[date] = None


class BloodReportValueResponse(BaseModel):
    id: str
    marker: str
    value: float
    unit: Optional[str] = None
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None


class BloodReportResponse(BaseModel):
    id: str
    user_id: str
    file_url: str
    report_date: Optional[date] = None
    status: str
    created_at: str
    values: Optional[list[BloodReportValueResponse]] = None

    class Config:
        from_attributes = True


class WearableDataCreate(BaseModel):
    recorded_at: str
    metric: str
    value: float
    source: Optional[str] = None


class LifestyleLogCreate(BaseModel):
    log_date: date
    exercise_minutes: Optional[int] = None
    sleep_hours: Optional[float] = None
    smoking: Optional[bool] = None
    alcohol_units: Optional[float] = None
    diet_quality_score: Optional[float] = None
    weight_kg: Optional[float] = None


class NutritionLogCreate(BaseModel):
    log_date: date
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    sodium_mg: Optional[float] = None