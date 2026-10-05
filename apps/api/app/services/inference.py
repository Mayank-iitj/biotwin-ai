import os
import joblib
import json
import pandas as pd
from typing import Dict, Any

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'ml', 'artifacts')

class InferenceEngine:
    def __init__(self):
        self.fusion_model = None
        self.hypo_model = None
        self.quantile_models = {}
        self.features_meta = {}
        self.load_models()

    def load_models(self):
        fusion_path = os.path.join(ARTIFACTS_DIR, 'fusion_model.pkl')
        hypo_path = os.path.join(ARTIFACTS_DIR, 'hypo_model.pkl')
        quantile_path = os.path.join(ARTIFACTS_DIR, 'quantile_models.pkl')
        meta_path = os.path.join(ARTIFACTS_DIR, 'features.json')

        if os.path.exists(fusion_path):
            self.fusion_model = joblib.load(fusion_path)
        if os.path.exists(hypo_path):
            self.hypo_model = joblib.load(hypo_path)
        if os.path.exists(quantile_path):
            self.quantile_models = joblib.load(quantile_path)
        if os.path.exists(meta_path):
            with open(meta_path, 'r') as f:
                self.features_meta = json.load(f)

    def predict(self, feature_dict: Dict[str, Any]) -> dict:
        if not self.fusion_model or not feature_dict:
            return {}

        features_list = self.features_meta.get('all', [])
        # Provide defaults for missing features
        row = {f: feature_dict.get(f, 0) for f in features_list}
        df = pd.DataFrame([row])

        # Probabilities
        prob_hyper = float(self.fusion_model.predict_proba(df)[0, 1])
        prob_hypo = float(self.hypo_model.predict_proba(df)[0, 1]) if self.hypo_model else 0.0

        # Tier calculation
        thresholds = self.features_meta.get('thresholds', {'high': 0.5, 'moderate': 0.3})
        tier = 'low'
        if prob_hyper >= thresholds.get('high', 0.5):
            tier = 'high'
        elif prob_hyper >= thresholds.get('moderate', 0.3):
            tier = 'moderate'

        # Quantile forecaster
        forecasts = {'30': {}, '60': {}, '90': {}, '120': {}}
        horizons_map = {'g_plus_30': '30', 'g_plus_60': '60', 'g_plus_90': '90', 'g_plus_120': '120'}
        for h_key, time_key in horizons_map.items():
            if h_key in self.quantile_models:
                for q, model in self.quantile_models[h_key].items():
                    val = float(model.predict(df)[0])
                    forecasts[time_key][str(q)] = val

        return {
            'prob_hyper_120': prob_hyper,
            'prob_hypo_60': prob_hypo,
            'tier': tier,
            'forecast_30': forecasts['30'],
            'forecast_60': forecasts['60'],
            'forecast_90': forecasts['90'],
            'forecast_120': forecasts['120'],
            'top_drivers': [] # To be populated by explain.py (SHAP)
        }

inference_engine = InferenceEngine()
