<div align="center">
  <img src="https://img.shields.io/badge/Digital_Twin_Challenge-2026-blueviolet?style=for-the-badge&logo=medict" alt="Challenge 2026" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  
  <br />
  <br />

  <h1 align="center">🧬 BioTwin AI</h1>
  <p align="center">
    <strong>Real-Time Type 2 Diabetes Digital Human Twin</strong>
    <br />
    Translating continuous monitoring and historical health records into actionable, predictive foresight for clinicians.
  </p>

  <br />
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-bbiotwin.vercel.app-blue?style=for-the-badge&logo=vercel)](https://bbiotwin.vercel.app)
  
  <br />
</div>

---

## 🌟 The Vision

Type 2 Diabetes (T2D) affects millions globally, with progression often remaining silent between episodic clinical visits. **BioTwin AI** bridges the critical gap in metabolic monitoring. By fusing static Electronic Health Records (EHR) with dynamic Continuous Glucose Monitors (CGM) and wearable telemetry, we create a highly personalized **Digital Twin**. 

This Twin predicts hyperglycemic excursions up to **120 minutes in advance**, providing interactive "What-If" simulations and intelligent clinician copilot support to optimize patient interventions.

---

## ✨ Premium Features

* 📊 **Real-Time Patient Telemetry:** High-performance WebSocket streaming rendering continuous CGM, heart rate, and metabolic vitals natively on the dashboard.
* 🤖 **AI Clinician Copilot:** Powered by NVIDIA NIM LLMs (DeepSeek v4), the copilot securely answers clinical queries and automatically extracts parameters to trigger remote simulations.
* ⚡ **"What-If" Simulator:** An interactive engine allowing clinicians to instantly test the metabolic impact of interventions (e.g., *Administer 10u Insulin*, *30m Exercise*).
* 🧠 **Explainable AI (XAI):** Integrated SHAP-based feature importance algorithms translating XGBoost model inference into transparent, human-readable clinical drivers.
* 🔐 **Privacy-First Architecture:** Complete data anonymization, audit logs, and HIPAA-inspired data export workflows.
* 🌐 **Fully Orchestrated Deployment:** Live Next.js frontend integrated with a containerized Docker FastAPI backend.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, TailwindCSS, Framer Motion, Recharts, TypeScript, NextAuth (Google OAuth) |
| **Backend API** | FastAPI, Python 3.11, SQLAlchemy, Uvicorn, WebSockets, Pydantic |
| **Machine Learning** | XGBoost, LightGBM, SHAP, Optuna, Scikit-learn, Pandas, Numpy |
| **Infrastructure** | Docker, Vercel (Edge), Render (Web Services), SQLite (Local/Demo), PostgreSQL |
| **Data Generation**| Synthea (Synthetic EHR), Custom Bergman Minimal Model ODE Simulator |

---

## 📽️ Challenge Submission Materials

> **Disclaimer:** Built specifically for the *Digital Twin Challenge 2026*. This platform strictly utilizes synthetic, anonymized data for clinical decision support estimation. It is NOT a diagnostic medical device.

* 🎬 **Demo Video:** [Watch the BioTwin AI Demo](https://youtube.com/unlisted-link) *(See `submission/video_script.md` for flow)*
* 🏛️ **Architecture Overview:** ![Architecture Diagram](submission/architecture.pdf) *(See `submission/architecture.md` for Mermaid source)*
* 📊 **Presentation Deck:** [Download Official Pitch Deck](submission/deck.pdf)

---

## 🚀 Quickstart (Local Development)

We've automated the entire build process using a centralized `Makefile`.

### Prerequisites
* Node.js 20+
* Python 3.11+
* Docker (optional, for deployment testing)

### Automated Setup
```bash
# 1. Install dependencies across all workspaces
make setup

# 2. Generate 100% synthetic EHR & CGM data
make data

# 3. Build sliding-window features & train the XGBoost fusion models
make train

# 4. Evaluate SHAP and model metrics
make evaluate
```

### Running Locally
You can run the web and API servers concurrently in separate terminals:
```bash
# Terminal 1: Starts the Uvicorn Backend (Port 8000)
make api

# Terminal 2: Starts the Next.js Frontend (Port 3000)
make web
```
Access the Clinician Dashboard at `http://localhost:3000/clinician`.

---

## 🌍 Production Deployment

BioTwin AI is fully configured for zero-downtime cloud deployments.

### 1. Backend (Render)
The backend is Dockerized and ready for **Render**.
* Simply connect the repository to Render as a **Web Service**.
* Set Environment to **Docker**.
* Provide the Dockerfile path: `infra/docker/Dockerfile.api`.
* *Variables Required:* `CORS_ORIGINS` (your frontend URL), `DATABASE_URL` (SQLite or Postgres).

### 2. Frontend (Vercel)
The Next.js 14 app is highly optimized for Vercel's edge network.
* Deploy directly to **Vercel**.
* *Variables Required:* `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

---

## 🛡️ Open Source License & Notices

Released under the **MIT License**.
*Third-party notices:* This repository utilizes Synthea for synthetic EHR generation. Please review `THIRD_PARTY_NOTICES.md` for full acknowledgments.

---
<div align="center">
  <i>Engineered with precision for the Digital Twin Challenge 2026.</i>
</div>
