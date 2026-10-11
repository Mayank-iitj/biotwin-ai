"""
Async end-to-end backend verification script using httpx.AsyncClient.
"""
import sys
import os
import asyncio
import httpx

# Add apps/api to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'api'))

from app.main import app

async def run_async_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("Testing BioTwin AI Backend Endpoints (Async Engine)...")
        
        # 1. Health
        r = await client.get("/health")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        print("  [PASS] GET /health -> 200 OK")

        # 2. Patients list
        r = await client.get("/api/v1/clinician/patients")
        assert r.status_code == 200, f"List patients failed: {r.status_code}"
        data = r.json()
        assert len(data) >= 3, "Expected at least 3 patients"
        print(f"  [PASS] GET /api/v1/clinician/patients -> 200 OK ({len(data)} patients)")

        # 3. Patient Timeline
        r = await client.get("/api/v1/stream/patients/synthetic_1/timeline")
        assert r.status_code == 200, f"Timeline failed: {r.status_code}"
        timeline = r.json().get("timeline", [])
        assert len(timeline) >= 20, "Expected at least 20 timeline points"
        print(f"  [PASS] GET /api/v1/stream/patients/synthetic_1/timeline -> 200 OK ({len(timeline)} points)")

        # 4. Indian Meals
        r = await client.get("/api/v1/simulate/t2d/meals")
        assert r.status_code == 200, f"Meals failed: {r.status_code}"
        meals = r.json().get("meals", [])
        assert len(meals) > 0, "Expected meals in catalog"
        print(f"  [PASS] GET /api/v1/simulate/t2d/meals -> 200 OK ({len(meals)} Indian dishes)")

        # 5. What-If Simulation
        r = await client.post("/api/v1/simulate/t2d/", json={
            "patient_id": "synthetic_1",
            "meal_carbs": 45,
            "meal_id": "roti_dal",
            "gi": 45,
            "post_meal_walk_mins": 15,
            "medication": "Metformin"
        })
        assert r.status_code == 200, f"Simulation failed: {r.status_code}"
        sim_data = r.json()
        assert "intervention_trajectory" in sim_data, "Missing trajectory"
        print(f"  [PASS] POST /api/v1/simulate/t2d/ -> 200 OK (Risk Delta: {sim_data.get('risk_delta')})")

        # 6. Auto-Optimizer
        r = await client.post("/api/v1/simulate/t2d/optimize", json={
            "patient_id": "synthetic_1",
            "target_max_glucose": 160
        })
        assert r.status_code == 200, f"Optimize failed: {r.status_code}"
        opt_data = r.json()
        assert "optimal_plan" in opt_data, "Missing optimal plan"
        print("  [PASS] POST /api/v1/simulate/t2d/optimize -> 200 OK")

        # 7. Alerts
        r = await client.get("/api/v1/alerts/patients/synthetic_1")
        assert r.status_code == 200, f"Alerts failed: {r.status_code}"
        alerts = r.json().get("alerts", [])
        assert len(alerts) > 0, "Expected active alerts"
        print(f"  [PASS] GET /api/v1/alerts/patients/synthetic_1 -> 200 OK ({len(alerts)} alerts)")

        # 8. Alert Action
        r = await client.post("/api/v1/alerts/action", json={
            "alert_id": alerts[0]["id"],
            "action": "acknowledge",
            "reason": "prescribed_intervention",
            "notes": "Testing alert lifecycle feedback"
        })
        assert r.status_code == 200, f"Alert action failed: {r.status_code}"
        print("  [PASS] POST /api/v1/alerts/action -> 200 OK (Lifecycle acknowledged)")

        # 9. PDF Consult Export
        r = await client.get("/api/v1/export/patients/synthetic_1/report.pdf")
        assert r.status_code == 200, f"PDF export failed: {r.status_code}"
        assert r.content.startswith(b"%PDF-1.4"), "Invalid PDF header bytes"
        print(f"  [PASS] GET /api/v1/export/patients/synthetic_1/report.pdf -> 200 OK ({len(r.content)} bytes PDF)")

        # 10. FHIR R4 Bundle
        r = await client.get("/api/v1/export/patients/synthetic_1/fhir.json")
        assert r.status_code == 200, f"FHIR export failed: {r.status_code}"
        fhir_data = r.json()
        assert fhir_data.get("resourceType") == "Bundle", "Expected FHIR Bundle"
        assert len(fhir_data.get("entry", [])) >= 5, "Expected FHIR resources in bundle"
        print(f"  [PASS] GET /api/v1/export/patients/synthetic_1/fhir.json -> 200 OK ({len(fhir_data['entry'])} HL7 resources)")

        # 11. Cohort Analytics
        r = await client.get("/api/v1/cohort/analytics")
        assert r.status_code == 200, f"Cohort analytics failed: {r.status_code}"
        print("  [PASS] GET /api/v1/cohort/analytics -> 200 OK")

        # 12. Monitoring Drift & Latency
        r = await client.get("/api/v1/monitoring/drift")
        assert r.status_code == 200, f"Drift failed: {r.status_code}"
        r_lat = await client.get("/api/v1/monitoring/latency")
        assert r_lat.status_code == 200, f"Latency failed: {r_lat.status_code}"
        print("  [PASS] GET /api/v1/monitoring/drift & /latency -> 200 OK")

        # 13. Inject Drift
        r = await client.post("/api/v1/monitoring/inject-drift", json={"inject": True})
        assert r.status_code == 200, f"Inject drift failed: {r.status_code}"
        print("  [PASS] POST /api/v1/monitoring/inject-drift -> 200 OK (Drift injected)")

        print("\nALL 13 BACKEND CHALLENGE ENDPOINTS VERIFIED AND PASSING WITH FLYING COLORS!")

if __name__ == "__main__":
    asyncio.run(run_async_tests())
