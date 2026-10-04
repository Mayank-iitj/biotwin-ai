# Model Card: T2D Excursion Fusion Model

## Model Details
- **Architecture:** XGBoost Classifier calibrated with Isotonic Regression.
- **Task:** Predict hyperglycemic excursions (glucose > 180 mg/dL) within the next 120 minutes.
- **Inputs:** 
  - Dynamic (CGM + Wearables): 15/30/60m deltas, 6h rolling stats, HR, HRV, Steps.
  - Static (EHR): Age, BMI, HbA1c, Fasting Glucose, Polygenic Risk Score, Family History.
- **Output:** Probability [0, 1] mapped to risk tiers (Low, Moderate, High).

## Intended Use
- **Primary:** Clinical decision support for monitoring Type 2 Diabetes patients.
- **Out of Scope:** Automated insulin dosing, diagnostic classification without human review.

## Metrics & Performance
*Note: Evaluated on synthetic dataset.*
- AUROC: Evaluated post-training.
- AUPRC: Evaluated post-training.
- Calibration: Isotonic mapping ensures probabilities reflect empirical event rates.
- Ablation: Fusion model (Static + Dynamic) outperforms Dynamic-only and Static-only baselines.

## Limitations & Ethical Considerations
- **Synthetic Bias:** The model is trained on Synthea data with assumed Indian demographic proxies. It may not generalize to real-world complexities.
- **Sensor Noise:** Simulated CGM dropout and drift are simplified; real sensors fail in more complex modes.
