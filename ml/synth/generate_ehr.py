import os
import subprocess
import requests
import zipfile
import pandas as pd
import numpy as np
import shutil

# Configuration
SYNTHEA_VERSION = "v3.0.0"
SYNTHEA_JAR = "synthea-with-dependencies.jar"
SYNTHEA_URL = f"https://github.com/synthetichealth/synthea/releases/download/{SYNTHEA_VERSION}/synthea-with-dependencies.jar"
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')

def download_synthea():
    jar_path = os.path.join(os.path.dirname(__file__), SYNTHEA_JAR)
    if not os.path.exists(jar_path):
        print(f"Downloading Synthea {SYNTHEA_VERSION}...")
        r = requests.get(SYNTHEA_URL, stream=True)
        with open(jar_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Download complete.")
    return jar_path

def run_synthea(jar_path, num_patients=1000):
    print(f"Running Synthea to generate {num_patients} patients...")
    cmd = [
        "java", "-jar", jar_path,
        "-p", str(num_patients),
        "-s", "12345",
        "--exporter.csv.export=true",
        "--exporter.fhir.export=false",
        "--exporter.baseDirectory=" + RAW_DIR,
        "--generate.only_alive_patients=true",
        "-m", "type_2_diabetes"
    ]
    subprocess.run(cmd, check=True)
    print("Synthea generation complete.")

def process_data():
    print("Post-processing data for Indian demographics and T2D challenge...")
    csv_dir = os.path.join(RAW_DIR, "csv")
    
    patients_df = pd.read_csv(os.path.join(csv_dir, "patients.csv"))
    observations_df = pd.read_csv(os.path.join(csv_dir, "observations.csv"))
    conditions_df = pd.read_csv(os.path.join(csv_dir, "conditions.csv"))
    medications_df = pd.read_csv(os.path.join(csv_dir, "medications.csv"))
    
    np.random.seed(42)
    
    # 1. Adapt Patients to Indian context
    # Adjust names / ethincity as proxy, but here we just add explicit traits
    patients_df['indian_diet'] = np.random.choice(
        ['vegetarian', 'non-vegetarian', 'eggetarian'], 
        size=len(patients_df), 
        p=[0.4, 0.5, 0.1]
    )
    patients_df['region'] = np.random.choice(
        ['north', 'south', 'east', 'west'],
        size=len(patients_df),
        p=[0.3, 0.3, 0.2, 0.2]
    )
    
    # Generate Polygenic Risk Score (PRS) in [0, 1]
    # Enforce requested mix: T2D ~60%, pre-diabetic ~25%, at-risk ~15%
    status_choices = ['t2d', 'pre_diabetic', 'at_risk']
    patients_df['diabetes_status'] = np.random.choice(
        status_choices, 
        size=len(patients_df), 
        p=[0.60, 0.25, 0.15]
    )
    patients_df['has_t2d'] = patients_df['diabetes_status'] == 't2d'
    
    patients_df['polygenic_risk_score'] = np.where(
        patients_df['has_t2d'],
        np.clip(np.random.normal(0.7, 0.15, size=len(patients_df)), 0, 1),
        np.clip(np.random.normal(0.3, 0.2, size=len(patients_df)), 0, 1)
    )
    
    # Family history
    patients_df['family_history_t2d'] = patients_df['polygenic_risk_score'] > 0.6
    
    # 2. Extract baseline labs from observations
    # We want HbA1c, fasting glucose, BMI
    def extract_latest_obs(obs_df, code, col_name):
        df = obs_df[obs_df['CODE'] == code].copy()
        df['DATE'] = pd.to_datetime(df['DATE'])
        df = df.sort_values('DATE').groupby('PATIENT').last().reset_index()
        return df[['PATIENT', 'VALUE']].rename(columns={'VALUE': col_name})

    hba1c = extract_latest_obs(observations_df, '4548-4', 'hba1c')
    glucose = extract_latest_obs(observations_df, '2339-0', 'fasting_glucose')
    bmi = extract_latest_obs(observations_df, '39156-5', 'bmi')
    
    # Convert to numeric
    for df in [hba1c, glucose, bmi]:
        if not df.empty:
            df.iloc[:, 1] = pd.to_numeric(df.iloc[:, 1], errors='coerce')
    
    # Merge into patients
    merged = patients_df.merge(hba1c, left_on='Id', right_on='PATIENT', how='left')
    merged = merged.merge(glucose, on='PATIENT', how='left')
    merged = merged.merge(bmi, on='PATIENT', how='left')
    
    # Impute missing with reasonable Indian demographic defaults
    merged['bmi'] = merged['bmi'].fillna(pd.Series(np.random.normal(24, 3, size=len(merged)), index=merged.index))
    merged['hba1c'] = merged['hba1c'].fillna(pd.Series(
        np.where(merged['has_t2d'], np.random.normal(7.5, 1.0, size=len(merged)),
                 np.where(merged['diabetes_status'] == 'pre_diabetic', np.random.normal(6.0, 0.4, size=len(merged)),
                          np.random.normal(5.2, 0.4, size=len(merged)))),
        index=merged.index
    ))
    merged['fasting_glucose'] = merged['fasting_glucose'].fillna(pd.Series(
        np.where(merged['has_t2d'], np.random.normal(140, 20, size=len(merged)),
                 np.where(merged['diabetes_status'] == 'pre_diabetic', np.random.normal(110, 10, size=len(merged)),
                          np.random.normal(90, 10, size=len(merged)))),
        index=merged.index
    ))
    
    # Save processed patients
    merged.to_parquet(os.path.join(PROCESSED_DIR, 'patients.parquet'), index=False)
    conditions_df.to_parquet(os.path.join(PROCESSED_DIR, 'conditions.parquet'), index=False)
    medications_df.to_parquet(os.path.join(PROCESSED_DIR, 'medications.parquet'), index=False)
    print(f"Processed {len(merged)} patients successfully.")

if __name__ == "__main__":
    jar_path = download_synthea()
    run_synthea(jar_path, num_patients=1000)
    process_data()
