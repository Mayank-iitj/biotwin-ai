# Current State
## Project Structure
- `apps/web`: Next.js 14 frontend, using React, TailwindCSS, Recharts, Framer Motion. Contains pages for dashboard, twin, reports, conditions, etc.
- `apps/api`: FastAPI backend (originally found inside `apps/web/api`). Contains routers, models, schemas, services.
- `packages/shared-types`: Exists.
- `infra`: Dockerfiles and docker-compose.
- Data parsed into `apps/web/lib`: `blood-reports-parsed.json`, `fitbit-data-merged.json`.
- Database: PostgreSQL (presumably run via Docker) with asyncpg + SQLAlchemy.

## Features
- Auth: Handled.
- Blood Report parsing.
- Dashboard with `GradientBlinds` component.
- Disease Intelligence Library (133+ conditions).
- AI Coach (Claude-based).
- 3D Body Twin (`HumanBodyViewer.tsx`).

## Scope Demotion
- Multi-disease features and Symptom checker will be hidden behind `LEGACY_MODULES=true`.
