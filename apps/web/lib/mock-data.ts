export const historicalHealthData = [
  { month: 'Jan', heartRate: 72, bloodPressure: 120, sleep: 7.2, activity: 65 },
  { month: 'Feb', heartRate: 74, bloodPressure: 122, sleep: 6.8, activity: 50 },
  { month: 'Mar', heartRate: 70, bloodPressure: 118, sleep: 7.5, activity: 80 },
  { month: 'Apr', heartRate: 68, bloodPressure: 115, sleep: 8.0, activity: 90 },
  { month: 'May', heartRate: 65, bloodPressure: 112, sleep: 8.2, activity: 95 },
  { month: 'Jun', heartRate: 66, bloodPressure: 114, sleep: 7.9, activity: 85 },
]

export const biomarkerData = [
  { name: 'Cholesterol (LDL)', value: 110, target: 100, unit: 'mg/dL', status: 'elevated' },
  { name: 'Blood Glucose', value: 95, target: 100, unit: 'mg/dL', status: 'optimal' },
  { name: 'HbA1c', value: 5.2, target: 5.7, unit: '%', status: 'optimal' },
  { name: 'Triglycerides', value: 140, target: 150, unit: 'mg/dL', status: 'optimal' },
  { name: 'CRP (Inflammation)', value: 2.1, target: 1.0, unit: 'mg/L', status: 'elevated' },
]

export const riskDistribution = [
  { name: 'Low Risk', value: 60, fill: '#22c55e' },
  { name: 'Moderate Risk', value: 30, fill: '#eab308' },
  { name: 'High Risk', value: 10, fill: '#ef4444' },
]

export const recentActivities = [
  { id: 1, action: 'Uploaded Blood Report', date: '2 days ago', icon: 'file' },
  { id: 2, action: 'Completed 10k steps', date: 'Yesterday', icon: 'activity' },
  { id: 3, action: 'Simulated Mediterranean Diet', date: 'Today', icon: 'trending' },
]
