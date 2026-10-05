# Current State: BioTwin AI (Audit)

## Project Structure (As of Audit)
- `apps/web`: Next.js 14 frontend, using React, TailwindCSS, Recharts, Framer Motion. Contains pages for dashboard, twin, reports, conditions, etc.
- `apps/api`: FastAPI backend. Contains routers (`auth.py`, `clinician.py`, `coach.py`, `dashboard.py`, `health_data.py`, `predictions.py`, `privacy.py`, `recommendations.py`, `risk.py`, `simulate.py`, `stream.py`, `t2d_twin.py`, `twin.py`, `users.py`) and services (`health_coach.py`, `risk_engine.py`, `simulator.py`).
- `ml/`: Self-contained ML package containing `artifacts/`, `data/`, `features/`, `models/`, `notebooks/`, `synth/`, `tests/`, and `requirements.txt`.
- `packages/shared-types`: Types shared across frontend and backend.
- `infra`: Contains docker files.
- `docs/`: Assorted project documentation (ASSUMPTIONS, DATA_CARD, DPDP, MODEL_CARD, etc).
- `Makefile`: Present with targets `setup`, `data`, `train`, `evaluate`, `api`, `web`, `demo`, `test`, `lint`.

## Features
- Auth: Handled (JWT + refresh rotation).
- Dashboard: Real components present.
- Clinician route: Setup started.
- Multi-disease & legacy modules: Present but to be demoted per MASTER BUILD PROMPT v2 (hidden behind `LEGACY_MODULES=true`).
- ML/Pipeline: `ml/synth` and `ml/features` exist.

## Audit vs MASTER BUILD PROMPT v2 Requirements
- **Routers**: Need to add/update `ingest.py`, `alerts.py`, `whatif_t2d.py`, `cohort.py`, `exports.py`, `monitoring.py`, `model_info.py`.
- **Services**: Need to add/update `twin_engine.py`, `feature_stream.py`, `inference.py`, `forecast.py`, `explain.py`, `alert_engine.py`, `counterfactual.py`, `replay.py`, `drift.py`, `summary.py`, `report_pdf.py`, `fhir_export.py`, `meal_library.py`, `audit.py`.
- **Web**: Need to build out primary clinician views: cohort, patient/[id], whatif, cohort-analytics, monitoring, model-transparency, alerts.
- **Data (Synthetic)**: Synthea / CGM simulator needs to be validated against requirements (Indian demographic, PRS, etc).
- **ML Engine**: Needs real-time feature streaming parity, forecasting, alert engine rules.

Baseline build/tests are actively running and currently passing.
