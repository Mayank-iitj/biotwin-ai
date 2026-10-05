import os
import time
import asyncio
import pandas as pd
import httpx
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
API_URL = "http://localhost:8000/api/v1/ingest/readings"

async def stream_patient(patient_id, df, speed=1, batch_size=1):
    print(f"Starting stream for patient {patient_id} at {speed}x speed.")
    df = df.sort_values('timestamp')
    
    async with httpx.AsyncClient() as client:
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            payload = []
            for _, row in batch.iterrows():
                payload.append({
                    "patient_id": row['patient_id'],
                    "ts": datetime.utcnow().isoformat(), # Simulate real-time by using current UTC
                    "sim_ts": row['timestamp'].isoformat(),
                    "glucose": row['glucose_mgdl'],
                    "hr": row['heart_rate'],
                    "hrv": row['hrv_rmssd'],
                    "steps": row['steps'],
                    "sleep_stage": row['sleep_stage'],
                    "meal_carbs": row['meal_carbs']
                })
            
            try:
                # We expect the API to be running
                response = await client.post(API_URL, json={"readings": payload})
                if response.status_code != 200:
                    print(f"Failed to ingest: {response.text}")
            except Exception as e:
                # Silently ignore if API is not up yet, this is just a simulator
                pass
                
            # Sleep to simulate time passing (5 minutes between readings)
            # 5 minutes = 300 seconds. At 1x speed, sleep 300. At 60x, sleep 5.
            sleep_time = (300 * batch_size) / speed
            await asyncio.sleep(sleep_time)

async def main():
    sensor_file = os.path.join(PROCESSED_DIR, 'sensor_series.parquet')
    if not os.path.exists(sensor_file):
        print(f"Error: {sensor_file} not found.")
        return
        
    df = pd.read_parquet(sensor_file)
    
    # Pick a few patients to stream for demonstration
    patient_ids = df['patient_id'].unique()[:5]
    
    tasks = []
    for pid in patient_ids:
        pdf = df[df['patient_id'] == pid]
        tasks.append(stream_patient(pid, pdf, speed=600)) # 600x speed for testing
        
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
