import fitbitData from './fitbit-data-merged.json'

// Map real Fitbit data to the format expected by the charts
export const historicalHealthData = fitbitData.map(stat => ({
  month: stat.date.substring(5), // e.g., "03-12"
  heartRate: stat.heart_rate_avg,
  bloodPressure: 118, // Normal baseline BP
  sleep: stat.sleep_hours,
  activity: Math.min(Math.round((stat.active_minutes / 300) * 100), 100), // Normalize active minutes to a score of 100
  steps: stat.steps,
  calories: stat.calories,
  weight: stat.weight_kg,
}))

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

export const recentActivities = fitbitData.slice(-10).reverse().map((stat, idx) => {
  let action = `Logged ${stat.steps.toLocaleString()} steps`
  let icon = 'activity'
  
  if (stat.sleep_hours > 0 && idx % 3 === 1) {
    action = `Slept for ${stat.sleep_hours} hours`
    icon = 'moon'
  } else if (stat.calories > 3200 && idx % 3 === 2) {
    action = `Burned ${stat.calories.toLocaleString()} kcal`
    icon = 'trending'
  }

  return {
    id: idx + 1,
    action,
    date: stat.date,
    icon,
  }
})
