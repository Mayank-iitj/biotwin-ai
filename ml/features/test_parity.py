import pandas as pd
import numpy as np
from features.shared import extract_features
import os

def test_feature_parity():
    print("Testing feature parity between batch (vectorized) and streaming (shared.py) functions...")
    
    # Create sample sensor data
    np.random.seed(42)
    dates = pd.date_range('2026-01-01', periods=100, freq='5min')
    df = pd.DataFrame({
        'patient_id': 'test_patient',
        'timestamp': dates,
        'glucose_mgdl': np.random.normal(120, 20, 100),
        'heart_rate': np.random.normal(70, 5, 100),
        'hrv_rmssd': np.random.normal(50, 10, 100),
        'steps': np.random.poisson(10, 100),
        'meal_carbs': np.where(np.random.random(100) < 0.05, 50, 0)
    })
    
    # 1. Batch vectorized
    window_size = 72
    batch_df = df.copy()
    batch_df['glucose_mean_6h'] = batch_df['glucose_mgdl'].rolling(window_size, min_periods=12).mean()
    batch_df['glucose_15m_delta'] = batch_df['glucose_mgdl'].diff(3)
    batch_df['steps_1h'] = batch_df['steps'].rolling(12, min_periods=1).sum()
    
    # 2. Streaming (shared.py) on the 80th index
    idx = 80
    window = df.iloc[max(0, idx - window_size + 1):idx + 1].copy()
    static = {'age': 50, 'bmi': 25}
    streaming_feats = extract_features(window, static)
    
    # 3. Compare
    batch_row = batch_df.iloc[idx]
    
    assert np.isclose(batch_row['glucose_mean_6h'], streaming_feats['glucose_mean_6h']), "Mean mismatch"
    assert np.isclose(batch_row['glucose_15m_delta'], streaming_feats['glucose_15m_delta']), "Delta mismatch"
    assert np.isclose(batch_row['steps_1h'], streaming_feats['steps_1h']), "Steps mismatch"
    
    print("Feature parity test passed! Batch and Streaming produce identical outputs.")

if __name__ == "__main__":
    test_feature_parity()
