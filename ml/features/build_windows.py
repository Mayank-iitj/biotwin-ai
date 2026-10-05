import os
import pandas as pd
import numpy as np
from tqdm import tqdm

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
FEATURES_DIR = os.path.join(DATA_DIR, 'features')

os.makedirs(FEATURES_DIR, exist_ok=True)

def build_features():
    print("Loading datasets...")
    patients = pd.read_parquet(os.path.join(PROCESSED_DIR, 'patients.parquet'))
    sensors = pd.read_parquet(os.path.join(PROCESSED_DIR, 'sensor_series.parquet'))
    
    # Sort by time
    sensors = sensors.sort_values(['patient_id', 'timestamp']).reset_index(drop=True)
    
    # We want sliding prediction points every 15 min.
    # We can just downsample the sensor points to every 15 mins for labels and join a 6h rolling window
    print("Computing rolling features...")
    
    # Create patient-specific groups
    grouped = sensors.groupby('patient_id')
    
    # Calculate rolling stats (6h = 72 * 5m intervals)
    window_size = 72 
    
    sensors['glucose_mean_6h'] = grouped['glucose_mgdl'].transform(lambda x: x.rolling(window_size, min_periods=12).mean())
    sensors['glucose_std_6h'] = grouped['glucose_mgdl'].transform(lambda x: x.rolling(window_size, min_periods=12).std())
    sensors['glucose_min_6h'] = grouped['glucose_mgdl'].transform(lambda x: x.rolling(window_size, min_periods=12).min())
    sensors['glucose_max_6h'] = grouped['glucose_mgdl'].transform(lambda x: x.rolling(window_size, min_periods=12).max())
    
    # Calculate TIR (70-180) over 6h
    sensors['in_range'] = (sensors['glucose_mgdl'] >= 70) & (sensors['glucose_mgdl'] <= 180)
    sensors['tir_6h'] = grouped['in_range'].transform(lambda x: x.rolling(window_size, min_periods=12).mean())
    
    # Calculate TAR (>180)
    sensors['above_180'] = (sensors['glucose_mgdl'] > 180)
    sensors['tar_6h'] = grouped['above_180'].transform(lambda x: x.rolling(window_size, min_periods=12).mean())
    
    # Dynamic features
    sensors['glucose_15m_delta'] = grouped['glucose_mgdl'].diff(3) # 15 mins = 3 steps
    sensors['glucose_30m_delta'] = grouped['glucose_mgdl'].diff(6)
    sensors['glucose_60m_delta'] = grouped['glucose_mgdl'].diff(12)
    
    sensors['hr_mean_6h'] = grouped['heart_rate'].transform(lambda x: x.rolling(window_size, min_periods=12).mean())
    sensors['hrv_mean_6h'] = grouped['hrv_rmssd'].transform(lambda x: x.rolling(window_size, min_periods=12).mean())
    
    sensors['steps_1h'] = grouped['steps'].transform(lambda x: x.rolling(12, min_periods=1).sum())
    sensors['steps_6h'] = grouped['steps'].transform(lambda x: x.rolling(window_size, min_periods=1).sum())
    
    # Label construction (Leakage-safe)
    # y_hyper_120: Any glucose > 180 in the next 120 mins (24 steps)
    print("Constructing labels...")
    sensors['y_hyper_120'] = grouped['above_180'].transform(
        lambda x: x.shift(-24).rolling(24, min_periods=1).max()
    )
    sensors['y_hypo_60'] = grouped['glucose_mgdl'].transform(
        lambda x: (x.shift(-12).rolling(12, min_periods=1).min() < 70).astype(int)
    )
    
    # Future glucose targets for quantile forecaster (+30, +60, +90, +120 min)
    # 5 min intervals = 6, 12, 18, 24 steps
    sensors['g_plus_30'] = grouped['glucose_mgdl'].transform(lambda x: x.shift(-6))
    sensors['g_plus_60'] = grouped['glucose_mgdl'].transform(lambda x: x.shift(-12))
    sensors['g_plus_90'] = grouped['glucose_mgdl'].transform(lambda x: x.shift(-18))
    sensors['g_plus_120'] = grouped['glucose_mgdl'].transform(lambda x: x.shift(-24))
    
    # Merge with static EHR vector
    print("Merging with static EHR data...")
    # Handle missing age 
    if 'age' not in patients.columns:
        patients['age'] = 50 # Default if not found from Synthea
        
    patients_subset = patients[['Id', 'age', 'has_t2d', 'bmi', 'hba1c', 'fasting_glucose', 'polygenic_risk_score', 'family_history_t2d']]
        
    merged = sensors.merge(patients_subset, left_on='patient_id', right_on='Id', how='left')
    
    # Drop rows with NA in targets (at the end of series)
    merged = merged.dropna(subset=['y_hyper_120', 'y_hypo_60'])
    
    # To reduce size, we take every 3rd step (15 min intervals)
    merged = merged.iloc[::3].reset_index(drop=True)
    
    # Patient-level split
    print("Performing patient-level split...")
    unique_patients = merged['patient_id'].unique()
    np.random.seed(42)
    np.random.shuffle(unique_patients)
    
    n_train = int(len(unique_patients) * 0.7)
    n_val = int(len(unique_patients) * 0.15)
    
    train_patients = unique_patients[:n_train]
    val_patients = unique_patients[n_train:n_train+n_val]
    test_patients = unique_patients[n_train+n_val:]
    
    train_df = merged[merged['patient_id'].isin(train_patients)]
    val_df = merged[merged['patient_id'].isin(val_patients)]
    test_df = merged[merged['patient_id'].isin(test_patients)]
    
    print(f"Train shapes: {train_df.shape}")
    print(f"Val shapes: {val_df.shape}")
    print(f"Test shapes: {test_df.shape}")
    
    train_df.to_parquet(os.path.join(FEATURES_DIR, 'train.parquet'), index=False)
    val_df.to_parquet(os.path.join(FEATURES_DIR, 'val.parquet'), index=False)
    test_df.to_parquet(os.path.join(FEATURES_DIR, 'test.parquet'), index=False)
    print("Feature windows saved.")

if __name__ == "__main__":
    build_features()
