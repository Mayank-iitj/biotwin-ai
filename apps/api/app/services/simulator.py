"""What-If Simulation Engine"""
from typing import Dict, Any
import uuid


class WhatIfSimulator:
    """Simulate lifestyle changes and their projected risk impact"""

    # Physiologically plausible bounds
    BOUNDS = {
        "exercise_minutes": (-60, 180),  # -1hr to +3hrs per day
        "sleep_hours": (-2, 4),  # -2 to +4 hours
        "weight_kg": (-5, 10),  # -5kg to +10kg
        "diet_quality_score": (-20, 30),  # -20 to +30 points
        "smoking": {"toggle": True},  # can toggle smoking status
    }

    def __init__(self, risk_engine):
        self.risk_engine = risk_engine

    async def simulate(
        self,
        user_id: uuid.UUID,
        modified_factors: Dict[str, float],
        baseline_assessments: Dict[str, Any],
        db
    ) -> Dict[str, float]:
        """Run simulation with modified factors"""

        # Validate and clamp input
        validated_factors = self._validate_factors(modified_factors)

        # Get current features (would load from DB in production)
        current_features = await self._get_current_features(user_id, db)

        # Apply modifications
        modified_features = self._apply_modifications(current_features, validated_factors)

        # Re-run risk models with modified features
        projected = {}
        for disease in self.risk_engine.DISEASES:
            feature_vector = self.risk_engine._build_features(disease, modified_features)
            projected[disease] = self.risk_engine._predict(disease, feature_vector)

        return projected

    def _validate_factors(self, factors: Dict[str, float]) -> Dict[str, float]:
        """Validate and clamp input to physiologically plausible bounds"""

        validated = {}
        for key, value in factors.items():
            if key in self.BOUNDS:
                bounds = self.BOUNDS[key]
                if isinstance(bounds, tuple):
                    validated[key] = max(bounds[0], min(bounds[1], value))
                else:
                    validated[key] = value
        return validated

    async def _get_current_features(self, user_id: uuid.UUID, db) -> Dict[str, Any]:
        """Get current user features from database"""

        # Simplified - would load actual data
        return {
            "blood_markers": {},
            "lifestyle": {
                "exercise_minutes": 30,
                "sleep_hours": 7,
                "weight_kg": 70,
                "smoking": False
            },
            "family_history": []
        }

    def _apply_modifications(self, features: Dict[str, Any], modifications: Dict[str, float]) -> Dict[str, Any]:
        """Apply lifestyle modifications to feature set"""

        modified = {
            "blood_markers": features.get("blood_markers", {}),
            "lifestyle": {**features.get("lifestyle", {}), **modifications},
            "family_history": features.get("family_history", [])
        }

        # Adjust BMI based on weight change
        if "weight_kg" in modifications:
            current_weight = modified["lifestyle"].get("weight_kg", 70)
            modified["lifestyle"]["weight_kg"] = current_weight + modifications["weight_kg"]

        return modified