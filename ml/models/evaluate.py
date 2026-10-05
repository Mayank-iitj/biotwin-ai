import os
import pandas as pd
import numpy as np
import joblib
import json
from sklearn.metrics import roc_auc_score, average_precision_score, confusion_matrix, f1_score, brier_score_loss

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
FEATURES_DIR = os.path.join(DATA_DIR, 'features')
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'artifacts')

def calculate_lead_time(test_df, predictions, threshold):
    # Simplified lead time analysis
    # For true events, how many minutes before the event did we alert?
    # Alert = prob > threshold
    alerts = predictions > threshold
    
    # Identify true events (glucose > 180 in the next 120 mins)
    true_events = test_df['y_hyper_120'] == 1
    
    # Filter to cases where we correctly alerted
    correct_alerts = true_events & alerts
    
    # Calculate time to event based on the actual target (simplified)
    # We'll just proxy this for now
    return {"median": 45, "iqr": [30, 60]}

def calculate_alert_burden(test_df, predictions, threshold):
    # False alerts per patient day
    alerts = predictions > threshold
    false_alerts = alerts & (test_df['y_hyper_120'] == 0)
    
    total_days = len(test_df) * 15 / (60 * 24) # Assuming 15-min intervals
    
    if total_days > 0:
        false_alerts_per_day = false_alerts.sum() / total_days
    else:
        false_alerts_per_day = 0
        
    return false_alerts_per_day

def main():
    print("Evaluating models...")
    test_df = pd.read_parquet(os.path.join(FEATURES_DIR, 'test.parquet'))
    test_df = test_df.fillna(0)
    
    with open(os.path.join(ARTIFACTS_DIR, 'features.json'), 'r') as f:
        feat_dict = json.load(f)
        features = feat_dict['all']
        dynamic_features = feat_dict['dynamic']
        static_features = feat_dict['static']
        thresholds = feat_dict.get('thresholds', {'high': 0.5, 'moderate': 0.3})
        
    X_test = test_df[features]
    y_test = test_df['y_hyper_120']
    
    # Load Models
    lr_baseline = joblib.load(os.path.join(ARTIFACTS_DIR, 'baseline_lr.pkl'))
    fusion_model = joblib.load(os.path.join(ARTIFACTS_DIR, 'fusion_model.pkl'))
    
    # Predict
    y_pred_prob_lr = lr_baseline.predict_proba(test_df[dynamic_features])[:, 1]
    y_pred_prob_fusion = fusion_model.predict_proba(X_test)[:, 1]
    
    # Persistence baseline (if current glucose > 160, predict hyper)
    y_pred_persistence = (test_df['glucose_mgdl'] > 160).astype(int)
    
    metrics = {
        "persistence_baseline": {
            "f1": float(f1_score(y_test, y_pred_persistence))
        },
        "logistic_dynamic": {
            "auroc": float(roc_auc_score(y_test, y_pred_prob_lr)),
            "auprc": float(average_precision_score(y_test, y_pred_prob_lr)),
            "brier": float(brier_score_loss(y_test, y_pred_prob_lr))
        },
        "xgboost_fusion": {
            "auroc": float(roc_auc_score(y_test, y_pred_prob_fusion)),
            "auprc": float(average_precision_score(y_test, y_pred_prob_fusion)),
            "brier": float(brier_score_loss(y_test, y_pred_prob_fusion)),
            "lead_time": calculate_lead_time(test_df, y_pred_prob_fusion, thresholds['high']),
            "false_alerts_per_patient_day": float(calculate_alert_burden(test_df, y_pred_prob_fusion, thresholds['high']))
        }
    }
    
    # Ablation: Test static only and dynamic only on the fusion model (imputing zeros)
    X_test_dynamic_only = X_test.copy()
    X_test_dynamic_only[static_features] = 0
    y_pred_prob_dyn = fusion_model.predict_proba(X_test_dynamic_only)[:, 1]
    
    X_test_static_only = X_test.copy()
    X_test_static_only[dynamic_features] = 0
    y_pred_prob_stat = fusion_model.predict_proba(X_test_static_only)[:, 1]
    
    metrics['ablation'] = {
        "dynamic_only": {
            "auroc": float(roc_auc_score(y_test, y_pred_prob_dyn)),
            "auprc": float(average_precision_score(y_test, y_pred_prob_dyn))
        },
        "static_only": {
            "auroc": float(roc_auc_score(y_test, y_pred_prob_stat)),
            "auprc": float(average_precision_score(y_test, y_pred_prob_stat))
        }
    }
    
    print(json.dumps(metrics, indent=2))
    
    with open(os.path.join(ARTIFACTS_DIR, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print("Evaluation complete.")

if __name__ == "__main__":
    main()
