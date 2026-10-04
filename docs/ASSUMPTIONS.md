# Assumptions

1. The FastAPI backend was discovered at `apps/web/api` instead of `apps/api` as indicated in the target architecture. It has been moved to `apps/api` to conform to the challenge target architecture.
2. The team name for the challenge is `TODO_TEAM_NAME` from IIT Jodhpur, as required by the submission guidelines, which will be updated by the actual team later.
3. Only Type 2 Diabetes (T2D) is in scope for the primary challenge evaluation. Legacy modules are hidden behind the `LEGACY_MODULES=true` feature flag.
4. No real data is used. Data will be generated synthetically via Synthea and custom CGM/wearable simulators.
