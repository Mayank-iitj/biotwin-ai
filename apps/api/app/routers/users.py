"""User profile router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.lifestyle import FamilyHistory
from app.schemas.user import UserUpdate, UserResponse, FamilyHistoryCreate, FamilyHistoryResponse
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/family-history", response_model=FamilyHistoryResponse)
async def add_family_history(
    family_history: FamilyHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    fh = FamilyHistory(
        user_id=current_user.id,
        condition=family_history.condition,
        relation=family_history.relation
    )
    db.add(fh)
    await db.commit()
    await db.refresh(fh)
    return fh


@router.get("/me/family-history", response_model=List[FamilyHistoryResponse])
async def get_family_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FamilyHistory).where(FamilyHistory.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/me/acknowledge-disclaimer")
async def acknowledge_disclaimer(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from datetime import datetime
    current_user.disclaimer_acknowledged_at = datetime.utcnow()
    await db.commit()
    return {"message": "Disclaimer acknowledged", "acknowledged_at": current_user.disclaimer_acknowledged_at}