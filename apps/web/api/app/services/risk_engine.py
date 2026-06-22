"""Lightweight Risk Assessment Engine for Serverless Deployment"""
from typing import Dict, List, Any
import uuid
import logging

logger = logging.getLogger(__name__)

class RiskEngine:
    """Disease risk prediction engine with rule-based explainability"""

    DISEASES = ["cvd", "diabetes", "ckd", "hypertension", "obesity"]

    # Model versions
    MODEL_VERSIONS = {
        "cvd": "cvd-rule-v1.0.0",
        "diabetes": "diabetes-rule-v1.0.0",
        "ckd": "ckd-rule-v1.0.0",
        "hypertension": "hypertension-rule-v1.0.0",
        "obesity": "obesity-rule-v1.0.0"
    }

    # Risk band thresholds
    RISK_BANDS = {
        "cvd": {"low": 0.15, "moderate": 0.45},
        "diabetes": {"low": 0.2, "moderate": 0.5},
        "ckd": {"low": 0.15, "moderate": 0.45},
        "hypertension": {"low": 0.2, "moderate": 0.5},
        "obesity": {"low": 0.25, "moderate": 0.55}
    }

    def __init__(self):
        logger.info("Initializing lightweight RiskEngine for serverless runtime")

    async def assess_all(self, user_id: uuid.UUID, features: Dict[str, Any]) -> List[Dict]:
        """Run all 5 disease risk calculations"""
        results = []
        for disease in self.DISEASES:
            assessment = await self.assess_disease(disease, features)
            results.append(assessment)
        return results

    async def assess_disease(self, disease: str, features: Dict[str, Any]) -> Dict:
        """Run single disease risk calculation"""
        # Build feature vector from user data
        feature_vector = self._build_features(disease, features)

        # Predict risk score
        risk_score = self._predict(disease, feature_vector)

        # Get risk band
        band = self._get_risk_band(disease, risk_score)

        # Get top factors
        top_factors = self._get_top_factors(disease, feature_vector, risk_score)

        return {
            "user_id": str(user_id),
            "disease": disease,
            "risk_score": float(risk_score),
            "risk_band": band,
            "top_factors": top_factors,
            "model_version": self.MODEL_VERSIONS[disease]
        }

    def _build_features(self, disease: str, features: Dict[str, Any]) -> Dict[str, float]:
        """Build feature vector from user data to match model expectations"""
        blood = features.get("blood_markers", {})
        lifestyle = features.get("lifestyle", {})
        family = features.get("family_history", [])

        if disease == "cvd":
            return {
                "age": 40.0, # default placeholder
                "sex": 1.0,  # 1=male, 0=female
                "trestbps": float(blood.get("Systolic BP", 120)),
                "chol": float(blood.get("LDL", 100) + blood.get("HDL", 50)),
                "smoking": 1.0 if lifestyle.get("smoking") else 0.0,
                "family_history": 1.0 if any("heart" in str(f).lower() for f in family) else 0.0
            }
        elif disease == "diabetes":
            weight = lifestyle.get("weight_kg", 70)
            height_m = 1.7 # placeholder height
            return {
                "hba1c": float(blood.get("HbA1c", 5.5)),
                "glucose": float(blood.get("Fasting Glucose", 100)),
                "bmi": float(weight / (height_m ** 2)),
                "age": 40.0,
                "family_diabetes": 1.0 if any("diabetes" in str(f).lower() for f in family) else 0.0
            }
        elif disease == "ckd":
            creat = float(blood.get("Creatinine", 1.0))
            # eGFR CKD-EPI formula approximation
            egfr_val = float(blood.get("eGFR", 141 * min(creat, 1)**-0.329 * max(creat, 1)**-1.209))
            return {
                "creatinine": creat,
                "egfr": egfr_val,
                "blood_urea": float(blood.get("Blood Urea", 15)),
                "diabetes": 1.0 if float(blood.get("HbA1c", 5.5)) > 6.5 else 0.0,
                "hypertension": 1.0 if float(blood.get("Systolic BP", 120)) > 140 else 0.0
            }
        elif disease == "hypertension":
            weight = lifestyle.get("weight_kg", 70)
            return {
                "systolic": float(blood.get("Systolic BP", 120)),
                "diastolic": float(blood.get("Diastolic BP", 80)),
                "sodium": float(blood.get("Sodium", 140)),
                "bmi": float(weight / (1.7 ** 2)),
                "family_hypertension": 1.0 if any("hypertension" in str(f).lower() for f in family) else 0.0
            }
        elif disease == "obesity":
            weight = lifestyle.get("weight_kg", 70)
            return {
                "bmi": float(weight / (1.7 ** 2)),
                "calories": float(lifestyle.get("calories", 2000)),
                "exercise": float(lifestyle.get("exercise_minutes", 30)),
                "diet_score": float(lifestyle.get("diet_quality_score", 50))
            }
        return {}

    def _predict(self, disease: str, features: Dict[str, float]) -> float:
        """Predict risk score using a deterministic mathematical scoring model"""
        if not features:
            return 0.15

        score = 0.05  # Base healthy risk

        if disease == "cvd":
            age = features.get("age", 40.0)
            trestbps = features.get("trestbps", 120.0)
            chol = features.get("chol", 150.0)
            smoking = features.get("smoking", 0.0)
            family_history = features.get("family_history", 0.0)

            score += min(max(age - 30, 0), 50) * 0.004
            score += min(max(trestbps - 120, 0), 80) * 0.003
            score += min(max(chol - 160, 0), 200) * 0.0015
            if smoking > 0:
                score += 0.15
            if family_history > 0:
                score += 0.10

        elif disease == "diabetes":
            hba1c = features.get("hba1c", 5.5)
            glucose = features.get("glucose", 100.0)
            bmi = features.get("bmi", 22.0)
            family_diabetes = features.get("family_diabetes", 0.0)

            score += min(max(hba1c - 5.4, 0), 10) * 0.12
            score += min(max(glucose - 99, 0), 200) * 0.002
            score += min(max(bmi - 24, 0), 30) * 0.015
            if family_diabetes > 0:
                score += 0.08

        elif disease == "ckd":
            creatinine = features.get("creatinine", 1.0)
            egfr = features.get("egfr", 100.0)
            blood_urea = features.get("blood_urea", 15.0)
            diabetes = features.get("diabetes", 0.0)
            hypertension = features.get("hypertension", 0.0)

            if egfr < 90:
                score += min(max(90 - egfr, 0), 90) * 0.008
            score += min(max(creatinine - 1.1, 0), 8) * 0.10
            score += min(max(blood_urea - 20, 0), 100) * 0.002
            if diabetes > 0:
                score += 0.12
            if hypertension > 0:
                score += 0.12

        elif disease == "hypertension":
            systolic = features.get("systolic", 120.0)
            diastolic = features.get("diastolic", 80.0)
            sodium = features.get("sodium", 140.0)
            bmi = features.get("bmi", 22.0)
            family_hypertension = features.get("family_hypertension", 0.0)

            score += min(max(systolic - 120, 0), 80) * 0.007
            score += min(max(diastolic - 80, 0), 50) * 0.008
            score += min(max(sodium - 140, 0), 100) * 0.003
            score += min(max(bmi - 24, 0), 30) * 0.01
            if family_hypertension > 0:
                score += 0.08

        elif disease == "obesity":
            bmi = features.get("bmi", 22.0)
            calories = features.get("calories", 2000.0)
            exercise = features.get("exercise", 30.0)
            diet_score = features.get("diet_score", 50.0)

            score += min(max(bmi - 24, 0), 30) * 0.025
            score += min(max(calories - 2000, 0), 3000) * 0.0001
            if exercise < 30:
                score += min(max(30 - exercise, 0), 30) * 0.004
            if diet_score < 60:
                score += min(max(60 - diet_score, 0), 60) * 0.002

        return min(max(score, 0.02), 0.95)

    def _get_risk_band(self, disease: str, score: float) -> str:
        """Determine risk band from score"""
        bands = self.RISK_BANDS.get(disease, {"low": 0.2, "moderate": 0.5})
        if score < bands["low"]:
            return "low"
        elif score < bands["moderate"]:
            return "moderate"
        else:
            return "high"

    def _get_top_factors(self, disease: str, features: Dict[str, float], score: float) -> List[Dict]:
        """Get top contributing factors dynamically based on feature deviations"""
        contributions = []

        if disease == "cvd":
            age = features.get("age", 40.0)
            trestbps = features.get("trestbps", 120.0)
            chol = features.get("chol", 150.0)
            smoking = features.get("smoking", 0.0)
            family_history = features.get("family_history", 0.0)

            contributions.append({"feature": "age", "contribution": round(min(max(age - 30, 0), 50) * 0.004, 3)})
            contributions.append({"feature": "trestbps", "contribution": round(min(max(trestbps - 120, 0), 80) * 0.003, 3)})
            contributions.append({"feature": "chol", "contribution": round(min(max(chol - 160, 0), 200) * 0.0015, 3)})
            contributions.append({"feature": "smoking", "contribution": 0.15 if smoking > 0 else 0.0})
            contributions.append({"feature": "family_history", "contribution": 0.10 if family_history > 0 else 0.0})

        elif disease == "diabetes":
            hba1c = features.get("hba1c", 5.5)
            glucose = features.get("glucose", 100.0)
            bmi = features.get("bmi", 22.0)
            family_diabetes = features.get("family_diabetes", 0.0)

            contributions.append({"feature": "hba1c", "contribution": round(min(max(hba1c - 5.4, 0), 10) * 0.12, 3)})
            contributions.append({"feature": "glucose", "contribution": round(min(max(glucose - 99, 0), 200) * 0.002, 3)})
            contributions.append({"feature": "bmi", "contribution": round(min(max(bmi - 24, 0), 30) * 0.015, 3)})
            contributions.append({"feature": "family_diabetes", "contribution": 0.08 if family_diabetes > 0 else 0.0})

        elif disease == "ckd":
            creatinine = features.get("creatinine", 1.0)
            egfr = features.get("egfr", 100.0)
            blood_urea = features.get("blood_urea", 15.0)
            diabetes = features.get("diabetes", 0.0)
            hypertension = features.get("hypertension", 0.0)

            contributions.append({"feature": "egfr", "contribution": round(min(max(90 - egfr, 0), 90) * 0.008 if egfr < 90 else 0.0, 3)})
            contributions.append({"feature": "creatinine", "contribution": round(min(max(creatinine - 1.1, 0), 8) * 0.10, 3)})
            contributions.append({"feature": "blood_urea", "contribution": round(min(max(blood_urea - 20, 0), 100) * 0.002, 3)})
            contributions.append({"feature": "diabetes", "contribution": 0.12 if diabetes > 0 else 0.0})
            contributions.append({"feature": "hypertension", "contribution": 0.12 if hypertension > 0 else 0.0})

        elif disease == "hypertension":
            systolic = features.get("systolic", 120.0)
            diastolic = features.get("diastolic", 80.0)
            sodium = features.get("sodium", 140.0)
            bmi = features.get("bmi", 22.0)
            family_hypertension = features.get("family_hypertension", 0.0)

            contributions.append({"feature": "systolic", "contribution": round(min(max(systolic - 120, 0), 80) * 0.007, 3)})
            contributions.append({"feature": "diastolic", "contribution": round(min(max(diastolic - 80, 0), 50) * 0.008, 3)})
            contributions.append({"feature": "sodium", "contribution": round(min(max(sodium - 140, 0), 100) * 0.003, 3)})
            contributions.append({"feature": "bmi", "contribution": round(min(max(bmi - 24, 0), 30) * 0.01, 3)})
            contributions.append({"feature": "family_hypertension", "contribution": 0.08 if family_hypertension > 0 else 0.0})

        elif disease == "obesity":
            bmi = features.get("bmi", 22.0)
            calories = features.get("calories", 2000.0)
            exercise = features.get("exercise", 30.0)
            diet_score = features.get("diet_score", 50.0)

            contributions.append({"feature": "bmi", "contribution": round(min(max(bmi - 24, 0), 30) * 0.025, 3)})
            contributions.append({"feature": "calories", "contribution": round(min(max(calories - 2000, 0), 3000) * 0.0001, 3)})
            contributions.append({"feature": "exercise", "contribution": round(min(max(30 - exercise, 0), 30) * 0.004 if exercise < 30 else 0.0, 3)})
            contributions.append({"feature": "diet_score", "contribution": round(min(max(60 - diet_score, 0), 60) * 0.002 if diet_score < 60 else 0.0, 3)})

        # Map directions
        top_factors = []
        for c in contributions:
            if c["contribution"] > 0:
                top_factors.append({
                    "feature": c["feature"],
                    "contribution": c["contribution"],
                    "direction": "positive"
                })
        
        # Sort by contribution descending
        top_factors.sort(key=lambda x: x["contribution"], reverse=True)

        # Return top 4 factors (with default fillers if fewer than 4 features contributing)
        while len(top_factors) < 4 and features:
            for f in features.keys():
                if f not in [tf["feature"] for tf in top_factors]:
                    top_factors.append({
                        "feature": f,
                        "contribution": 0.01,
                        "direction": "positive"
                    })
                if len(top_factors) >= 4:
                    break
        
        return top_factors[:4]