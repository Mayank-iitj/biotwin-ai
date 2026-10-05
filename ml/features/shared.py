import pandas as pd
import numpy as np

def extract_features(sensor_window: pd.DataFrame, static_features: dict) -> dict:
    """
    Extracts features for the last timestamp in the given sensor_window.
    sensor_window should contain up to 6 hours (72 rows at 5-min intervals) of data.
    """
    if sensor_window.empty:
        return {}
        
    last_row = sensor_window.iloc[-1]
    
    # 6-hour stats
    glucose_mean = sensor_window['glucose_mgdl'].mean()
    glucose_std = sensor_window['glucose_mgdl'].std() if len(sensor_window) > 1 else 0
    glucose_min = sensor_window['glucose_mgdl'].min()
    glucose_max = sensor_window['glucose_mgdl'].max()
    
    in_range = (sensor_window['glucose_mgdl'] >= 70) & (sensor_window['glucose_mgdl'] <= 180)
    tir = in_range.mean()
    
    above_180 = (sensor_window['glucose_mgdl'] > 180)
    tar = above_180.mean()
    
    # Deltas
    glucose_15m_delta = np.nan
    if len(sensor_window) >= 4:
        glucose_15m_delta = last_row['glucose_mgdl'] - sensor_window['glucose_mgdl'].iloc[-4]
        
    glucose_30m_delta = np.nan
    if len(sensor_window) >= 7:
        glucose_30m_delta = last_row['glucose_mgdl'] - sensor_window['glucose_mgdl'].iloc[-7]
        
    glucose_60m_delta = np.nan
    if len(sensor_window) >= 13:
        glucose_60m_delta = last_row['glucose_mgdl'] - sensor_window['glucose_mgdl'].iloc[-13]
        
    hr_mean = sensor_window['heart_rate'].mean()
    hrv_mean = sensor_window['hrv_rmssd'].mean()
    
    # Steps
    steps_1h = sensor_window['steps'].tail(12).sum()
    steps_6h = sensor_window['steps'].sum()
    
    # Meal features
    # Minutes since last meal > 0
    meal_events = sensor_window[sensor_window['meal_carbs'] > 0]
    mins_since_meal = 360 # default to 6 hours if no meal
    last_meal_carbs = 0
    if not meal_events.empty:
        last_meal_idx = meal_events.index[-1]
        last_meal_time = meal_events['timestamp'].iloc[-1]
        mins_since_meal = (last_row['timestamp'] - last_meal_time).total_seconds() / 60.0
        last_meal_carbs = meal_events['meal_carbs'].iloc[-1]
        
    features = {
        'patient_id': last_row['patient_id'],
        'timestamp': last_row['timestamp'],
        'glucose_mgdl': last_row['glucose_mgdl'],
        'glucose_mean_6h': glucose_mean,
        'glucose_std_6h': glucose_std,
        'glucose_min_6h': glucose_min,
        'glucose_max_6h': glucose_max,
        'tir_6h': tir,
        'tar_6h': tar,
        'glucose_15m_delta': glucose_15m_delta,
        'glucose_30m_delta': glucose_30m_delta,
        'glucose_60m_delta': glucose_60m_delta,
        'hr_mean_6h': hr_mean,
        'hrv_mean_6h': hrv_mean,
        'steps_1h': steps_1h,
        'steps_6h': steps_6h,
        'mins_since_meal': mins_since_meal,
        'last_meal_carbs': last_meal_carbs
    }
    
    # Merge static features
    for k, v in static_features.items():
        features[k] = v
        
    return features
