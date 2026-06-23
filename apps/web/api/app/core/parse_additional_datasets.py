import csv
import json
import os

DIABETES_PATH = r"C:\Users\MS\Downloads\archive (4)\diabetes.csv"
CARDIO_PATH = r"C:\Users\MS\Downloads\d2\cardio_train.csv"
SLEEP_PATH = r"C:\Users\MS\Downloads\archive (5)\Sleep_health_and_lifestyle_dataset.csv"

def process_datasets():
    insights = {}

    # 1. Parse Diabetes Dataset (768 rows)
    diabetes_data = []
    if os.path.exists(DIABETES_PATH):
        with open(DIABETES_PATH, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                diabetes_data.append({
                    "glucose": float(row["Glucose"]),
                    "bp": float(row["BloodPressure"]),
                    "bmi": float(row["BMI"]),
                    "age": int(row["Age"]),
                    "outcome": int(row["Outcome"])
                })
        
        # Calculate averages by outcome (0 = healthy, 1 = diabetic)
        diabetic_avg = {"glucose": 0, "bp": 0, "bmi": 0, "count": 0}
        healthy_avg = {"glucose": 0, "bp": 0, "bmi": 0, "count": 0}
        
        for d in diabetes_data:
            # Skip zero values (common in Pima dataset for missing data)
            if d["glucose"] == 0 or d["bp"] == 0 or d["bmi"] == 0:
                continue
            
            target = diabetic_avg if d["outcome"] == 1 else healthy_avg
            target["glucose"] += d["glucose"]
            target["bp"] += d["bp"]
            target["bmi"] += d["bmi"]
            target["count"] += 1
            
        for target in (diabetic_avg, healthy_avg):
            if target["count"] > 0:
                for k in ("glucose", "bp", "bmi"):
                    target[k] = round(target[k] / target["count"], 1)

        insights["diabetes_cohorts"] = {
            "healthy": healthy_avg,
            "diabetic": diabetic_avg
        }

    # 2. Parse Cardiovascular Dataset (70,000 rows)
    cardio_data = []
    if os.path.exists(CARDIO_PATH):
        with open(CARDIO_PATH, "r") as f:
            # Note: semicolon delimiter
            reader = csv.DictReader(f, delimiter=';')
            for row in reader:
                try:
                    cardio_data.append({
                        "age_years": float(row["age"]) / 365.25,
                        "weight": float(row["weight"]),
                        "systolic": float(row["ap_hi"]),
                        "diastolic": float(row["ap_lo"]),
                        "cardio": int(row["cardio"]),
                        "cholesterol": int(row["cholesterol"])
                    })
                except Exception:
                    continue
        
        # Aggregate by cardiovascular outcome
        cardio_pos = {"systolic": 0, "diastolic": 0, "weight": 0, "count": 0}
        cardio_neg = {"systolic": 0, "diastolic": 0, "weight": 0, "count": 0}
        
        for c in cardio_data:
            # Clean extremes/outliers in BP
            if not (50 < c["systolic"] < 250) or not (30 < c["diastolic"] < 150):
                continue
            target = cardio_pos if c["cardio"] == 1 else cardio_neg
            target["systolic"] += c["systolic"]
            target["diastolic"] += c["diastolic"]
            target["weight"] += c["weight"]
            target["count"] += 1
            
        for target in (cardio_pos, cardio_neg):
            if target["count"] > 0:
                for k in ("systolic", "diastolic", "weight"):
                    target[k] = round(target[k] / target["count"], 1)
                    
        insights["cardio_cohorts"] = {
            "negative": cardio_neg,
            "positive": cardio_pos
        }

    # 3. Parse Sleep Health and Lifestyle (374 rows)
    sleep_data = []
    if os.path.exists(SLEEP_PATH):
        with open(SLEEP_PATH, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                sleep_data.append({
                    "sleep_duration": float(row["Sleep Duration"]),
                    "sleep_quality": int(row["Quality of Sleep"]),
                    "physical_activity": int(row["Physical Activity Level"]),
                    "stress_level": int(row["Stress Level"]),
                    "daily_steps": int(row["Daily Steps"]),
                    "disorder": row["Sleep Disorder"]
                })
                
        # Group by Sleep Disorder category
        disorders = {}  # "None", "Insomnia", "Sleep Apnea"
        for s in sleep_data:
            dis = s["disorder"] if s["disorder"] else "None"
            if dis not in disorders:
                disorders[dis] = {"sleep_duration": 0, "sleep_quality": 0, "stress_level": 0, "steps": 0, "count": 0}
            target = disorders[dis]
            target["sleep_duration"] += s["sleep_duration"]
            target["sleep_quality"] += s["sleep_quality"]
            target["stress_level"] += s["stress_level"]
            target["steps"] += s["daily_steps"]
            target["count"] += 1
            
        for k, v in disorders.items():
            if v["count"] > 0:
                v["sleep_duration"] = round(v["sleep_duration"] / v["count"], 2)
                v["sleep_quality"] = round(v["sleep_quality"] / v["count"], 1)
                v["stress_level"] = round(v["stress_level"] / v["count"], 1)
                v["steps"] = int(v["steps"] / v["count"])
                
        insights["sleep_disorder_profiles"] = disorders

    # Save outputs
    output_path = r"c:\Users\MS\biotwin-ai\apps\web\lib\dataset-insights.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(insights, f, indent=2)
        
    print(f"Dataset insights saved successfully to {output_path}!")

if __name__ == "__main__":
    process_datasets()
