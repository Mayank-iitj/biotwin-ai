"""What-If Simulation router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.risk import RiskAssessment
from app.models.simulation import Simulation
from app.schemas.simulation import SimulationCreate, SimulationResponse
from app.routers.auth import get_current_user
from app.services.risk_engine import RiskEngine
from app.services.simulator import WhatIfSimulator

router = APIRouter()
risk_engine = RiskEngine()
simulator = WhatIfSimulator(risk_engine)


@router.post("", response_model=SimulationResponse)
async def run_simulation(
    simulation: SimulationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Run what-if simulation with modified lifestyle factors"""

    # Get baseline risk assessments
    baseline_result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id)
        .order_by(RiskAssessment.assessed_at.desc())
    )
    baseline_assessments = baseline_result.scalars().all()

    if not baseline_assessments:
        raise HTTPException(
            status_code=400,
            detail="No baseline risk assessment found. Run /risk/assess first."
        )

    # Get latest assessment per disease
    baseline_by_disease = {}
    for assessment in baseline_assessments:
        if assessment.disease not in baseline_by_disease:
            baseline_by_disease[assessment.disease] = assessment

    # Run simulation
    projected_scores = await simulator.simulate(
        current_user.id,
        simulation.modified_factors,
        baseline_by_disease,
        db
    )

    # Save simulation
    db_simulation = Simulation(
        user_id=current_user.id,
        baseline_assessment_id=baseline_assessments[0].id if baseline_assessments else None,
        modified_factors=simulation.modified_factors,
        projected_scores=projected_scores
    )
    db.add(db_simulation)
    await db.commit()
    await db.refresh(db_simulation)

    # Build response with deltas
    scores = []
    for disease, projected in projected_scores.items():
        baseline = baseline_by_disease.get(disease)
        baseline_score = baseline.risk_score if baseline else 0
        scores.append({
            "disease": disease,
            "baseline": float(baseline_score),
            "projected": projected,
            "delta": projected - float(baseline_score)
        })

    return SimulationResponse(
        id=str(db_simulation.id),
        user_id=str(db_simulation.user_id),
        baseline_assessment_id=str(db_simulation.baseline_assessment_id) if db_simulation.baseline_assessment_id else None,
        modified_factors=db_simulation.modified_factors,
        projected_scores={k: float(v) for k, v in db_simulation.projected_scores.items()},
        created_at=db_simulation.created_at.isoformat(),
        scores=scores
    )