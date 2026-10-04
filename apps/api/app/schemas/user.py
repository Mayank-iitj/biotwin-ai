"""User schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    disclaimer_acknowledged_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FamilyHistoryCreate(BaseModel):
    condition: str
    relation: str


class FamilyHistoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    condition: str
    relation: str
    created_at: datetime

    class Config:
        from_attributes = True