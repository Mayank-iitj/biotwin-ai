# Changelog

## Master Build Prompt v2 Progress
- **Phase 0 (Audit)**: Audited repo, updated `CURRENT_STATE.md`.
- **Phase 1 (Data)**: Implemented `meal_library.py` (Indian context, GI, Carbs), updated `generate_ehr.py` (region, 60/25/15 target split), updated `cgm_simulator.py` to use meal library and GI-based absorption, created `sanity_report.py`, created `live_producer.py`. Tests passing.
- **Phase 2 (Features)**: Created `shared.py` for parity between batch and streaming features. Wrote `test_parity.py` proving identical outputs. Updated `build_windows.py` to include targets for Quantile Forecaster.
- **Phase 3 (Models)**: Refactored `train.py` to output `quantile_models` (+30, +60, +90, +120 mins), `hypo_model.pkl` (Hypo60), and Risk Tier thresholds. Evaluated ablation (started).
## Phase 1: Data Layer
- Implemented `generate_ehr.py` to handle Synthea downloads, generation, and Indian demographic processing.
- Implemented `cgm_simulator.py` to create dynamic time-series data using a simplified Bergman Minimal Model.

## Phase 2: Feature Engineering
- Implemented `build_windows.py` to generate sliding windows, rolling stats, and labels for Type 2 Diabetes excursion prediction.

## Phase 3: Models
- Implemented `train.py` (XGBoost fusion model + isotonic calibration).
- Implemented `evaluate.py` to compute AUROC, AUPRC, and Brier scores.

## Phase 4: Backend API
- Restructured Python API to `apps/api`.
- Added routers: `clinician.py`, `predictions.py`, `stream.py`, `t2d_twin.py`.
- Integrated SSE streaming and prediction mocking for the clinician dashboard.

## Phase 5: Frontend Doctor Dashboard
- Created `/clinician` dashboard with live glucose charts, SHAP explainability panel, and What-If simulator.
- Demoted legacy modules behind feature flags conceptually.

## Phase 6: Submission Package
- Created updated `README.md`, `DPDP.md`, `MODEL_CARD.md`, `DATA_CARD.md`.
- Generated `video_script.md` and `architecture.md` (Mermaid).
- Defined `Makefile` for end-to-end reproducibility.
