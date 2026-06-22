"""Digital Twin router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.blood_report import BloodReport, BloodReportValue
from app.models.wearable import WearableData
from app.models.lifestyle import LifestyleLog, FamilyHistory
from app.models.risk import RiskAssessment
from app.models.recommendation import Recommendation
from app.schemas.twin import DigitalTwinResponse
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=DigitalTwinResponse)
async def get_digital_twin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get latest blood report
    blood_result = await db.execute(
        select(BloodReport)
        .where(BloodReport.user_id == current_user.id, BloodReport.status == "parsed")
        .order_by(BloodReport.created_at.desc())
    )
    latest_blood_report = blood_result.scalar_one_or_none()

    blood_markers = []
    if latest_blood_report:
        markers_result = await db.execute(
            select(BloodReportValue)
            .where(BloodReportValue.blood_report_id == latest_blood_report.id)
        )
        blood_markers = markers_result.scalars().all()

    # Get recent wearable data (last 7 days)
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(days=7)
    wearable_result = await db.execute(
        select(WearableData)
        .where(
            WearableData.user_id == current_user.id,
            WearableData.recorded_at >= cutoff
        )
        .order_by(WearableData.recorded_at.desc())
        .limit(50)
    )
    recent_wearable = wearable_result.scalars().all()

    # Get latest lifestyle log
    lifestyle_result = await db.execute(
        select(LifestyleLog)
        .where(LifestyleLog.user_id == current_user.id)
        .order_by(LifestyleLog.log_date.desc())
    )
    lifestyle = lifestyle_result.scalar_one_or_none()

    # Get family history
    fh_result = await db.execute(
        select(FamilyHistory).where(FamilyHistory.user_id == current_user.id)
    )
    family_history = fh_result.scalars().all()

    # Get latest risk assessments
    risk_result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id)
        .order_by(RiskAssessment.assessed_at.desc())
    )
    risk_assessments = risk_result.scalars().all()

    # Get recommendations
    rec_result = await db.execute(
        select(Recommendation)
        .where(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.priority.desc())
        .limit(10)
    )
    recommendations = rec_result.scalars().all()

    return DigitalTwinResponse(
        user_id=str(current_user.id),
        latest_blood_report=latest_blood_report,
        blood_markers=list(blood_markers) if blood_markers else None,
        recent_wearable=list(recent_wearable) if recent_wearable else None,
        lifestyle={"weight_kg": lifestyle.weight_kg, "sleep_hours": lifestyle.sleep_hours} if lifestyle else None,
        family_history=list(family_history) if family_history else None,
        risk_assessments=list(risk_assessments)[:5] if risk_assessments else [],
        recommendations=list(recommendations) if recommendations else []
    )


from datetime import datetime