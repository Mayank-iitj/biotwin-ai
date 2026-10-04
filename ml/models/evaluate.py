import os
import pandas as pd
import numpy as np
import joblib
import json
from sklearn.metrics import roc_auc_score, average_precision_score, confusion_matrix, f1_score, brier_score_loss

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
FEATURES_DIR = os.path.join(DATA_DIR, 'features')
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'artifacts')

def main():
    print("Evaluating models...")
    test_df = pd.read_parquet(os.path.join(FEATURES_DIR, 'test.parquet'))
    test_df = test_df.fillna(0)
    
    with open(os.path.join(ARTIFACTS_DIR, 'features.json'), 'r') as f:
        feat_dict = json.load(f)
        features = feat_dict['all']
        dynamic_features = feat_dict['dynamic']
        
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
            "f1": f1_score(y_test, y_pred_persistence)
        },
        "logistic_dynamic": {
            "auroc": roc_auc_score(y_test, y_pred_prob_lr),
            "auprc": average_precision_score(y_test, y_pred_prob_lr),
            "brier": brier_score_loss(y_test, y_pred_prob_lr)
        },
        "xgboost_fusion": {
            "auroc": roc_auc_score(y_test, y_pred_prob_fusion),
            "auprc": average_precision_score(y_test, y_pred_prob_fusion),
            "brier": brier_score_loss(y_test, y_pred_prob_fusion)
        }
    }
    
    print(json.dumps(metrics, indent=2))
    
    with open(os.path.join(ARTIFACTS_DIR, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print("Evaluation complete.")

if __name__ == "__main__":
    main()
