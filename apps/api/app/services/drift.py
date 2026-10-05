from typing import Dict, Any

class DriftMonitor:
    def __init__(self):
        self.is_drift_injected = False
        
    def inject_drift(self, status: bool):
        self.is_drift_injected = status
        
    def get_metrics(self) -> Dict[str, Any]:
        """
        Compute drift statistics. 
        Returns mocked metrics for the challenge demo.
        """
        # Baseline metrics
        metrics = {
            "glucose_psi": 0.05, # < 0.1 is OK
            "hr_psi": 0.02,
            "missingness": 0.01,
            "calibration_ece": 0.04,
            "brier_score": 0.12,
            "alert_rate_per_day": 2.1
        }
        
        if self.is_drift_injected:
            # Simulate sensor bias / population drift
            metrics["glucose_psi"] = 0.25 # > 0.2 is Drift
            metrics["calibration_ece"] = 0.15
            metrics["alert_rate_per_day"] = 5.8
            metrics["status"] = "Drift"
            metrics["status_color"] = "red"
        else:
            metrics["status"] = "OK"
            metrics["status_color"] = "green"
            
        return metrics

drift_monitor = DriftMonitor()
