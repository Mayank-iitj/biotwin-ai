# TODO_TEAM_NAME - IIT Jodhpur

# BioTwin AI: Type 2 Diabetes Digital Human Twin
**Digital Twin Challenge 2026**

## 1. Problem Statement & Healthcare Use Case
Type 2 Diabetes (T2D) affects millions globally, with a rapidly growing prevalence in India. Progression is often silent, and episodic clinical visits miss the dynamic reality of a patient's metabolic state. There is a critical gap in translating continuous monitoring and historical health records into actionable, predictive foresight for clinicians.

BioTwin AI bridges this gap. By fusing static Electronic Health Records (EHR) with dynamic continuous glucose monitors (CGM) and wearable data, we create a personalized "Digital Twin." This twin predicts hyperglycemic excursions up to 120 minutes in advance, providing clinical decision support and interactive "What-If" simulation to optimize interventions.

## 2. Technical Stack & AI/ML Models
- **Data Pipeline:** 100% synthetic data. Synthea generates realistic Indian-demographic EHRs. A custom ODE simulator based on the Bergman Minimal Model generates 5-minute resolution CGM and wearable time-series.
- **Feature Store:** Sliding 6-hour windows with temporal aggregation, dynamic deltas, and static embeddings.
- **Fusion Model:** XGBoost classifier fusing static and dynamic features, tuned via Optuna, and calibrated with Isotonic Regression to output reliable event probabilities.
- **Explainability:** SHAP-based feature importance mapped to human-readable clinical drivers.
- **API (Backend):** FastAPI (Python 3.11), SQLAlchemy, PostgreSQL/pgvector.
- **UI (Frontend):** Next.js 14, TailwindCSS, Recharts, Framer Motion for the Clinician Dashboard.

## 3. Demo Video
[Link to YouTube Video Placeholder](https://youtube.com/unlisted-link)
See `submission/video_script.md` for the presentation flow.

## 4. Open-Source License
MIT License.
Third-party notices: Uses Synthea for synthetic EHR generation. See `THIRD_PARTY_NOTICES.md`.

## 5. Architecture
![Architecture Diagram](submission/architecture.pdf)
*See `submission/architecture.md` for mermaid source.*

## 6. Presentation Deck
[Download Pitch Deck](submission/deck.pdf)

## 7. Quickstart (Reproducibility)
```bash
make setup
make data
make train
make evaluate
make demo
```
Access the Clinician Dashboard at `http://localhost:3000/clinician`.

## 8. Limitations & Future Work
- Uses synthetic data. Future validation requires real-world, IRB-approved clinical datasets.
- Simulator assumes perfect adherence to meal logs; real-world CGM noise is more complex.

---
**Disclaimer:** Built for the Digital Twin Challenge 2026. This platform uses synthetic data and provides decision support estimates for clinical review. It is NOT a diagnostic medical device.
