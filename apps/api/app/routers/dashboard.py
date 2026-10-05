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

    # Get latest blood report for biomarkers
    from app.models.blood_report import BloodReportValue
    from sqlalchemy.orm import selectinload
    
    br_result = await db.execute(
        select(BloodReport)
        .where(BloodReport.user_id == current_user.id)
        .order_by(BloodReport.report_date.desc())
        .limit(1)
    )
    latest_br = br_result.scalar_one_or_none()
    
    biomarkers = []
    if latest_br:
        brv_result = await db.execute(
            select(BloodReportValue).where(BloodReportValue.blood_report_id == latest_br.id)
        )
        for brv in brv_result.scalars().all():
            status = "elevated" if brv.is_abnormal else "optimal"
            target = 100.0 # simplified target logic
            biomarkers.append({
                "name": brv.marker,
                "value": float(brv.value),
                "target": target,
                "unit": brv.unit,
                "status": status
            })

    # Historical Health Data (from LifestyleLog)
    ll_result = await db.execute(
        select(LifestyleLog)
        .where(LifestyleLog.user_id == current_user.id)
        .order_by(LifestyleLog.log_date.asc())
        .limit(30)
    )
    historical_health = []
    for ll in ll_result.scalars().all():
        historical_health.append({
            "month": ll.log_date.strftime("%m-%d"),
            "heartRate": 70, # mock joining with WearableData for now
            "bloodPressure": 120,
            "sleep": float(ll.sleep_hours),
            "activity": float(ll.exercise_minutes),
            "steps": 5000,
            "calories": int(ll.calories) if ll.calories else 2000,
            "weight": float(ll.weight_kg) if ll.weight_kg else 70.0
        })

    # Risk Distribution (calculate from risk summaries)
    risk_distribution = [
        {"name": "Low Risk", "value": 0, "fill": "#22c55e"},
        {"name": "Moderate Risk", "value": 0, "fill": "#eab308"},
        {"name": "High Risk", "value": 0, "fill": "#ef4444"}
    ]
    for r in risk_summaries:
        if r.risk_band == "low":
            risk_distribution[0]["value"] += 1
        elif r.risk_band == "moderate":
            risk_distribution[1]["value"] += 1
        else:
            risk_distribution[2]["value"] += 1
    
    # Filter out zeros
    risk_distribution = [r for r in risk_distribution if r["value"] > 0]
    if not risk_distribution:
        risk_distribution = [{"name": "Low Risk", "value": 1, "fill": "#22c55e"}]

    return DashboardSummaryResponse(
        user_id=str(current_user.id),
        risk_summaries=risk_summaries,
        total_recommendations=total_recommendations,
        recent_activities=activities[:10],
        biomarkerData=biomarkers,
        historicalHealthData=historical_health,
        riskDistribution=risk_distribution
    )