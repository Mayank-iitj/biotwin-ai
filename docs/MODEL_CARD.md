# Model Card: T2D Excursion Fusion Model

## Model Details
- **Architecture:** XGBoost Classifier calibrated with Isotonic Regression.
- **Task:** Predict hyperglycemic excursions (glucose > 180 mg/dL) within the next 120 minutes.
- **Inputs:** 
  - Dynamic (CGM + Wearables): 15/30/60m deltas, 6h rolling stats, HR, HRV, Steps, Meal Carbs.
  - Static (EHR): Age, BMI, HbA1c, Fasting Glucose, Polygenic Risk Score, Family History, Region, Diet.
- **Output (Primary):** Probability [0, 1] mapped to risk tiers (Low, Moderate, High) calibrated to target an 85% recall for the High tier.
- **Output (Secondary):** Quantile forecaster (LightGBM) predicting glucose at +30, +60, +90, +120 mins (10th, 50th, 90th percentiles).

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

## Leakage Audit
- **Time splits:** Checked to ensure no future time leakage in rolling windows (using `shift(-24)` carefully with `max()`).
- **Patient splits:** Used `np.random.shuffle(unique_patients)` ensuring strict separation of patients between Train, Val, and Test. No single patient's data spans multiple splits.
- **Artifacts:** Verified targets are stripped prior to inference in all loops.
