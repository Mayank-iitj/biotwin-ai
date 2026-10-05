import asyncio
import httpx
import time
import random
from datetime import datetime

API_URL = "http://localhost:8000/api/v1/ingest/readings"

async def send_payload(client, patient_id):
    payload = [{
        "patient_id": patient_id,
        "ts": datetime.utcnow().isoformat(),
        "sim_ts": datetime.utcnow().isoformat(),
        "glucose": random.uniform(80, 250),
        "hr": random.uniform(60, 100),
        "hrv": random.uniform(20, 80),
        "steps": random.randint(0, 100),
        "sleep_stage": "awake",
        "meal_carbs": 0.0
    }]
    try:
        response = await client.post(API_URL, json={"readings": payload})
        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
        return response.status_code
    except Exception as e:
        print(f"Exception: {e}")
        return 500

async def load_test():
    print("Starting load test with 500 concurrent patients...")
    start_time = time.time()
    
    async with httpx.AsyncClient() as client:
        tasks = []
        for i in range(500):
            tasks.append(send_payload(client, f"patient_{i}"))
            
        results = await asyncio.gather(*tasks)
        
    end_time = time.time()
    success = sum(1 for r in results if r == 200)
    
    print(f"Sent 500 requests in {end_time - start_time:.2f} seconds.")
    print(f"Success rate: {success}/500 ({(success/500)*100:.1f}%)")

if __name__ == "__main__":
    asyncio.run(load_test())
