import uuid
from datetime import datetime, timedelta
import random
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blood_report import BloodReport, BloodReportValue
from app.models.wearable import WearableData
from app.models.lifestyle import LifestyleLog, FamilyHistory
from app.models.risk import RiskAssessment
from app.models.recommendation import Recommendation
from app.services.risk_engine import RiskEngine

import os
import json

async def seed_user_data(user_id: uuid.UUID, db: AsyncSession):
    """Seed real Fitbit data if available, otherwise fallback to dummy data."""
    
    # Try to load real Fitbit data
    fitbit_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "lib", "fitbit-data-merged.json")
    fitbit_records = []
    if os.path.exists(fitbit_path):
        try:
            with open(fitbit_path, "r") as f:
                fitbit_records = json.load(f)
        except Exception:
            pass

    # 1. Lifestyle Logs
    lifestyle = None
    if fitbit_records:
        for rec in fitbit_records:
            log_date = datetime.strptime(rec["date"], "%Y-%m-%d").date()
            lifestyle = LifestyleLog(
                user_id=user_id,
                log_date=log_date,
                sleep_hours=rec["sleep_hours"],
                exercise_minutes=rec["active_minutes"],
                smoking=False,
                alcohol_units=0,
                weight_kg=rec["weight_kg"],
                diet_quality_score=75,
                calories=rec["calories"]
            )
            db.add(lifestyle)
    else:
        # Fallback lifestyle log
        lifestyle = LifestyleLog(
            user_id=user_id,
            log_date=datetime.utcnow().date(),
            sleep_hours=random.uniform(5.5, 8.5),
            exercise_minutes=random.randint(10, 60),
            smoking=random.choice([True, False, False, False]),
            alcohol_units=random.randint(0, 10),
            weight_kg=random.uniform(60.0, 95.0),
            diet_quality_score=random.randint(40, 90),
            calories=random.randint(1800, 3000)
        )
        db.add(lifestyle)

    # 2. Family History
    conditions = ["diabetes", "hypertension", "heart_disease", "ckd", "obesity"]
    user_conditions = random.sample(conditions, k=random.randint(0, 2))
    for condition in user_conditions:
        fh = FamilyHistory(
            user_id=user_id,
            condition=condition,
            relationship=random.choice(["parent", "grandparent", "sibling"])
        )
        db.add(fh)

    # 3. Blood Report
    blood_report = BloodReport(
        user_id=user_id,
        report_date=datetime.utcnow().date(),
        status="parsed",
        file_url="https://example.com/dummy_report.pdf",
        extracted_text="Dummy blood report content"
    )
    db.add(blood_report)
    await db.commit() # commit to get blood_report id
    await db.refresh(blood_report)

    # Blood Report Values
    markers = [
        ("HbA1c", random.uniform(4.5, 7.5), "%", "4.0-5.6"),
        ("Fasting Glucose", random.uniform(80, 140), "mg/dL", "70-99"),
        ("LDL", random.uniform(80, 160), "mg/dL", "<100"),
        ("HDL", random.uniform(30, 70), "mg/dL", ">40"),
        ("Systolic BP", random.uniform(110, 150), "mmHg", "<120"),
        ("Diastolic BP", random.uniform(70, 95), "mmHg", "<80"),
        ("Sodium", random.uniform(130, 150), "mEq/L", "135-145"),
        ("Creatinine", random.uniform(0.6, 1.5), "mg/dL", "0.7-1.3"),
        ("eGFR", random.uniform(50, 120), "mL/min", ">90")
    ]
    for marker, value, unit, ref in markers:
        br_value = BloodReportValue(
            blood_report_id=blood_report.id,
            marker=marker,
            value=value,
            unit=unit,
            reference_range=ref,
            is_abnormal=False
        )
        db.add(br_value)
        
    # 4. Wearable Data
    if fitbit_records:
        for rec in fitbit_records:
            log_date = datetime.strptime(rec["date"], "%Y-%m-%d").date()
            recorded_at = datetime.combine(log_date, datetime.min.time())
            wd = WearableData(
                user_id=user_id,
                source="fitbit",
                metric_type="heart_rate",
                value=rec["heart_rate_avg"],
                recorded_at=recorded_at
            )
            db.add(wd)
    else:
        now = datetime.utcnow()
        for i in range(7):
            wd = WearableData(
                user_id=user_id,
                source="dummy",
                metric_type="heart_rate",
                value=random.uniform(60, 100),
                recorded_at=now - timedelta(days=i)
            )
            db.add(wd)
    await db.commit()

    # 5. Risk Assessment (via RiskEngine)
    features = {
        "blood_markers": {m[0]: m[1] for m in markers},
        "lifestyle": {
            "exercise_minutes": lifestyle.exercise_minutes if lifestyle else 30,
            "sleep_hours": lifestyle.sleep_hours if lifestyle else 7.5,
            "smoking": lifestyle.smoking if lifestyle else False,
            "alcohol_units": lifestyle.alcohol_units if lifestyle else 0,
            "weight_kg": lifestyle.weight_kg if lifestyle else 75.0,
            "calories": lifestyle.calories if lifestyle else 2000,
            "diet_quality_score": lifestyle.diet_quality_score if lifestyle else 70
        },
        "family_history": user_conditions
    }
    
    engine_inst = RiskEngine()
    assessments = await engine_inst.assess_all(user_id, features)
    
    for assessment in assessments:
        db_assessment = RiskAssessment(
            user_id=user_id,
            disease=assessment["disease"],
            risk_score=assessment["risk_score"],
            risk_band=assessment["risk_band"],
            top_factors=assessment["top_factors"],
            model_version=assessment["model_version"],
            assessed_at=datetime.utcnow()
        )
        db.add(db_assessment)
        
    # 6. Recommendations
    recs = [
        Recommendation(
            user_id=user_id,
            category="lifestyle",
            title="Increase daily steps",
            text="Try to add 2,000 more steps to your daily routine.",
            priority=2
        ),
        Recommendation(
            user_id=user_id,
            category="nutrition",
            title="Reduce sodium intake",
            text="Avoid processed foods to help lower your blood pressure risk.",
            priority=3
        )
    ]
    for r in recs:
        db.add(r)
        
    await db.commit()
