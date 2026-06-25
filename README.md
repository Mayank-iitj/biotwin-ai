# BioTwin AI - Preventive Healthcare Platform

> *"Prevent Today. Protect Tomorrow."*

A production-grade preventive healthcare platform that constructs a personalized "Digital Human Twin" for each user from blood reports, wearable data, lifestyle inputs, sleep, nutrition, and family history — then forecasts disease risk, simulates lifestyle interventions, and explains everything through a conversational AI Health Coach.

## Features

- **Digital Human Twin** - Interactive 3D body visualization with organ-level health indicators
- **Disease Forecast Engine** - ML models estimating future risk for diabetes, cardiovascular disease, hypertension, CKD, and obesity
- **What-If Simulator** - Perturb lifestyle variables and see projected risk deltas
- **AI Health Coach** - Claude-powered chat grounded in your personal health data
- **Blood Report Analysis** - Upload and parse blood work results
- **Wearable Integration** - Sync with Fitbit, Apple Health, Google Fit
- **Disease Intelligence Library** - 133+ conditions with body impact maps, symptoms, medications, diet plans, workout recommendations, and precautions (powered by 3 medical datasets: DiseaseD1, DiseaseD2, DiseaseD3)
- **Symptom Checker** - Select from 131 real symptoms to identify possible conditions with confidence scoring and severity-based emergency alerts

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Framer Motion, Recharts |
| Backend | FastAPI (Python 3.11), Pydantic v2, SQLAlchemy async |
| Database | PostgreSQL with pgvector |
| Auth | JWT with refresh token rotation |
| ML | scikit-learn, XGBoost, LightGBM, SHAP |
| LLM | Anthropic Claude API |
| Deployment | Vercel (frontend), Railway/ECS (backend) |

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+

### Local Development

```bash
# Clone the repository
cd biotwin-ai

# Start infrastructure
docker-compose -f infra/docker/docker-compose.yml up -d

# Install frontend dependencies
cd apps/web && npm install

# Install backend dependencies
cd apps/api && pip install -r requirements.txt

# Run frontend
cd apps/web && npm run dev

# Run backend (separate terminal)
cd apps/api && uvicorn app.main:app --reload
```

The frontend will be available at `http://localhost:3000`
The API will be available at `http://localhost:8000`

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/biotwin
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Vercel (Frontend)

```bash
cd apps/web

# Deploy to Vercel
vercel deploy --prod

# Or connect your GitHub repository to Vercel
# It will auto-detect Next.js and deploy
```

### Railway (Backend)

```bash
# Install Railway CLI
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Docker

```bash
# Build images
docker build -f infra/docker/Dockerfile.api -t biotwin-api .
docker build -f infra/docker/Dockerfile.web -t biotwin-web .

# Run
docker-compose -f infra/docker/docker-compose.yml up -d
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/signup` | Register new user |
| `POST /api/v1/auth/login` | Login user |
| `GET /api/v1/users/me` | Get current user profile |
| `POST /api/v1/health-data/blood-report` | Upload blood report |
| `GET /api/v1/twin/me` | Get digital twin snapshot |
| `POST /api/v1/risk/assess` | Run risk assessment |
| `POST /api/v1/simulate` | Run what-if simulation |
| `POST /api/v1/coach/sessions/{id}/messages` | Chat with AI Coach |
| `GET /api/v1/dashboard/summary` | Get dashboard summary |
| `POST /api/v1/privacy/export` | Export user data |

## Project Structure

```
biotwin-ai/
├── apps/
│   ├── api/              # FastAPI backend
│   │   ├── app/
│   │   │   ├── core/     # Config, database
│   │   │   ├── models/   # SQLAlchemy models
│   │   │   ├── routers/  # API endpoints
│   │   │   ├── schemas/  # Pydantic schemas
│   │   │   └── services/ # Business logic
│   │   └── requirements.txt
│   │
│   └── web/              # Next.js frontend
│       ├── app/
│       │   ├── components/  # React components
│       │   ├── dashboard/   # Dashboard page
│       │   └── lib/         # API client, utils
│       ├── package.json
│       └── next.config.js
│
├── packages/
│   └── shared-types/     # Shared TypeScript types
│
├── infra/
│   ├── docker/           # Dockerfiles, docker-compose
│   └── github-actions/   # CI pipeline
│
└── docs/                 # Documentation
```

## Disclaimer

⚠️ **Important**: BioTwin AI provides wellness risk estimates based on the data you provide. It is NOT a diagnostic tool and does NOT replace professional medical evaluation. Always consult a licensed healthcare provider for diagnosis, treatment, or any urgent symptoms.

The AI Health Coach should not be used for medical emergencies - if you're experiencing chest pain, severe symptoms, or a medical emergency, please seek immediate professional care.

## License

MIT License - See LICENSE file for details.

## Built with ❤️ by BioTwin AI

*"Prevent Today. Protect Tomorrow."*# biotwin-ai
