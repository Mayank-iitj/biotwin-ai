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
