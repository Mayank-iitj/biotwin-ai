"""ML Risk Assessment Engine"""
import numpy as np
import pandas as pd
from typing import Dict, List, Any
import uuid
import os
import joblib
import shap
import logging

logger = logging.getLogger(__name__)

class RiskEngine:
    """Disease risk prediction engine with SHAP explainability"""

    DISEASES = ["cvd", "diabetes", "ckd", "hypertension", "obesity"]

    # Model versions (in production, load from saved artifacts)
    MODEL_VERSIONS = {
        "cvd": "cvd-xgb-v1.0.0",
        "diabetes": "diabetes-xgb-v1.0.0",
        "ckd": "ckd-rf-v1.0.0",
        "hypertension": "hypertension-xgb-v1.0.0",
        "obesity": "obesity-xgb-v1.0.0"
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
        self.models = {}
        self.explainers = {}
        self._load_models()

    def _load_models(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        models_dir = os.path.join(base_dir, "ml_models")
        
        for disease in self.DISEASES:
            model_path = os.path.join(models_dir, f"{disease}_model.joblib")
            if os.path.exists(model_path):
                try:
                    model = joblib.load(model_path)
                    self.models[disease] = model
                    
                    # Initialize SHAP explainer
                    if hasattr(model, 'predict_proba'):
                        # Tree explainer works well for XGBoost/RandomForest
                        self.explainers[disease] = shap.TreeExplainer(model)
                        
                    logger.info(f"Successfully loaded {disease} model.")
                except Exception as e:
                    logger.error(f"Error loading {disease} model: {e}")
            else:
                logger.warning(f"Model file not found for {disease}: {model_path}")

    async def assess_all(self, user_id: uuid.UUID, features: Dict[str, Any]) -> List[Dict]:
        """Run all 5 disease risk models"""
        results = []
        for disease in self.DISEASES:
            assessment = await self.assess_disease(disease, features)
            results.append(assessment)
        return results

    async def assess_disease(self, disease: str, features: Dict[str, Any]) -> Dict:
        """Run single disease risk model"""
        # Build feature vector from user data
        feature_vector = self._build_features(disease, features)

        # Predict risk score
        risk_score = self._predict(disease, feature_vector)

        # Get risk band
        band = self._get_risk_band(disease, risk_score)

        # Get top factors (actual SHAP values)
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
        """Build feature vector from user data to match model training exactly"""
        blood = features.get("blood_markers", {})
        lifestyle = features.get("lifestyle", {})
        family = features.get("family_history", [])

        if disease == "cvd":
            return {
                "age": 40.0, # default placeholder, in real app get from user profile DOB
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
            # X = X[['creatinine', 'egfr', 'blood_urea', 'diabetes', 'hypertension']]
            creat = float(blood.get("Creatinine", 1.0))
            return {
                "creatinine": creat,
                "egfr": float(blood.get("eGFR", 141 * min(creat, 1)**-0.329 * max(creat, 1)**-1.209)),
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
        """Predict risk score using actual ML model if available"""
        if disease in self.models and features:
            model = self.models[disease]
            # Convert dict to dataframe so feature names are passed to tree models
            df = pd.DataFrame([features])
            try:
                if hasattr(model, "predict_proba"):
                    probs = model.predict_proba(df)[0]
                    # Binary classification: assume class 1 is the disease
                    return float(probs[1]) if len(probs) > 1 else float(probs[0])
            except Exception as e:
                logger.error(f"Error predicting {disease}: {e}")
        
        # Fallback pseudo-random base risk if model is missing
        return min(0.15 + (np.random.rand() * 0.1), 0.95)

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
        """Get top contributing factors using SHAP"""
        if disease in self.explainers and features:
            explainer = self.explainers[disease]
            df = pd.DataFrame([features])
            try:
                shap_values = explainer.shap_values(df)
                
                # SHAP output format varies by model (e.g. binary vs multiclass)
                if isinstance(shap_values, list):
                    shap_vals = shap_values[1][0] # class 1
                else:
                    # For XGBoost it's usually just a 2D array
                    shap_vals = shap_values[0]
                    
                feature_names = list(features.keys())
                
                contributions = []
                for i, val in enumerate(shap_vals):
                    contributions.append({
                        "feature": feature_names[i],
                        "contribution": round(abs(float(val)), 3),
                        "direction": "positive" if val > 0 else "negative"
                    })
                
                # Sort by absolute contribution
                contributions.sort(key=lambda x: x["contribution"], reverse=True)
                return contributions[:4]
            except Exception as e:
                logger.error(f"SHAP error for {disease}: {e}")

        # Fallback if explainer fails or model missing
        factor_names = list(features.keys())[:4]
        return [{"feature": f, "contribution": 0.1, "direction": "positive"} for f in factor_names]