from fastapi import APIRouter
from fastapi.responses import JSONResponse, Response

router = APIRouter(tags=["exports"])

@router.get("/patients/{patient_id}/fhir.json")
async def export_fhir(patient_id: str):
    """
    Export patient data as a FHIR-style bundle.
    """
    bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": patient_id,
                    "meta": {"tag": [{"code": "synthetic-data"}]}
                }
            },
            {
                "resource": {
                    "resourceType": "RiskAssessment",
                    "status": "final",
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "prediction": [{"outcome": {"text": "Hyperglycemia > 180 mg/dL within 120m"}}]
                }
            }
        ]
    }
    return JSONResponse(content=bundle)

@router.get("/patients/{patient_id}/report.pdf")
async def export_pdf(patient_id: str):
    """
    Export patient data as a PDF report.
    Returns a mocked PDF for the challenge.
    """
    return Response(content=b"%PDF-1.4\n%Mock PDF for Challenge\n", media_type="application/pdf")
