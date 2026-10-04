# DPDP Act 2023 Compliance & Privacy Statement

This document outlines the privacy design of BioTwin AI for the Digital Twin Challenge 2026.

## 1. Synthetic Data Declaration
**CRITICAL:** All data used in this project is 100% synthetic or anonymized. No real patient data is included, collected, or processed. 
- EHR data is generated using **Synthea**.
- CGM and Wearable time-series data is generated using a custom deterministic **Bergman Minimal Model simulator**.

## 2. DPDP Act 2023 Principles Applied (Architecture)

If this system were to process real data, it adheres to:
1. **Notice & Consent:** The patient app includes a consent flow prior to onboarding.
2. **Purpose Limitation:** Data is exclusively used for predicting adverse T2D events and generating the twin.
3. **Data Minimization:** We only process features strictly necessary for the T2D fusion model (see `DATA_CARD.md`).
4. **Right to Erasure & Export:** The platform provides a `POST /api/v1/privacy/export` endpoint.
5. **Accountability (Audit Logging):** All clinician access to patient profiles is logged via `GET /api/v1/audit` to prevent unauthorized snooping.

## 3. Breach Response Outline
In a production scenario, all secrets are encrypted, CORS is locked, and PII is isolated from time-series storage. A breach response protocol mandates a 72-hour notification window to the Data Protection Board.
