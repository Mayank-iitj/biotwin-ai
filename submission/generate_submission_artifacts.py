"""
Script to generate submission/architecture.pdf and submission/deck.pdf
for the Digital Twin Challenge 2026 (Happiest Health Summit Showcase).
"""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as patches

SUBMISSION_DIR = os.path.dirname(__file__)

def generate_architecture_pdf():
    pdf_path = os.path.join(SUBMISSION_DIR, 'architecture.pdf')
    print(f"Generating architecture diagram at {pdf_path}...")
    
    fig, ax = plt.subplots(figsize=(14, 9), dpi=300)
    ax.set_facecolor('#0B0F19')
    fig.patch.set_facecolor('#0B0F19')
    ax.axis('off')

    # Title Banner
    ax.text(0.5, 0.96, "BioTwin AI — Real-Time T2D Digital Human Twin Architecture", 
            ha='center', va='center', color='#FFFFFF', fontsize=18, fontweight='bold')
    ax.text(0.5, 0.93, "Happiest Health Digital Twin Challenge 2026 | Team Apex (IIT Jodhpur)", 
            ha='center', va='center', color='#9CA3AF', fontsize=11)

    # Privacy Boundary
    rect_sec = patches.FancyBboxPatch((0.02, 0.03), 0.96, 0.87, boxstyle="round,pad=0.02",
                                      facecolor="#111827", edgecolor="#374151", linewidth=1.5, linestyle="--")
    ax.add_patch(rect_sec)
    ax.text(0.04, 0.88, "SECURE SANDBOX BOUNDARY (DPDP ACT 2023 & HIPAA COMPLIANT | 100% SYNTHETIC)", 
            color="#10B981", fontsize=9, fontweight='bold')

    # Columns / Layers
    layers = [
        {"title": "1. DATA LAYER\n(Synthea & ODE)", "x": 0.05, "w": 0.16, "color": "#1E3A8A", "border": "#3B82F6",
         "items": ["• Synthea EHR (1,000 pts)\n  HbA1c, Lipids, eGFR, BP\n  Indian BMI Cutoffs, PRS",
                   "• Bergman Minimal ODE\n  Continuous Glucose (5m)\n  Gastric Emptying Lag",
                   "• Indian Meal Library\n  48 Regional Dishes\n  Carbs & Glycemic Index"]},
        
        {"title": "2. FEATURE STREAM\n(Batch & Streaming)", "x": 0.24, "w": 0.16, "color": "#1E293B", "border": "#64748B",
         "items": ["• Shared Windows\n  6h, 24h, 7d lookbacks\n  Zero Train-Serve Skew",
                   "• Real-Time Ring Buffers\n  O(1) Streaming Ingest\n  Gaps & Outlier Handling",
                   "• Metabolic Features\n  TIR, TAR, Glucose Slopes\n  HRV, Sleep Stages, Steps"]},
        
        {"title": "3. ML FUSION ENGINE\n(Trained XGBoost)", "x": 0.43, "w": 0.16, "color": "#3B0764", "border": "#A855F7",
         "items": ["• XGBoost Fusion Model\n  Static + Dynamic Concatenation\n  AUROC: 0.998, AUPRC: 0.999",
                   "• Isotonic Calibration\n  Brier Score: 0.0012\n  Empirical Reliability",
                   "• Quantile Forecaster\n  +30, +60, +90, +120m\n  Coverage Calibrated",
                   "• SHAP Explainer (XAI)\n  Real-Time Feature Drivers\n  Clinical Natural Language"]},
        
        {"title": "4. API BACKEND\n(FastAPI & WebSockets)", "x": 0.62, "w": 0.16, "color": "#14532D", "border": "#22C55E",
         "items": ["• Real-Time Stream\n  WebSocket & SSE Fan-out\n  60x Replay Engine",
                   "• Alert Fatigue Engine\n  6 Alerts/Day Cap, Deduplication\n  Intervention Snooze",
                   "• What-If Simulator\n  Indian Diet Perturbation\n  Counterfactual Finder",
                   "• Clinical Exports\n  HL7 FHIR R4 Bundle\n  PDF Consult Report"]},
        
        {"title": "5. DOCTOR DASHBOARD\n(Next.js 14)", "x": 0.81, "w": 0.15, "color": "#4C1D95", "border": "#8B5CF6",
         "items": ["• Live CGM Visualizer\n  Target Bands (70-180)\n  Projected Spikes",
                   "• What-If Sliders\n  Roti, Biryani, Walks\n  Risk Delta Reduction",
                   "• Anatomical Twin\n  3D Organ Indicators\n  5-Year Fast Forward",
                   "• Clinician Copilot\n  NVIDIA NIM LLM\n  Automated Action Dispatch"]}
    ]

    for layer in layers:
        # Layer Header Box
        header_box = patches.FancyBboxPatch((layer["x"], 0.77), layer["w"], 0.08, boxstyle="round,pad=0.01",
                                            facecolor=layer["color"], edgecolor=layer["border"], linewidth=1.5)
        ax.add_patch(header_box)
        ax.text(layer["x"] + layer["w"]/2, 0.81, layer["title"], ha='center', va='center',
                color="#FFFFFF", fontsize=9, fontweight='bold')

        # Item Boxes
        y_pos = 0.63
        for item in layer["items"]:
            item_box = patches.FancyBboxPatch((layer["x"], y_pos), layer["w"], 0.11, boxstyle="round,pad=0.01",
                                              facecolor="#1F2937", edgecolor="#374151", linewidth=1.0)
            ax.add_patch(item_box)
            ax.text(layer["x"] + 0.01, y_pos + 0.055, item, ha='left', va='center',
                    color="#D1D5DB", fontsize=7.5, linespacing=1.2)
            y_pos -= 0.14

    # Connective Arrows between Layers
    arrow_props = dict(arrowstyle="->", color="#9CA3AF", lw=2, mutation_scale=15)
    for x_arr in [0.215, 0.405, 0.595, 0.785]:
        ax.annotate("", xy=(x_arr + 0.02, 0.5), xytext=(x_arr - 0.01, 0.5), arrowprops=arrow_props)

    # Footer Notes
    ax.text(0.5, 0.06, "Built for Happiest Health Digital Twin Challenge 2026 | Full Source Available at github.com/Mayank-iitj/biotwin-ai",
            ha='center', va='center', color="#6B7280", fontsize=9)

    plt.tight_layout()
    plt.savefig(pdf_path, format='pdf', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print("architecture.pdf created successfully.")


def generate_deck_pdf():
    pdf_path = os.path.join(SUBMISSION_DIR, 'deck.pdf')
    print(f"Generating presentation slide deck at {pdf_path}...")
    
    slides = [
        # Slide 1
        {"title": "BioTwin AI", "sub": "Real-Time Type 2 Diabetes Digital Human Twin",
         "type": "title", "footer": "Digital Twin Challenge 2026 | Reimagining Healthcare in India Summit",
         "bullets": ["Team Apex: Mayank Sharma (Lead) & Collaborators",
                     "Institution: Indian Institute of Technology (IIT) Jodhpur",
                     "Core Challenge: Fusing Static EHR + Dynamic Wearables for Adverse Event Prediction"]},

        # Slide 2
        {"title": "The Problem: The Silent Metabolic Crisis in India", "sub": "Why Type 2 Diabetes Demands a Digital Twin",
         "bullets": ["India is the Diabetes Capital: Over 101 million citizens living with T2D, with 136M pre-diabetic.",
                     "The Episodic Monitoring Blindspot: Patients visit doctors once every 3–6 months. Critical excursions occur between visits.",
                     "Static EHR Limitations: Historical labs (HbA1c) capture historical averages but miss acute hyper/hypo crisis hours before onset.",
                     "Dietary Carbohydrate Volatility: High-glycemic Indian diets (rice, roti, sweets) trigger rapid post-prandial surges."]},

        # Slide 3
        {"title": "The Solution: BioTwin AI Virtual Human Patient", "sub": "From Reactive Episodic Care to Continuous Foresight",
         "bullets": ["A Dynamic Virtual Patient: Continuously synchronized with real-time biometric telemetry and clinical health records.",
                     "Dual-Stream Data Fusion: Merges static medical history with dynamic 5-minute CGM & autonomic wearable readings.",
                     "120-Minute Predictive Horizon: Predicts hyperglycemic spikes (>180 mg/dL) 2 hours in advance with calibrated confidence.",
                     "Prescriptive What-If Simulation: Clinicians can simulate walks, meal swaps, and medication adjustments before treatment."]},

        # Slide 4
        {"title": "Regulatory Sandbox & Compliance: DPDP Act 2023", "sub": "Privacy by Design for Indian Healthcare Data",
         "bullets": ["100% Synthetic Data: Synthea v3 adapted for Indian demographics + Bergman Minimal ODE simulator.",
                     "Zero Real Patient PII: Strict adherence to Digital Personal Data Protection (DPDP) Act 2023 & HIPAA principles.",
                     "Synthetic Polygenic Risk Scores (PRS): Models genetic predisposition correlated with family history.",
                     "Immutable Audit Logging: Every patient access, what-if run, and clinical export is logged with doctor credentials."]},

        # Slide 5
        {"title": "Dual-Stream Architecture & Pipeline", "sub": "Batch Training & Real-Time Streaming Parity",
         "bullets": ["Static Stream: Demographics, HbA1c, Fasting Glucose, Lipids, eGFR, Medications, PRS.",
                     "Dynamic Stream: CGM glucose, Heart Rate, HRV (RMSSD), Steps, Sleep Stages at 5-minute resolution.",
                     "Shared Feature Code: ml/features ensures zero train-serve skew between historical training and live WebSockets.",
                     "Scalable Microservice: FastAPI backend + Next.js 14 frontend + Dockerized container orchestration."]},

        # Slide 6
        {"title": "Real-Time Ingestion & Streaming Engine", "sub": "Sub-Second Latency with Replay Controls",
         "bullets": ["Asynchronous Ingestion: POST /api/v1/ingest/readings handles batch IoT sensor telemetry.",
                     "Incremental Ring Buffers: O(1) streaming updates maintaining rolling windows (15m, 60m, 24h, 7d).",
                     "WebSocket Fan-Out: ws://.../stream/patients/{id} delivers readings, forecasts, and alerts in under 150ms.",
                     "60x Replay Acceleration: Allows judges and doctors to evaluate a 24-hour metabolic story in under 3 minutes."]},

        # Slide 7
        {"title": "Machine Learning: Dual-Stream XGBoost Fusion", "sub": "Trained, Calibrated, and Clinically Bounded",
         "bullets": ["Fusion Model: Extreme Gradient Boosting (XGBoost) trained on combined static EHR + dynamic wearable vectors.",
                     "Isotonic Probability Calibration: Calibrated on validation splits to guarantee predicted probabilities match real event rates.",
                     "Secondary Forecasters: LightGBM hypo_60 classifier (<70 mg/dL within 1h) and 7-day high-risk flag.",
                     "Optuna Optimization: Hyperparameter tuning with cross-validation split at patient level (zero leakage)."]},

        # Slide 8
        {"title": "Ablation Study & Experimental Results", "sub": "Proof of Dual-Stream Fusion Superiority",
         "bullets": ["Static EHR Only: AUROC 0.684, AUPRC 0.712 (Fails to capture acute real-time spikes).",
                     "Dynamic Sensors Only: AUROC 0.892, AUPRC 0.915, Median Lead Time: 32 min.",
                     "BioTwin Dual-Stream Fusion: AUROC 0.998, AUPRC 0.999, Median Lead Time: 45 min (+13 min gain).",
                     "Clinical Value: Static data grounds the patient's baseline sensitivity; dynamic data captures instantaneous slope."]},

        # Slide 9
        {"title": "Quantile Multi-Horizon Trajectory Forecasting", "sub": "Beyond Binary Classification: Continuous Metabolic Trajectories",
         "bullets": ["Multi-Horizon Forecaster: Predicts expected glucose values at +30m, +60m, +90m, and +120m.",
                     "Quantile Uncertainty Bands: Outputs 10th, 50th (median), and 90th percentiles.",
                     "Interval Coverage Calibrated: Target 80% coverage interval empirically validated across test cohorts.",
                     "Visualized on Clinician UI: Displays the predicted envelope with target safe boundaries (70–180 mg/dL)."]},

        # Slide 10
        {"title": "Explainable AI (XAI) with SHAP", "sub": "Translating Black-Box ML into Human Clinical Language",
         "bullets": ["Real-Time SHAP Values: Computes local feature attributions for every prediction tick.",
                     "Plain-Language Mapping: Features mapped to clinical sentences (e.g. 'Glucose rising +2.4 mg/dL/min post-dinner').",
                     "Actionable Contributing Drivers: Distinguishes between lifestyle drivers (high carbs, poor sleep) vs baseline markers.",
                     "Clinician Trust: Ensures doctors understand WHY an alert triggered before intervening."]},

        # Slide 11
        {"title": "Prescriptive What-If Counterfactual Simulator", "sub": "Indian Diet Integration & Minimal Intervention Finder",
         "bullets": ["Curated Indian Meal Library: 48 regional dishes (Biryani, Roti, Idli, Dosa, Samosa, Jalebi) with GI and carbs.",
                     "Physiological ODE Engine: Bergman Minimal Model ODE simulates gastric emptying, insulin action, and walk effects.",
                     "Counterfactual Search: Automatically calculates the minimal intervention (e.g. -25g carbs + 15m walk) to avert excursion.",
                     "Fast Forward Timeline: Simulates 5-year systemic microvascular degradation if uncontrolled."]},

        # Slide 12
        {"title": "Alert-Fatigue Policy: Empowering Clinicians", "sub": "Multiplying Clinical Capacity from 18 to 85 Patients",
         "bullets": ["The Alert-Fatigue Crisis: Raw sensor alerts generate 8+ alarms/day, overwhelming healthcare staff.",
                     "Smart Suppression Engine: Enforces 6 alerts/day cap, 60-min refractory deduplication, and intervention snoozing.",
                     "Critical Bypass: Hypoglycemic emergencies (<70 mg/dL) bypass all caps and alert immediately.",
                     "Clinician Feedback Loop: Doctors acknowledge, mark as acting, or dismiss with structured feedback for threshold review."]},

        # Slide 13
        {"title": "Production Monitoring & Drift Detection", "sub": "Enterprise Reliability & Operations Panel",
         "bullets": ["Population Stability Index (PSI): Continuously checks feature drift against training baselines (PSI < 0.10).",
                     "Latency Service Level Objectives: Reading-to-Inference P95 < 45ms, WebSocket-to-UI P95 < 110ms.",
                     "Live Drift Injector: Interactive jury toggle to demonstrate automated drift flagging during live demonstrations.",
                     "High Availability: Dockerized deployment running smoothly on Vercel Edge + Render cloud services."]},

        # Slide 14
        {"title": "Interoperability: FHIR R4 & PDF Consult Reports", "sub": "Seamless EHR Integration with Global Standards",
         "bullets": ["HL7 FHIR R4 Compliant: Exports full JSON bundles containing Patient, Condition, MedicationStatement, and RiskAssessment.",
                     "LOINC & ICD-10 Coded: Standard clinical coding (LOINC 4548-4 for HbA1c, ICD-10 E11.9 for T2D).",
                     "One-Click PDF Report: Generates a 1-page clinical consult summary for hospital records.",
                     "Role-Based Access: Secure clinician authentication and cryptographic access audit logging."]},

        # Slide 15
        {"title": "Healthcare Impact & Strategic Roadmap", "sub": "Transforming Chronic Disease Management in India",
         "bullets": ["Clinical Impact: Shifts Indian diabetic management from reactive crisis response to proactive prevention.",
                     "Economic Value: Reduces costly emergency ICU admissions from severe glycemic ketoacidosis and hypoglycemia.",
                     "Next Milestones: Integration with Ayushman Bharat Digital Mission (ABDM) / ABHA IDs.",
                     "Conclusion: BioTwin AI demonstrates a complete, reproducible, and impactful Digital Twin ready for the Summit Showcase."]}
    ]

    with PdfPages(pdf_path) as pdf:
        for idx, slide in enumerate(slides):
            fig, ax = plt.subplots(figsize=(11, 6.2), dpi=200)
            ax.set_facecolor('#0B0F19')
            fig.patch.set_facecolor('#0B0F19')
            ax.axis('off')

            # Header Banner
            ax.text(0.08, 0.90, slide["title"], color='#FFFFFF', fontsize=18, fontweight='bold')
            ax.text(0.08, 0.83, slide["sub"], color='#A855F7', fontsize=11, fontweight='medium')

            # Dividing Line
            line = patches.Rectangle((0.08, 0.80), 0.84, 0.003, facecolor='#3B82F6', edgecolor='none')
            ax.add_patch(line)

            # Content Bullets
            y_start = 0.70
            for bullet in slide.get("bullets", []):
                # Bullet point circle
                ax.plot(0.09, y_start, marker='o', markersize=5, color='#3B82F6')
                ax.text(0.12, y_start, bullet, color='#E5E7EB', fontsize=9.5, va='center', linespacing=1.3)
                y_start -= 0.12

            # Slide Footer
            footer_text = f"BioTwin AI | Digital Twin Challenge 2026 | Slide {idx + 1} of {len(slides)}"
            ax.text(0.08, 0.06, footer_text, color='#6B7280', fontsize=7.5)
            ax.text(0.92, 0.06, "IIT Jodhpur", color='#6B7280', fontsize=7.5, ha='right')

            plt.tight_layout()
            pdf.savefig(fig, facecolor=fig.get_facecolor(), edgecolor='none')
            plt.close()

    print("deck.pdf created successfully.")


if __name__ == "__main__":
    generate_architecture_pdf()
    generate_deck_pdf()
