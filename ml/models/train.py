import os
import pandas as pd
import numpy as np
import xgboost as xgb
import lightgbm as lgb
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, average_precision_score, precision_recall_curve
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
    
    print("Training XGBoost Fusion Model (Primary)...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1,
        eval_metric='logloss', use_label_encoder=False, random_state=42
    )
    xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=10)
    
    print("Calibrating Fusion Model...")
    calibrated_xgb = CalibratedClassifierCV(xgb_model, method='isotonic', cv=2)
    calibrated_xgb.fit(X_train, y_train)
    joblib.dump(calibrated_xgb, os.path.join(ARTIFACTS_DIR, 'fusion_model.pkl'))
    
    # Calculate Thresholds for Risk Tiers (85% recall for high tier)
    y_val_probs = calibrated_xgb.predict_proba(X_val)[:, 1]
    precision, recall, thresholds = precision_recall_curve(y_val, y_val_probs)
    
    # Find threshold where recall is closest to 0.85
    idx_85 = np.argmin(np.abs(recall - 0.85))
    high_tier_threshold = float(thresholds[idx_85] if idx_85 < len(thresholds) else 0.5)
    
    # Moderate tier at 0.95 recall
    idx_95 = np.argmin(np.abs(recall - 0.95))
    mod_tier_threshold = float(thresholds[idx_95] if idx_95 < len(thresholds) else 0.3)
    
    print(f"High tier threshold: {high_tier_threshold:.4f}, Moderate: {mod_tier_threshold:.4f}")
    
    print("Training Hypo60 Classifier...")
    xgb_hypo = xgb.XGBClassifier(n_estimators=50, max_depth=3, random_state=42)
    xgb_hypo.fit(X_train, train_df['y_hypo_60'])
    joblib.dump(xgb_hypo, os.path.join(ARTIFACTS_DIR, 'hypo_model.pkl'))
    
    print("Training Quantile Forecaster (+30, +60, +90, +120)...")
    horizons = ['g_plus_30', 'g_plus_60', 'g_plus_90', 'g_plus_120']
    quantiles = [0.1, 0.5, 0.9]
    quantile_models = {}
    
    for h in horizons:
        quantile_models[h] = {}
        # Drop rows where target is 0 or NA (from padding)
        train_h = train_df[train_df[h] > 0]
        for q in quantiles:
            print(f"  Training {h} at q={q}")
            model = lgb.LGBMRegressor(objective='quantile', alpha=q, n_estimators=50, random_state=42, n_jobs=-1)
            model.fit(train_h[features], train_h[h])
            quantile_models[h][str(q)] = model
            
    joblib.dump(quantile_models, os.path.join(ARTIFACTS_DIR, 'quantile_models.pkl'))
    
    with open(os.path.join(ARTIFACTS_DIR, 'features.json'), 'w') as f:
        json.dump({
            'dynamic': dynamic_features, 
            'static': static_features, 
            'all': features,
            'thresholds': {
                'high': high_tier_threshold,
                'moderate': mod_tier_threshold
            }
        }, f)
        
    print("Training complete.")

if __name__ == "__main__":
    main()
