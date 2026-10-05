<div align="center">
  <img src="https://img.shields.io/badge/Digital_Twin_Challenge-2026-blueviolet?style=for-the-badge&logo=medict" alt="Challenge 2026" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  
  <br />
  <br />

  <h1 align="center">🧬 BioTwin AI</h1>
  <p align="center">
    <strong>Project Title: BioTwin AI — Real-Time Type 2 Diabetes Digital Human Twin</strong>
    <br />
    Translating continuous monitoring and historical health records into actionable, predictive foresight for clinicians.
  </p>

  <br />
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-bbiotwin.vercel.app-blue?style=for-the-badge&logo=vercel)](https://bbiotwin.vercel.app)
  
  <br />
</div>

---

## 👥 Team & Affiliation
* **Team Name:** Apex
* **College/Incubator Information:** IIT Jodhpur

---

## 🚨 Problem Statement
Type 2 Diabetes (T2D) affects millions globally, yet disease progression and hyperglycemic events often remain silent between episodic clinical visits. Physicians lack real-time predictive tools to anticipate metabolic crises before they occur, relying instead on historical, static Electronic Health Records (EHR) that fail to capture the dynamic reality of a patient's metabolic state.

## 🏥 Healthcare Use Case
**BioTwin AI** bridges the critical gap in metabolic monitoring by fusing static EHR data with dynamic Continuous Glucose Monitors (CGM) telemetry to create a highly personalized **Digital Twin**. 

Clinicians use BioTwin AI to:
1. **Predict** hyperglycemic and hypoglycemic excursions up to **120 minutes in advance**.
2. **Simulate** clinical interventions (e.g., *Administer 10u Insulin*, *30m Exercise*) using the "What-If" simulator before applying them to the actual patient.
3. **Consult** an intelligent AI Clinician Copilot for immediate, data-driven second opinions.

---

## ✨ Premium Features

* 📊 **Real-Time Patient Telemetry:** High-performance WebSocket streaming rendering continuous CGM, heart rate, and metabolic vitals natively on the dashboard.
* 🤖 **AI Clinician Copilot:** Powered by NVIDIA NIM LLMs (DeepSeek v4), the copilot securely answers clinical queries and automatically extracts parameters to trigger remote simulations.
* ⚡ **"What-If" Simulator:** An interactive engine allowing clinicians to instantly test the metabolic impact of interventions.
* 🧠 **Explainable AI (XAI):** Integrated SHAP-based feature importance algorithms translating model inference into transparent, human-readable clinical drivers.
* 🔐 **Privacy-First Architecture:** Complete data anonymization, audit logs, and HIPAA-inspired data export workflows.
* 🌐 **Fully Orchestrated Deployment:** Live Next.js frontend integrated with a containerized Docker FastAPI backend.

---

## 🛠️ Technical Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, TailwindCSS, Framer Motion, Recharts, TypeScript, NextAuth (Google OAuth) |
| **Backend API** | FastAPI, Python 3.11, SQLAlchemy, Uvicorn, WebSockets, Pydantic |
| **Infrastructure** | Docker, Vercel (Edge), Render (Web Services), SQLite (Local/Demo), PostgreSQL |

---

## 🧠 AI/ML Model & Framework Details

BioTwin AI employs a hybrid Machine Learning architecture designed specifically for time-series metabolic forecasting:
* **Frameworks Used:** XGBoost, LightGBM, Scikit-learn, Optuna (Hyperparameter Tuning), Pandas, Numpy.
* **Core Model:** An extreme gradient-boosted (XGBoost) fusion model trained on a combination of sliding-window CGM telemetry and categorical EHR data.
* **Explainability Framework:** **SHAP (SHapley Additive exPlanations)** is integrated directly into the inference pipeline to provide real-time, transparent feature importance for every single prediction, ensuring clinicians understand *why* the AI made its forecast.
* **Data Generation Framework:** Utilizes **Synthea** to generate 100% synthetic, anonymized EHR records, paired with a custom Bergman Minimal Model ODE simulator for realistic continuous glucose generation.

---

## 📽️ Challenge Submission Materials

> **Note to Judges:** All files and links below are publicly accessible without additional permissions.

* 🎬 **Demo Video:** [Watch the 15-20 minute Demo Video (Uploaded as Unlisted on YouTube)](#) *(Please insert link here)*
* 🏛️ **Architecture Diagram:** [Download Architecture Diagram in PDF format](submission/architecture.pdf)
* 📊 **Presentation Deck:** [Download Presentation in PDF format covering project details and outcomes](submission/deck.pdf)

---

## 🚀 Quickstart (Local Development)

We've automated the entire build process using a centralized `Makefile`.

### Automated Setup
```bash
# 1. Install dependencies across all workspaces
make setup

# 2. Generate 100% synthetic EHR & CGM data
make data

# 3. Build sliding-window features & train the XGBoost fusion models
make train
```

### Running Locally
```bash
# Terminal 1: Starts the Uvicorn Backend (Port 8000)
make api

# Terminal 2: Starts the Next.js Frontend (Port 3000)
make web
```
Access the Clinician Dashboard at `http://localhost:3000/clinician`.

---

## 🌍 Production Deployment

* **Backend (Render):** Dockerized and deployed via Render Web Services (`infra/docker/Dockerfile.api`).
* **Frontend (Vercel):** Highly optimized Edge deployment via Vercel (`https://bbiotwin.vercel.app`).

---

## 🛡️ Open-source License Details

This project and all associated source code are released under the **MIT License**.
*Third-party notices:* This repository utilizes Synthea for synthetic EHR generation. Please review `THIRD_PARTY_NOTICES.md` for full acknowledgments.

---
<div align="center">
  <i>Engineered with precision for the Digital Twin Challenge 2026.</i>
</div>
