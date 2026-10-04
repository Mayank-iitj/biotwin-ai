# Data Card

## Provenance
- **Static EHR:** Generated via Synthea (v3.2.0) using the Type 2 Diabetes module.
- **Dynamic Series:** Generated via custom ODE simulator based on the Bergman Minimal Model.

## Post-Processing
- **Indian Demographics:** Attributes like diet (vegetarian/non-vegetarian) are assigned.
- **Genetic Markers:** A synthetic continuous Polygenic Risk Score (PRS) is sampled and correlated with disease status.
- **Labels:** 15-minute sliding windows are used to label the subsequent 120-minute target (glucose > 180).

## Leakage Prevention
- Splitting is performed strictly **by patient ID** (70/15/15 split). No temporal leakage across train/test boundaries.
