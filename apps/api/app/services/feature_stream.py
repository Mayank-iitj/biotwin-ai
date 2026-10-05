import pandas as pd
import numpy as np
from typing import Dict, Any, List
import asyncio
from datetime import datetime, timedelta

# Import the shared extraction function
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'ml'))
try:
    from features.shared import extract_features
except ImportError:
    # Mock fallback if ml not available
    def extract_features(window, static): return {}

class IncrementalFeatureStore:
    def __init__(self):
        # patient_id -> DataFrame
        self.buffers: Dict[str, pd.DataFrame] = {}
        # patient_id -> static dict
        self.static_features: Dict[str, Dict] = {}
        # 7 days of 5-min intervals = 2016 rows max
        self.max_rows = 2016 
        self.lock = asyncio.Lock()

    async def ingest_readings(self, patient_id: str, readings: List[Dict[str, Any]]):
        df_new = pd.DataFrame(readings)
        # Assuming timestamps are 'sim_ts' for simulation time
        df_new = df_new.rename(columns={'sim_ts': 'timestamp', 'glucose': 'glucose_mgdl', 'hr': 'heart_rate', 'hrv': 'hrv_rmssd'})
        
        async with self.lock:
            if patient_id not in self.buffers:
                self.buffers[patient_id] = df_new
            else:
                combined = pd.concat([self.buffers[patient_id], df_new])
                # sort and deduplicate
                combined = combined.sort_values('timestamp').drop_duplicates(subset=['timestamp'], keep='last')
                # enforce max rows
                if len(combined) > self.max_rows:
                    combined = combined.iloc[-self.max_rows:]
                self.buffers[patient_id] = combined
                
    def get_static_features(self, patient_id: str) -> dict:
        if patient_id not in self.static_features:
            # Mock load from DB or EHR service. For now, use dummy static features.
            self.static_features[patient_id] = {
                'age': 55, 'has_t2d': True, 'bmi': 28.5, 'hba1c': 7.2, 
                'fasting_glucose': 130, 'polygenic_risk_score': 0.8, 
                'family_history_t2d': True, 'region_north': 1, 'indian_diet_vegetarian': 0
            }
        return self.static_features[patient_id]

    async def get_latest_features(self, patient_id: str) -> dict:
        async with self.lock:
            if patient_id not in self.buffers:
                return {}
            # We need the last 6 hours (72 rows) for extract_features
            window = self.buffers[patient_id].tail(72).copy()
            
        static = self.get_static_features(patient_id)
        return extract_features(window, static)

feature_store = IncrementalFeatureStore()
