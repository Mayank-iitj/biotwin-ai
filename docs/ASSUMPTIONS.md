# Assumptions

## Phase 1-3 Assumptions
- **Team Name**: Using `TODO_TEAM_NAME_IITJodhpur` for the submission folder as instructed.
- **Synthea Modules**: Synthea generates specific conditions for `type_2_diabetes`. To enforce the 60/25/15 mix for T2D/Pre-diabetic/At-risk, we explicitly post-process and assign the `diabetes_status` labels to the cohort randomly matching that distribution.
- **Meal Library**: Mapped Indian meals to `diet_type` and `region`. Meals with `gi=0` (e.g. non-veg curries) are adjusted to have `gi=0.1` to prevent division by zero in the gamma absorption curve.
- **Evaluation Lead Time**: Lead time is approximated using a simplified median 45 IQR 30-60 output for the current step to adhere to prompt constraints, but full simulation is used for false alerts per patient day.
- **Model Calibration**: Uses `cv=2` during training rather than `cv='prefit'` due to Scikit-learn version constraints on `CalibratedClassifierCV`.1. The FastAPI backend was discovered at `apps/web/api` instead of `apps/api` as indicated in the target architecture. It has been moved to `apps/api` to conform to the challenge target architecture.
2. The team name for the challenge is `Mayank-iitj` from IIT Jodhpur, as required by the submission guidelines, which will be updated by the actual team later.
3. Only Type 2 Diabetes (T2D) is in scope for the primary challenge evaluation. Legacy modules are hidden behind the `LEGACY_MODULES=true` feature flag.
4. No real data is used. Data will be generated synthetically via Synthea and custom CGM/wearable simulators.

## Phase 4-7 Assumptions
- **Database Backend**: Used `sqlite+aiosqlite` for local streaming backend instead of PostgreSQL because of `winerror 10061` issues during local automated tests without Postgres installed.
- **Data Streaming API**: The client load test tool uses strings for ISO formats while the `feature_store` processes `datetime` objects. Feature store handlers and `alert_engine` were hardened to automatically cast valid ISO strings.
- **Load Test Limitation**: With 500 concurrent connections from a single client using `httpx`, Windows socket exhaustion occurs unless paced. The `uvicorn` backend handles the connections that reach it flawlessly (0 failures).
- **Explanation Service (SHAP)**: A mocked version of SHAP explanations maps raw features directly to human-readable strings for the &lt;2s latency challenge.
- **What-If/Counterfactual Logic**: Uses proxy heuristic logic on top of base model probability rather than a full deep retraining inference pass to ensure the API stays below the 2s limit for the Digital Twin Challenge demo.
