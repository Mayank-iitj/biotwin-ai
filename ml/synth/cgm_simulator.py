import os
import numpy as np
import pandas as pd
from tqdm import tqdm

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')

def get_indian_meal_carbs():
    # Roti/Rice/Dal/Poha/Idli etc.
    meals = {
        'breakfast': np.random.normal(50, 15), # Idli, Poha
        'lunch': np.random.normal(80, 20),     # Rice, Roti, Dal, Sabzi
        'snack': np.random.normal(30, 10),     # Chai, biscuits, samosa
        'dinner': np.random.normal(70, 20)     # Roti, Sabzi
    }
    return {k: max(0, v) for k, v in meals.items()}

def simulate_patient(patient, days=30, seed=42):
    np.random.seed(seed)
    
    # 5-min resolution = 288 steps/day
    steps_per_day = 288
    total_steps = steps_per_day * days
    
    # Patient attributes
    has_t2d = patient.get('has_t2d', False)
    fasting_glucose = patient.get('fasting_glucose', 90 if not has_t2d else 140)
    bmi = patient.get('bmi', 24)
    hba1c = patient.get('hba1c', 5.2 if not has_t2d else 7.5)
    
    # Bergman model approx parameters
    # Insulin sensitivity decreases with higher BMI, HbA1c
    insulin_sensitivity = max(0.0001, 0.001 - (bmi - 20) * 0.00002 - (hba1c - 5.0) * 0.0001)
    
    # Base states
    G = fasting_glucose
    I = 10 # Basal insulin
    X = 0  # Remote insulin action
    
    # Parameters for difference equation
    p1 = 0.02    # Glucose effectiveness
    p2 = 0.02    # Insulin action clearance
    p3 = insulin_sensitivity * 1e4 # scaled
    n = 0.1      # Insulin clearance
    
    data = []
    
    # Time generation
    current_time = pd.Timestamp("2026-01-01 00:00:00")
    
    meal_times = {'breakfast': 8*12, 'lunch': 13*12, 'snack': 17*12, 'dinner': 20*12} # roughly in 5-min indices
    
    for day in range(days):
        # Sleep quality affects next day sensitivity
        sleep_duration = np.random.normal(7, 1)
        poor_sleep = sleep_duration < 6
        daily_si_adj = 0.8 if poor_sleep else 1.0
        
        # Meals for the day
        meals = get_indian_meal_carbs()
        meal_absorption = np.zeros(steps_per_day)
        
        for meal_name, carb_amt in meals.items():
            t_idx = meal_times[meal_name] + np.random.randint(-6, 6) # +/- 30 mins
            # Absorption curve (Gamma-like)
            for j in range(24): # 2 hours absorption
                if t_idx + j < steps_per_day:
                    meal_absorption[t_idx + j] += carb_amt * (j/24.0) * np.exp(-j/4.0)
                    
        for step in range(steps_per_day):
            time_of_day_idx = step
            
            # 1. Physical activity (reduces glucose, increases HR)
            is_active = (time_of_day_idx > 8*12) and (time_of_day_idx < 22*12) and (np.random.random() < 0.1)
            active_walk = is_active or (np.random.random() < 0.2 and meal_absorption[step] > 0)
            
            # Exercise increases glucose utilization
            exercise_effect = 2.0 if active_walk else 0.0
            
            # 2. ODE update (Euler method step)
            # D_G = - (p1 + X) * G + p1 * Gb + Ra
            Gb = fasting_glucose
            Ra = meal_absorption[step] * 2.0 # Rate of appearance
            
            dG = - (p1 + X + exercise_effect*0.01) * (G - Gb) + Ra
            dX = - p2 * X + p3 * daily_si_adj * (I - 10)
            dI = - n * (I - 10) + 0.05 * max(0, (G - 100)) # Pancreas beta-cell secretion
            
            G += dG
            X += dX
            I += dI
            
            # Apply bounds
            G = np.clip(G, 40, 400)
            I = max(0, I)
            
            # 3. Simulate Wearable Data
            hr_base = 60 if time_of_day_idx < 7*12 else 75
            hr = hr_base + (20 if active_walk else 0) + np.random.normal(0, 3)
            hrv = 120 - hr + np.random.normal(0, 5) # simplified inverse relation
            steps = np.random.randint(50, 200) if active_walk else np.random.randint(0, 10)
            
            if time_of_day_idx < 7*12:
                sleep_stage = np.random.choice(['light', 'deep', 'REM'], p=[0.5, 0.3, 0.2])
            else:
                sleep_stage = 'awake'
                
            # 4. Sensor Noise & Dropouts
            sensor_noise = np.random.normal(0, 2)
            cgm_val = G + sensor_noise
            
            # Occasional dropout 2%
            if np.random.random() < 0.02:
                cgm_val = np.nan
                
            data.append({
                'patient_id': patient['Id'],
                'timestamp': current_time,
                'glucose_mgdl': cgm_val,
                'heart_rate': max(40, hr),
                'hrv_rmssd': max(10, hrv),
                'steps': steps,
                'sleep_stage': sleep_stage,
                'meal_carbs': meal_absorption[step] if meal_absorption[step] > 0 else 0
            })
            
            current_time += pd.Timedelta(minutes=5)
            
    return pd.DataFrame(data)

def main():
    print("Loading processed patient data...")
    patients_file = os.path.join(PROCESSED_DIR, 'patients.parquet')
    if not os.path.exists(patients_file):
        print("Run generate_ehr.py first!")
        return
        
    patients_df = pd.read_parquet(patients_file)
    
    # Generate for a subset if memory is a constraint, or all 1000
    # To keep the demo fast, we'll do 100 patients
    # We must have both T2D and non-T2D
    sample_patients = pd.concat([
        patients_df[patients_df['has_t2d']].head(50),
        patients_df[~patients_df['has_t2d']].head(50)
    ])
    
    all_series = []
    print("Simulating CGM & Wearable data...")
    for idx, row in tqdm(sample_patients.iterrows(), total=len(sample_patients)):
        # Deterministic seed per patient
        seed = int(str(hash(row['Id']))[-8:]) 
        series_df = simulate_patient(row, days=30, seed=seed)
        all_series.append(series_df)
        
    final_df = pd.concat(all_series, ignore_index=True)
    
    out_path = os.path.join(PROCESSED_DIR, 'sensor_series.parquet')
    final_df.to_parquet(out_path, index=False)
    print(f"Saved simulated data to {out_path} ({len(final_df)} rows).")

if __name__ == "__main__":
    main()
