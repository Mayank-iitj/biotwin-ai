import os
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, average_precision_score
import joblib
import json

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
FEATURES_DIR = os.path.join(DATA_DIR, 'features')
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'artifacts')

os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def load_data():
    train_df = pd.read_parquet(os.path.join(FEATURES_DIR, 'train.parquet'))
    val_df = pd.read_parquet(os.path.join(FEATURES_DIR, 'val.parquet'))
    return train_df, val_df

def main():
    print("Loading datasets...")
    train_df, val_df = load_data()
    
    # Fill NAs
    train_df = train_df.fillna(0)
    val_df = val_df.fillna(0)
    
    dynamic_features = [
        'glucose_mgdl', 'heart_rate', 'hrv_rmssd', 'steps',
        'glucose_mean_6h', 'glucose_std_6h', 'glucose_min_6h', 'glucose_max_6h',
        'tir_6h', 'tar_6h', 'glucose_15m_delta', 'glucose_30m_delta', 'glucose_60m_delta',
        'hr_mean_6h', 'hrv_mean_6h', 'steps_1h', 'steps_6h', 'meal_carbs'
    ]
    
    static_features = [
        'age', 'has_t2d', 'bmi', 'hba1c', 'fasting_glucose', 
        'polygenic_risk_score', 'family_history_t2d'
    ]
    
    features = dynamic_features + static_features
    target = 'y_hyper_120'
    
    X_train = train_df[features]
    y_train = train_df[target]
    
    X_val = val_df[features]
    y_val = val_df[target]
    
    print("Training Logistic Regression Baseline (Dynamic Only)...")
    lr = LogisticRegression(max_iter=1000)
    lr.fit(X_train[dynamic_features], y_train)
    joblib.dump(lr, os.path.join(ARTIFACTS_DIR, 'baseline_lr.pkl'))
    
    print("Training XGBoost Fusion Model...")
    # Small Optuna could go here, but for brevity we use sensible defaults
    # that converge fast and perform well on tabular data
    xgb_model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        eval_metric='logloss',
        use_label_encoder=False,
        random_state=42
    )
    
    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=10
    )
    
    print("Calibrating Fusion Model...")
    calibrated_xgb = CalibratedClassifierCV(xgb_model, method='isotonic', cv=2)
    calibrated_xgb.fit(X_train, y_train)
    
    joblib.dump(calibrated_xgb, os.path.join(ARTIFACTS_DIR, 'fusion_model.pkl'))
    
    # Save feature lists for inference
    with open(os.path.join(ARTIFACTS_DIR, 'features.json'), 'w') as f:
        json.dump({'dynamic': dynamic_features, 'static': static_features, 'all': features}, f)
        
    print("Training complete.")

if __name__ == "__main__":
    main()
