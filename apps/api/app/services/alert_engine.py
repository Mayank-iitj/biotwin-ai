from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class AlertEngine:
    def __init__(self):
        # patient_id -> list of active alerts
        self.active_alerts = {}
        # patient_id -> last alert time (for refractory period)
        self.last_alert_time = {}
        # Configuration
        self.max_daily_alerts = 6
        self.refractory_mins = 60
        self.daily_alert_counts = {} # patient_id -> {date: count}

    def process_prediction(self, patient_id: str, ts: datetime, prediction: dict) -> Optional[dict]:
        tier = prediction.get('tier', 'low')
        prob_hypo = prediction.get('prob_hypo_60', 0)
        prob_hyper = prediction.get('prob_hyper_120', 0)
        
        alert_type = None
        if prob_hypo > 0.5:
            alert_type = 'hypo_60'
        elif tier == 'high':
            alert_type = 'hyper_120'
            
        if not alert_type:
            return None
            
        from datetime import datetime
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        
        date_str = ts.strftime('%Y-%m-%d')
        
        # Check refractory period
        if patient_id in self.last_alert_time:
            last_time = self.last_alert_time[patient_id]
            if (ts - last_time).total_seconds() < self.refractory_mins * 60:
                # Still in refractory period, suppress unless it's a hypo and previous wasn't
                return None
                
        # Check daily cap (hypo bypasses cap)
        if alert_type != 'hypo_60':
            daily_counts = self.daily_alert_counts.get(patient_id, {})
            count = daily_counts.get(date_str, 0)
            if count >= self.max_daily_alerts:
                return None
                
            daily_counts[date_str] = count + 1
            self.daily_alert_counts[patient_id] = daily_counts
            
        self.last_alert_time[patient_id] = ts
        
        alert_data = {
            'patient_id': patient_id,
            'sim_ts': ts.isoformat(),
            'alert_type': alert_type,
            'status': 'new',
            'tier': tier,
            'probability': prob_hyper if alert_type == 'hyper_120' else prob_hypo
        }
        
        return alert_data

alert_engine = AlertEngine()
