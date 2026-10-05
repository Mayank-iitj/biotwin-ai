from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class SensorReading(Base):
    __tablename__ = 'sensor_readings'
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String, index=True)
    ts = Column(DateTime, default=datetime.utcnow)
    sim_ts = Column(DateTime, index=True)
    glucose = Column(Float)
    hr = Column(Float)
    hrv = Column(Float)
    steps = Column(Integer)
    sleep_stage = Column(String)
    meal_carbs = Column(Float, default=0.0)

class PredictionLog(Base):
    __tablename__ = 'prediction_logs'
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String, index=True)
    sim_ts = Column(DateTime, index=True)
    prob_hyper_120 = Column(Float)
    prob_hypo_60 = Column(Float)
    tier = Column(String) # low, moderate, high
    quantiles = Column(JSON) # Store dict of future horizons and their quantiles
    top_drivers = Column(JSON) # Top SHAP features

class Alert(Base):
    __tablename__ = 'alerts'
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    sim_ts = Column(DateTime)
    alert_type = Column(String) # hyper_120, hypo_60
    status = Column(String, default='new') # new, acknowledged, acting, resolved, dismissed, expired
    tier = Column(String)
    dismiss_reason = Column(String, nullable=True)
    acting_notes = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
