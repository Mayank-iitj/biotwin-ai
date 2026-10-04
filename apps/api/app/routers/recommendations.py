"""Recommendations router"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationResponse
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=List[RecommendationResponse])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get personalized recommendations for the user"""

    result = await db.execute(
        select(Recommendation)
        .where(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.priority.desc())
        .limit(20)
    )
    recommendations = result.scalars().all()

    return recommendations


@router.post("/generate", response_model=List[RecommendationResponse])
async def generate_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate new recommendations based on current risk assessments"""

    # Get latest risk assessments
    from app.models.risk import RiskAssessment

    risk_result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id)
        .order_by(RiskAssessment.assessed_at.desc())
    )
    risk_assessments = risk_result.scalars().all()

    # Generate recommendations based on risk
    new_recommendations = []

    for assessment in risk_assessments:
        if assessment.risk_band == "high":
            rec = Recommendation(
                user_id=current_user.id,
                risk_assessment_id=assessment.id,
                category="medical_followup",
                text=f"Given your {assessment.disease.upper()} risk score of {assessment.risk_score:.0%}, we recommend consulting with a healthcare provider.",
                priority=1
            )
            new_recommendations.append(rec)

        if assessment.disease == "diabetes" and assessment.risk_score > 0.2:
            rec = Recommendation(
                user_id=current_user.id,
                risk_assessment_id=assessment.id,
                category="diet",
                text="Focus on reducing refined carbohydrates and increasing fiber intake to help manage diabetes risk.",
                priority=2 if assessment.risk_score > 0.4 else 3
            )
            new_recommendations.append(rec)

        if assessment.disease == "cvd" and assessment.risk_score > 0.2:
            rec = Recommendation(
                user_id=current_user.id,
                risk_assessment_id=assessment.id,
                category="exercise",
                text="Aim for at least 150 minutes of moderate aerobic activity per week to support cardiovascular health.",
                priority=2
            )
            new_recommendations.append(rec)

    # Add to database
    db.add_all(new_recommendations)
    await db.commit()

    for r in new_recommendations:
        await db.refresh(r)

    return new_recommendations