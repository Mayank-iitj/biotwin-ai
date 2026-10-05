import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')

def calculate_metrics(group):
    glucose = group['glucose_mgdl'].dropna()
    if len(glucose) == 0:
        return pd.Series({'tir': np.nan, 'mean': np.nan, 'cv': np.nan, 'gmi': np.nan})
        
    tir = ((glucose >= 70) & (glucose <= 180)).mean() * 100
    mean = glucose.mean()
    cv = (glucose.std() / mean) * 100 if mean > 0 else 0
    # GMI formula: 3.31 + 0.02392 * mean_glucose_in_mg/dl
    gmi = 3.31 + 0.02392 * mean
    return pd.Series({'tir': tir, 'mean': mean, 'cv': cv, 'gmi': gmi})

def main():
    print("Running sanity report...")
    sensor_file = os.path.join(PROCESSED_DIR, 'sensor_series.parquet')
    if not os.path.exists(sensor_file):
        print(f"Error: {sensor_file} not found. Run make data first.")
        exit(1)
        
    df = pd.read_parquet(sensor_file)
    patients = pd.read_parquet(os.path.join(PROCESSED_DIR, 'patients.parquet'))
    
    # Merge has_t2d flag
    df = df.merge(patients[['Id', 'has_t2d']], left_on='patient_id', right_on='Id', how='left')
    
    metrics = df.groupby('patient_id').apply(calculate_metrics).reset_index()
    metrics = metrics.merge(patients[['Id', 'has_t2d']], left_on='patient_id', right_on='Id')
    
    t2d = metrics[metrics['has_t2d']]
    non_t2d = metrics[~metrics['has_t2d']]
    
    print("\n--- Summary Metrics ---")
    print(f"Total patients analyzed: {len(metrics)}")
    print(f"T2D patients: {len(t2d)}")
    print(f"Non-T2D patients: {len(non_t2d)}")
    
    print("\nT2D Averages:")
    print(t2d[['tir', 'mean', 'cv', 'gmi']].mean())
    
    print("\nNon-T2D Averages:")
    print(non_t2d[['tir', 'mean', 'cv', 'gmi']].mean())
    
    # Sanity checks
    # T2D should have lower TIR and higher mean than Non-T2D
    t2d_mean = t2d['mean'].mean()
    non_t2d_mean = non_t2d['mean'].mean()
    
    if t2d_mean <= non_t2d_mean:
        print("ERROR: Implausible distribution. T2D mean glucose is not higher than Non-T2D.")
        exit(1)
        
    if t2d['tir'].mean() >= non_t2d['tir'].mean():
        print("ERROR: Implausible distribution. T2D TIR is not lower than Non-T2D.")
        exit(1)
        
    print("\nAll sanity checks passed!")

if __name__ == "__main__":
    main()
