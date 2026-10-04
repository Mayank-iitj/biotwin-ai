import os
import csv
import json
from datetime import datetime

# Define paths
D1_PATH = r"C:\Users\MS\Downloads\biotwin-d1"
BATCHES = [
    os.path.join(D1_PATH, "mturkfitbit_export_3.12.16-4.11.16", "Fitabase Data 3.12.16-4.11.16"),
    os.path.join(D1_PATH, "mturkfitbit_export_4.12.16-5.12.16", "Fitabase Data 4.12.16-5.12.16")
]

def parse_date(date_str):
    # Try multiple formats
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m/%d/%Y %I:%M:%S %p", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None

def process_data():
    daily_stats = {}  # key: date_str (YYYY-MM-DD), value: dict
    
    # We want to pick a primary user ID from the dataset since there are multiple users
    # Let's find the user ID with the most data.
    user_data_count = {}
    
    for batch in BATCHES:
        activity_file = os.path.join(batch, "dailyActivity_merged.csv")
        if not os.path.exists(activity_file):
            print(f"Skipping {batch}, activity file not found")
            continue
        with open(activity_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                uid = row["Id"]
                user_data_count[uid] = user_data_count.get(uid, 0) + 1
                
    # Sort user IDs by count
    sorted_users = sorted(user_data_count.items(), key=lambda x: x[1], reverse=True)
    if not sorted_users:
        print("No users found in activity file")
        return
    
    target_user = sorted_users[0][0]
    print(f"Targeting Fitbit User ID: {target_user} with {sorted_users[0][1]} records")

    # 1. Parse Daily Activity
    for batch in BATCHES:
        activity_file = os.path.join(batch, "dailyActivity_merged.csv")
        if not os.path.exists(activity_file):
            continue
        with open(activity_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["Id"] != target_user:
                    continue
                dt = parse_date(row["ActivityDate"])
                if not dt:
                    continue
                date_str = dt.strftime("%Y-%m-%d")
                
                daily_stats[date_str] = {
                    "date": date_str,
                    "steps": int(row["TotalSteps"]),
                    "distance": float(row["TotalDistance"]),
                    "calories": int(row["Calories"]),
                    "active_minutes": int(row["VeryActiveMinutes"]) + int(row["FairlyActiveMinutes"]) + int(row["LightlyActiveMinutes"]),
                    "sedentary_minutes": int(row["SedentaryMinutes"]),
                    "sleep_hours": 0.0,
                    "weight_kg": 0.0,
                    "heart_rate_avg": 70.0  # Default fallback
                }

    # 2. Parse Sleep Logs
    for batch in BATCHES:
        sleep_file = os.path.join(batch, "minuteSleep_merged.csv")
        if not os.path.exists(sleep_file):
            continue
        
        # Calculate daily sleep minutes for target user
        sleep_minutes_by_date = {}
        with open(sleep_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["Id"] != target_user:
                    continue
                dt = parse_date(row["date"])
                if not dt:
                    continue
                date_str = dt.strftime("%Y-%m-%d")
                # value is sleep state (1 = asleep, 2 = restless, 3 = awake)
                if row["value"] in ("1", "2"):
                    sleep_minutes_by_date[date_str] = sleep_minutes_by_date.get(date_str, 0) + 1
                    
        for date_str, mins in sleep_minutes_by_date.items():
            if date_str in daily_stats:
                daily_stats[date_str]["sleep_hours"] = round(mins / 60.0, 1)

    # 3. Parse Weights
    for batch in BATCHES:
        weight_file = os.path.join(batch, "weightLogInfo_merged.csv")
        if not os.path.exists(weight_file):
            continue
        with open(weight_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["Id"] != target_user:
                    continue
                dt = parse_date(row["Date"])
                if not dt:
                    continue
                date_str = dt.strftime("%Y-%m-%d")
                weight = float(row["WeightKg"])
                if date_str in daily_stats:
                    daily_stats[date_str]["weight_kg"] = round(weight, 1)
                else:
                    # If date not in activity, initialize it
                    daily_stats[date_str] = {
                        "date": date_str,
                        "steps": 0,
                        "distance": 0.0,
                        "calories": 0,
                        "active_minutes": 0,
                        "sedentary_minutes": 0,
                        "sleep_hours": 0.0,
                        "weight_kg": round(weight, 1),
                        "heart_rate_avg": 70.0
                    }

    # 4. Parse Heart Rates (Aggregated)
    for batch in BATCHES:
        hr_file = os.path.join(batch, "heartrate_seconds_merged.csv")
        if not os.path.exists(hr_file):
            continue
        
        hr_by_date = {}  # date_str -> list of heart rates
        with open(hr_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["Id"] != target_user:
                    continue
                dt = parse_date(row["Time"])
                if not dt:
                    continue
                date_str = dt.strftime("%Y-%m-%d")
                val = int(row["Value"])
                if date_str not in hr_by_date:
                    hr_by_date[date_str] = []
                hr_by_date[date_str].append(val)
                
        for date_str, vals in hr_by_date.items():
            if vals and date_str in daily_stats:
                daily_stats[date_str]["heart_rate_avg"] = round(sum(vals) / len(vals), 1)

    # Convert to sorted list
    sorted_stats = sorted(daily_stats.values(), key=lambda x: x["date"])
    
    # Fill in missing weights with the last known weight or default
    last_weight = 75.0
    for stat in sorted_stats:
        if stat["weight_kg"] > 0:
            last_weight = stat["weight_kg"]
        else:
            stat["weight_kg"] = last_weight
            
    # Save to file
    output_frontend_path = r"c:\Users\MS\biotwin-ai\apps\web\lib\fitbit-data-merged.json"
    os.makedirs(os.path.dirname(output_frontend_path), exist_ok=True)
    with open(output_frontend_path, "w") as f:
        json.dump(sorted_stats, f, indent=2)
        
    print(f"Successfully processed {len(sorted_stats)} daily records and saved to {output_frontend_path}")

if __name__ == "__main__":
    process_data()
