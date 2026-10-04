"""Risk assessment router"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.risk import RiskAssessment
from app.models.blood_report import BloodReportValue
from app.models.lifestyle import LifestyleLog, FamilyHistory
from app.schemas.risk import RiskAssessmentResponse, RiskHistoryResponse
from app.routers.auth import get_current_user
from app.services.risk_engine import RiskEngine

router = APIRouter()
risk_engine = RiskEngine()


@router.post("/assess", response_model=List[RiskAssessmentResponse])
async def assess_risk(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger risk assessment for all 5 diseases"""

    # Gather user features
    features = await gather_user_features(current_user.id, db)

    # Run risk engine
    assessments = await risk_engine.assess_all(current_user.id, features)

    # Save to database
    db_assessments = []
    for assessment in assessments:
        db_assessment = RiskAssessment(
            user_id=current_user.id,
            disease=assessment["disease"],
            risk_score=assessment["risk_score"],
            risk_band=assessment["risk_band"],
            top_factors=assessment["top_factors"],
            model_version=assessment["model_version"]
        )
        db.add(db_assessment)
        db_assessments.append(db_assessment)

    await db.commit()

    # Refresh and return
    for a in db_assessments:
        await db.refresh(a)

    return db_assessments


@router.get("/history", response_model=RiskHistoryResponse)
async def get_risk_history(
    disease: str = Query(..., description="Disease type: diabetes, cvd, hypertension, ckd, obesity"),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get historical risk assessments for a disease"""

    result = await db.execute(
        select(RiskAssessment)
        .where(
            RiskAssessment.user_id == current_user.id,
            RiskAssessment.disease == disease
        )
        .order_by(RiskAssessment.assessed_at.desc())
        .limit(limit)
    )
    assessments = result.scalars().all()

    return RiskHistoryResponse(
        assessments=list(assessments),
        disease=disease
    )


async def gather_user_features(user_id: uuid.UUID, db: AsyncSession) -> dict:
    """Gather all user features for risk assessment"""

    # Blood markers
    blood_result = await db.execute(
        select(BloodReportValue).join(BloodReport).where(
            BloodReport.user_id == user_id,
            BloodReport.status == "parsed"
        )
    )
    blood_values = blood_result.scalars().all()
    blood_markers = {v.marker: v.value for v in blood_values}

    # Latest lifestyle
    lifestyle_result = await db.execute(
        select(LifestyleLog)
        .where(LifestyleLog.user_id == user_id)
        .order_by(LifestyleLog.log_date.desc())
    )
    lifestyle = lifestyle_result.scalar_one_or_none()

    # Family history
    fh_result = await db.execute(
        select(FamilyHistory).where(FamilyHistory.user_id == user_id)
    )
    family_conditions = [fh.condition for fh in fh_result.scalars().all()]

    return {
        "blood_markers": blood_markers,
        "lifestyle": {
            "exercise_minutes": lifestyle.exercise_minutes if lifestyle else None,
            "sleep_hours": lifestyle.sleep_hours if lifestyle else None,
            "smoking": lifestyle.smoking if lifestyle else None,
            "alcohol_units": lifestyle.alcohol_units if lifestyle else None,
            "weight_kg": lifestyle.weight_kg if lifestyle else None
        },
        "family_history": family_conditions
    }