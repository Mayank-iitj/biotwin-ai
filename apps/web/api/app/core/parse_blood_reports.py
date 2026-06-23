import csv
import json
import os
from datetime import datetime, timedelta

BLOOD_CSV_PATH = r"C:\Users\MS\Downloads\archive (6)\blood.csv"

def parse_blood_data():
    reports = []
    
    if not os.path.exists(BLOOD_CSV_PATH):
        print(f"File not found: {BLOOD_CSV_PATH}")
        return

    # Base date to calculate dates backward
    base_date = datetime(2016, 5, 12)

    with open(BLOOD_CSV_PATH, "r") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
        # Take a subset to keep the list clean (e.g., top 15 records)
        subset_rows = rows[:15]
        
        for idx, row in enumerate(subset_rows):
            recency = int(row["Recency"])
            frequency = int(row["Frequency"])
            monetary = int(row["Monetary"])
            time_months = int(row["Time"])
            cls = int(row["Class"])
            
            # Compute a realistic report date based on Recency
            report_date = (base_date - timedelta(days=recency * 30)).strftime("%Y-%m-%d")
            
            # Derive realistic clinical blood markers from the donation data
            # Class 1 = Active/high-freq donor, Class 0 = regular
            hemoglobin = round(14.2 + (0.1 * frequency) - (0.05 * recency), 1)
            hematocrit = round(42.5 + (0.3 * frequency) - (0.15 * recency), 1)
            platelets = int(220 + (2 * frequency) - recency)
            
            markers = [
                {
                    "id": f"marker-{idx}-1",
                    "marker": "Hemoglobin",
                    "value": hemoglobin,
                    "unit": "g/dL",
                    "reference_range": "13.8 - 17.2",
                    "is_abnormal": not (13.8 <= hemoglobin <= 17.2)
                },
                {
                    "id": f"marker-{idx}-2",
                    "marker": "Hematocrit",
                    "value": hematocrit,
                    "unit": "%",
                    "reference_range": "40.7 - 50.3",
                    "is_abnormal": not (40.7 <= hematocrit <= 50.3)
                },
                {
                    "id": f"marker-{idx}-3",
                    "marker": "Platelet Count",
                    "value": platelets,
                    "unit": "k/uL",
                    "reference_range": "150 - 450",
                    "is_abnormal": not (150 <= platelets <= 450)
                },
                {
                    "id": f"marker-{idx}-4",
                    "marker": "Donation Frequency",
                    "value": frequency,
                    "unit": "times",
                    "reference_range": "Target: >5",
                    "is_abnormal": frequency < 5
                },
                {
                    "id": f"marker-{idx}-5",
                    "marker": "Total Volume Donated",
                    "value": monetary,
                    "unit": "mL",
                    "reference_range": "Target: >1000",
                    "is_abnormal": monetary < 1000
                }
            ]
            
            reports.append({
                "id": f"report-blood-{idx}",
                "report_date": report_date,
                "status": "parsed",
                "file_url": "https://example.com/blood_donation_report.pdf",
                "extracted_text": f"Blood donation history: recency={recency} months, frequency={frequency} times, total volume={monetary} mL",
                "markers": markers
            })

    output_path = r"c:\Users\MS\biotwin-ai\apps\web\lib\blood-reports-parsed.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(reports, f, indent=2)
        
    print(f"Parsed blood reports saved successfully to {output_path}!")

if __name__ == "__main__":
    parse_blood_data()
