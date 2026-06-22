"""Health data ingestion router"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.blood_report import BloodReport, BloodReportValue
from app.models.wearable import WearableData
from app.models.lifestyle import LifestyleLog, NutritionLog
from app.schemas.health_data import (
    BloodReportCreate, BloodReportResponse,
    WearableDataCreate, LifestyleLogCreate, NutritionLogCreate
)
from app.routers.auth import get_current_user

router = APIRouter()


@router.post("/blood-report", response_model=BloodReportResponse)
async def upload_blood_report(
    blood_report: BloodReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a blood report - in production this would trigger OCR processing"""
    report = BloodReport(
        user_id=current_user.id,
        file_url=blood_report.file_url,
        report_date=blood_report.report_date,
        status="processing"
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/blood-report/{report_id}", response_model=BloodReportResponse)
async def get_blood_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(BloodReport).where(
            BloodReport.id == uuid.UUID(report_id),
            BloodReport.user_id == current_user.id
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Blood report not found")
    return report


@router.get("/blood-reports", response_model=List[BloodReportResponse])
async def list_blood_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(BloodReport)
        .where(BloodReport.user_id == current_user.id)
        .order_by(BloodReport.created_at.desc())
    )
    return result.scalars().all()


@router.post("/wearable/sync", response_model=dict)
async def sync_wearable_data(
    data: List[WearableDataCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Bulk insert wearable data"""
    records = []
    for item in data:
        record = WearableData(
            user_id=current_user.id,
            recorded_at=datetime.fromisoformat(item.recorded_at),
            metric=item.metric,
            value=item.value,
            source=item.source
        )
        records.append(record)
    db.add_all(records)
    await db.commit()
    return {"message": f"Synced {len(records)} records"}


@router.get("/wearable", response_model=List[dict])
async def get_wearable_data(
    metric: str = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(days=days)

    query = select(WearableData).where(
        WearableData.user_id == current_user.id,
        WearableData.recorded_at >= cutoff
    )
    if metric:
        query = query.where(WearableData.metric == metric)

    result = await db.execute(query.order_by(WearableData.recorded_at.desc()))
    records = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "recorded_at": r.recorded_at.isoformat(),
            "metric": r.metric,
            "value": r.value,
            "source": r.source
        }
        for r in records
    ]


@router.post("/lifestyle", response_model=dict)
async def log_lifestyle(
    log: LifestyleLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    lifestyle = LifestyleLog(
        user_id=current_user.id,
        log_date=log.log_date,
        exercise_minutes=log.exercise_minutes,
        sleep_hours=log.sleep_hours,
        smoking=log.smoking,
        alcohol_units=log.alcohol_units,
        diet_quality_score=log.diet_quality_score,
        weight_kg=log.weight_kg
    )
    db.add(lifestyle)
    await db.commit()
    return {"message": "Lifestyle log created", "id": str(lifestyle.id)}


@router.get("/lifestyle", response_model=List[dict])
async def get_lifestyle_logs(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from datetime import timedelta
    cutoff = datetime.utcnow().date() - timedelta(days=days)

    result = await db.execute(
        select(LifestyleLog)
        .where(
            LifestyleLog.user_id == current_user.id,
            LifestyleLog.log_date >= cutoff
        )
        .order_by(LifestyleLog.log_date.desc())
    )
    logs = result.scalars().all()

    return [
        {
            "id": str(l.id),
            "log_date": str(l.log_date),
            "exercise_minutes": l.exercise_minutes,
            "sleep_hours": l.sleep_hours,
            "smoking": l.smoking,
            "alcohol_units": l.alcohol_units,
            "diet_quality_score": l.diet_quality_score,
            "weight_kg": l.weight_kg
        }
        for l in logs
    ]


@router.post("/nutrition", response_model=dict)
async def log_nutrition(
    log: NutritionLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    nutrition = NutritionLog(
        user_id=current_user.id,
        log_date=log.log_date,
        calories=log.calories,
        protein_g=log.protein_g,
        carbs_g=log.carbs_g,
        fat_g=log.fat_g,
        sodium_mg=log.sodium_mg
    )
    db.add(nutrition)
    await db.commit()
    return {"message": "Nutrition log created", "id": str(nutrition.id)}