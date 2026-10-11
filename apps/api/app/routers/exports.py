from fastapi import APIRouter
from fastapi.responses import JSONResponse, Response
from datetime import datetime
import io

router = APIRouter(tags=["exports"])

def build_pdf_report(patient_id: str, name: str = "Demo Patient", age: int = 55, hba1c: float = 8.2, last_glucose: float = 188.0) -> bytes:
    """
    Constructs a clean, standard PDF-1.4 document for clinical consultation.
    Zero external dependencies, renders natively in all PDF viewers.
    """
    now_str = datetime.utcnow().strftime("%d %b %Y, %H:%M UTC")
    
    # Text stream commands for standard A4 page (595 x 842 pt)
    stream_content = f"""
0.1 0.2 0.45 rg
0 770 595 72 re f
1 1 1 rg
BT
/F1 22 Tf
40 805 Td
(BioTwin AI - Clinical Digital Twin Consult Report) Tj
/F2 10 Tf
0 -18 Td
(Challenge 2026 Edition | Reimagining Healthcare in India) Tj
ET

0 0 0 rg
BT
/F1 13 Tf
40 735 Td
(1. PATIENT DEMOGRAPHICS & CLINICAL BASELINE) Tj
/F2 10 Tf
0 -18 Td
(Patient ID: {patient_id}    |    Name: {name}    |    Age/Sex: {age} / Male) Tj
0 -14 Td
(Primary Condition: Type 2 Diabetes Mellitus (E11.9)    |    Duration: 5 Years) Tj
0 -14 Td
(Baseline HbA1c: {hba1c}%    |    Polygenic Risk Score (PRS): 0.75 (Synthetic)) Tj
0 -14 Td
(Current Medication: Metformin 1000mg daily    |    Comorbidities: Stage 1 Hypertension) Tj

/F1 13 Tf
0 -30 Td
(2. REAL-TIME 24-HOUR CONTINUOUS GLUCOSE MONITORING (CGM)) Tj
/F2 10 Tf
0 -18 Td
(Current Glucose: {last_glucose} mg/dL    |    Status: High Risk Excursion Predicted) Tj
0 -14 Td
(Time in Range (70-180 mg/dL): 64.5%    |    Time Above Range (>180): 33.2%) Tj
0 -14 Td
(Time Below Range (<70 mg/dL): 2.3%      |    Glycemic Management Indicator (GMI): 7.6%) Tj
0 -14 Td
(Estimated Mean Glucose: 168.4 mg/dL     |    Glycemic Variability (CV): 34.2%) Tj

/F1 13 Tf
0 -30 Td
(3. ADVERSE EVENT PREDICTION & EXPLAINABLE AI (XAI)) Tj
/F2 10 Tf
0 -18 Td
(Forecast Target: Hyperglycemic Excursion (>180 mg/dL within 120 minutes)) Tj
0 -14 Td
(Predicted Probability: 0.88 (High Tier)  |  Lead Time: ~45 Minutes Advance Notice) Tj
0 -14 Td
(Top SHAP Contributing Drivers:) Tj
0 -14 Td
(   [+] Glucose rising rapidly (+2.4 mg/dL/min post-dinner)) Tj
0 -14 Td
(   [+] Recent High Carbs Meal (~85g, High Glycemic Index)) Tj
0 -14 Td
(   [+] Impaired Insulin Sensitivity from Reduced Sleep Duration (5.2 hrs)) Tj

/F1 13 Tf
0 -30 Td
(4. WHAT-IF COUNTERFACTUAL PRESCRIPTIVE SIMULATION) Tj
/F2 10 Tf
0 -18 Td
(Prescribed Lifestyle Intervention: 15-Minute Moderate Post-Meal Walk) Tj
0 -14 Td
(Simulated Outcome: Attenuates post-prandial peak by -38 mg/dL (Brings peak to 154 mg/dL)) Tj
0 -14 Td
(Risk Delta: Excursion risk reduced from 88% down to 24% (Low Tier Safe Zone)) Tj

/F1 13 Tf
0 -30 Td
(5. REGULATORY COMPLIANCE & DISCLAIMER) Tj
/F2 8.5 Tf
0 -15 Td
(Notice: 100% synthetic data generated for Happiest Health Digital Twin Challenge 2026.) Tj
0 -11 Td
(Complies with Digital Personal Data Protection (DPDP) Act 2023 & HIPAA sandbox principles.) Tj
0 -11 Td
(Clinical Decision Support only. Not an autonomous diagnostic device. Report generated: {now_str}) Tj
ET
"""
    stream_bytes = stream_content.encode("latin1")
    stream_len = len(stream_bytes)
    
    # Assemble PDF Objects
    pdf = bytearray()
    pdf.extend(b"%PDF-1.4\n")
    
    offsets = []
    
    # 1: Catalog
    offsets.append(len(pdf))
    pdf.extend(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    
    # 2: Pages
    offsets.append(len(pdf))
    pdf.extend(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    
    # 3: Page
    offsets.append(len(pdf))
    pdf.extend(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n")
    
    # 4: Font Bold
    offsets.append(len(pdf))
    pdf.extend(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
    
    # 5: Font Regular
    offsets.append(len(pdf))
    pdf.extend(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    
    # 6: Contents Stream
    offsets.append(len(pdf))
    pdf.extend(f"6 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin1"))
    pdf.extend(stream_bytes)
    pdf.extend(b"\nendstream\nendobj\n")
    
    # Xref Table
    xref_offset = len(pdf)
    pdf.extend(b"xref\n0 7\n0000000000 65535 f \n")
    for off in offsets:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin1"))
        
    pdf.extend(f"trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin1"))
    return bytes(pdf)


@router.get("/patients/{patient_id}/fhir.json")
async def export_fhir(patient_id: str):
    """
    Export patient data as a fully structured HL7 FHIR R4 Bundle.
    Includes Patient, Conditions, Medications, Labs and RiskAssessment.
    """
    now_iso = datetime.utcnow().isoformat()
    bundle = {
        "resourceType": "Bundle",
        "id": f"bundle-biotwin-{patient_id}",
        "type": "collection",
        "timestamp": now_iso,
        "entry": [
            {
                "fullUrl": f"urn:uuid:patient-{patient_id}",
                "resource": {
                    "resourceType": "Patient",
                    "id": patient_id,
                    "meta": {
                        "profile": ["http://hl7.org/fhir/StructureDefinition/Patient"],
                        "tag": [{"system": "https://biotwin.ai", "code": "synthetic-data", "display": "100% Synthetic DPDP Compliant"}]
                    },
                    "identifier": [{"system": "https://biotwin.ai/patients", "value": patient_id}],
                    "active": True,
                    "name": [{"use": "official", "family": "Sharma", "given": ["Demo"]}],
                    "gender": "male",
                    "birthDate": "1971-04-15"
                }
            },
            {
                "fullUrl": f"urn:uuid:condition-t2d-{patient_id}",
                "resource": {
                    "resourceType": "Condition",
                    "id": f"cond-t2d-{patient_id}",
                    "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                    "verificationStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]},
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "chronic"}]}],
                    "code": {
                        "coding": [
                            {"system": "http://hl7.org/fhir/sid/icd-10", "code": "E11.9", "display": "Type 2 diabetes mellitus without complications"},
                            {"system": "http://snomed.info/sct", "code": "44054006", "display": "Type 2 diabetes mellitus"}
                        ],
                        "text": "Type 2 Diabetes Mellitus"
                    },
                    "subject": {"reference": f"Patient/{patient_id}"}
                }
            },
            {
                "fullUrl": f"urn:uuid:med-metformin-{patient_id}",
                "resource": {
                    "resourceType": "MedicationStatement",
                    "id": f"med-metformin-{patient_id}",
                    "status": "active",
                    "medicationCodeableConcept": {
                        "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "860975", "display": "Metformin hydrochloride 1000 MG Oral Tablet"}],
                        "text": "Metformin 1000mg"
                    },
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "dosage": [{"text": "1000mg once daily with evening meal"}]
                }
            },
            {
                "fullUrl": f"urn:uuid:obs-hba1c-{patient_id}",
                "resource": {
                    "resourceType": "Observation",
                    "id": f"obs-hba1c-{patient_id}",
                    "status": "final",
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "laboratory"}]}],
                    "code": {
                        "coding": [{"system": "http://loinc.org", "code": "4548-4", "display": "Hemoglobin A1c/Hemoglobin.total in Blood"}],
                        "text": "HbA1c"
                    },
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "valueQuantity": {"value": 8.2, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"}
                }
            },
            {
                "fullUrl": f"urn:uuid:obs-cgm-{patient_id}",
                "resource": {
                    "resourceType": "Observation",
                    "id": f"obs-cgm-{patient_id}",
                    "status": "final",
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                    "code": {
                        "coding": [{"system": "http://loinc.org", "code": "14745-4", "display": "Glucose [Mass/volume] in Body fluid"}],
                        "text": "Continuous Glucose Monitor Reading"
                    },
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "valueQuantity": {"value": 188.0, "unit": "mg/dL", "system": "http://unitsofmeasure.org", "code": "mg/dL"}
                }
            },
            {
                "fullUrl": f"urn:uuid:risk-{patient_id}",
                "resource": {
                    "resourceType": "RiskAssessment",
                    "id": f"risk-{patient_id}",
                    "status": "final",
                    "method": {
                        "coding": [{"system": "https://biotwin.ai/methods", "code": "xgboost-cgm-ehr-fusion", "display": "BioTwin AI Dual-Stream Fusion Forecaster"}]
                    },
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "occurrenceDateTime": now_iso,
                    "prediction": [
                        {
                            "outcome": {"text": "Predicted Hyperglycemic Excursion (>180 mg/dL within 120 minutes)"},
                            "probabilityDecimal": 0.88,
                            "qualitativeRisk": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/risk-probability", "code": "high", "display": "High Risk Tier"}]},
                            "whenPeriod": {"start": now_iso}
                        }
                    ],
                    "note": [{"text": "Clinician Decision Support: 15-min post-meal walk attenuates risk to 0.24"}]
                }
            }
        ]
    }
    return JSONResponse(content=bundle)


@router.get("/patients/{patient_id}/report.pdf")
async def export_pdf(patient_id: str):
    """
    Export patient data as a fully formed, valid PDF Clinical Consult Report.
    """
    pdf_bytes = build_pdf_report(patient_id=patient_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=BioTwin_Consult_Report_{patient_id}.pdf"}
    )

