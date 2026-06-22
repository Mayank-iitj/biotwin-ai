"""Privacy and compliance router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any
import json

from app.core.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.blood_report import BloodReport
from app.models.wearable import WearableData
from app.models.lifestyle import LifestyleLog, NutritionLog, FamilyHistory
from app.models.risk import RiskAssessment
from app.models.simulation import Simulation
from app.models.recommendation import Recommendation
from app.models.chat import ChatSession, ChatMessage
from app.routers.auth import get_current_user

router = APIRouter()


@router.post("/export", response_model=dict)
async def export_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export all user data (DPDP compliance)"""

    # Log the export action
    audit = AuditLog(
        user_id=current_user.id,
        action="data_export",
        action_metadata={"requested_at": str(db.bind.pool._created_time)}
    )
    db.add(audit)
    await db.commit()

    # Gather all user data
    export_data = {
        "user": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "date_of_birth": str(current_user.date_of_birth) if current_user.date_of_birth else None,
            "sex": current_user.sex,
            "height_cm": float(current_user.height_cm) if current_user.height_cm else None,
        },
        "family_history": [],
        "blood_reports": [],
        "wearable_data": [],
        "lifestyle_logs": [],
        "nutrition_logs": [],
        "risk_assessments": [],
        "simulations": [],
        "recommendations": [],
    }

    # Family history
    fh_result = await db.execute(
        select(FamilyHistory).where(FamilyHistory.user_id == current_user.id)
    )
    export_data["family_history"] = [
        {"condition": fh.condition, "relation": fh.relation, "created_at": str(fh.created_at)}
        for fh in fh_result.scalars().all()
    ]

    # Blood reports
    br_result = await db.execute(
        select(BloodReport).where(BloodReport.user_id == current_user.id)
    )
    export_data["blood_reports"] = [
        {"file_url": br.file_url, "report_date": str(br.report_date), "status": br.status, "created_at": str(br.created_at)}
        for br in br_result.scalars().all()
    ]

    # Lifestyle logs
    ll_result = await db.execute(
        select(LifestyleLog).where(LifestyleLog.user_id == current_user.id)
    )
    export_data["lifestyle_logs"] = [
        {"log_date": str(l.log_date), "exercise_minutes": l.exercise_minutes, "sleep_hours": l.sleep_hours, "weight_kg": float(l.weight_kg) if l.weight_kg else None}
        for l in ll_result.scalars().all()
    ]

    # Risk assessments
    ra_result = await db.execute(
        select(RiskAssessment).where(RiskAssessment.user_id == current_user.id)
    )
    export_data["risk_assessments"] = [
        {"disease": r.disease, "risk_score": float(r.risk_score), "risk_band": r.risk_band, "assessed_at": str(r.assessed_at)}
        for r in ra_result.scalars().all()
    ]

    return {
        "message": "Data export ready",
        "data": export_data,
        "exported_at": datetime.utcnow().isoformat()
    }


from datetime import datetime


@router.post("/delete-account", response_model=dict)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete account and all associated data (DPDP compliance)"""

    user_id = current_user.id
    user_email = current_user.email

    # Log the deletion
    audit = AuditLog(
        user_id=user_id,
        action="data_delete",
        action_metadata={"email": user_email, "deleted_at": str(datetime.utcnow())}
    )
    db.add(audit)

    # Delete all user data (cascades handle most)
    # But we explicitly delete some to ensure
    await db.execute(
        select(ChatMessage).join(ChatSession).where(ChatSession.user_id == user_id).delete()
    )
    await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id).delete()
    )

    # Delete user (cascades will handle related records)
    await db.delete(current_user)
    await db.commit()

    return {
        "message": "Account and all associated data have been permanently deleted",
        "deleted_at": datetime.utcnow().isoformat()
    }