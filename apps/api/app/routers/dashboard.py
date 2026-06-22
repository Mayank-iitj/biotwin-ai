"""Dashboard router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.risk import RiskAssessment
from app.models.recommendation import Recommendation
from app.models.blood_report import BloodReport
from app.models.lifestyle import LifestyleLog
from app.schemas.dashboard import DashboardSummaryResponse, RiskSummary, RecentActivity
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated dashboard data"""

    # Get latest risk assessments per disease
    risk_result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id)
        .order_by(RiskAssessment.disease, RiskAssessment.assessed_at.desc())
    )
    all_risks = risk_result.scalars().all()

    # Dedupe to latest per disease
    latest_by_disease = {}
    for r in all_risks:
        if r.disease not in latest_by_disease:
            latest_by_disease[r.disease] = r

    risk_summaries = [
        RiskSummary(
            disease=r.disease,
            risk_score=float(r.risk_score),
            risk_band=r.risk_band
        )
        for r in latest_by_disease.values()
    ]

    # Get recommendation count
    rec_result = await db.execute(
        select(Recommendation).where(Recommendation.user_id == current_user.id)
    )
    total_recommendations = len(rec_result.scalars().all())

    # Get recent activities
    activities = []

    # Blood reports
    report_result = await db.execute(
        select(BloodReport)
        .where(BloodReport.user_id == current_user.id)
        .order_by(BloodReport.created_at.desc())
        .limit(3)
    )
    for r in report_result.scalars().all():
        activities.append(RecentActivity(
            type="blood_report",
            description=f"Blood report uploaded ({r.status})",
            date=r.created_at.isoformat()
        ))

    # Lifestyle logs
    cutoff = datetime.utcnow() - timedelta(days=7)
    lifestyle_result = await db.execute(
        select(LifestyleLog)
        .where(
            LifestyleLog.user_id == current_user.id,
            LifestyleLog.log_date >= cutoff.date()
        )
        .order_by(LifestyleLog.log_date.desc())
        .limit(3)
    )
    for l in lifestyle_result.scalars().all():
        activities.append(RecentActivity(
            type="lifestyle",
            description=f"Lifestyle log: {l.exercise_minutes}min exercise, {l.sleep_hours}h sleep",
            date=str(l.log_date)
        ))

    # Sort activities by date
    activities.sort(key=lambda x: x.date, reverse=True)

    return DashboardSummaryResponse(
        user_id=str(current_user.id),
        risk_summaries=risk_summaries,
        total_recommendations=total_recommendations,
        recent_activities=activities[:10]
    )