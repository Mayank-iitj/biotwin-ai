// BioTwin AI — Disease Impact Data Layer
// Comprehensive structured data for disease impact visualization

export interface BodyZone {
  id: string
  label: string
  cx: number  // SVG x center (0-200 viewBox)
  cy: number  // SVG y center (0-500 viewBox)
  r: number   // radius of hotspot
  severity: 'mild' | 'moderate' | 'severe'
  description: string
}

export interface Symptom {
  name: string
  description: string
  severity: 'mild' | 'moderate' | 'severe'
  icon: string // emoji
}

export interface ProgressionStage {
  stage: 'early' | 'developing' | 'advanced' | 'severe'
  label: string
  timeframe: string
  description: string
  symptoms: string[]
  reversible: boolean
  riskRange: [number, number] // 0-100
}

export interface Treatment {
  category: 'lifestyle' | 'medical' | 'dietary' | 'monitoring'
  title: string
  description: string
  icon: string
  effectiveness: 'proven' | 'recommended' | 'supportive'
}

export interface Precaution {
  type: 'do' | 'dont'
  text: string
  icon: string
}

export interface DiseaseData {
  id: string
  name: string
  fullName: string
  tagline: string
  color: string          // primary color hex
  gradientFrom: string   // tailwind class
  gradientTo: string
  glowColor: string      // rgba for CSS glow
  affectedBodyZones: BodyZone[]
  externalSymptoms: Symptom[]  // visible on body / outer signs
  internalSymptoms: Symptom[]  // organ-level damage
  progressionStages: ProgressionStage[]
  treatments: Treatment[]
  precautions: Precaution[]
  emergencySigns: string[]
  recoveryOutlook: {
    withIntervention: string
    withoutIntervention: string
    keyFact: string
  }
  quickStats: { label: string; value: string }[]
}

// ─────────────────────────────────────────────
// DIABETES (Type 2)
// ─────────────────────────────────────────────
const diabetes: DiseaseData = {
  id: 'diabetes',
  name: 'Diabetes',
  fullName: 'Type 2 Diabetes Mellitus',
  tagline: 'A chronic condition disrupting how your body processes blood sugar',
  color: '#f59e0b',
  gradientFrom: 'from-amber-500',
  gradientTo: 'to-orange-600',
  glowColor: 'rgba(245,158,11,0.4)',
  affectedBodyZones: [
    { id: 'pancreas', label: 'Pancreas', cx: 108, cy: 205, r: 12, severity: 'severe', description: 'Insulin-producing beta cells become exhausted or destroyed, causing insulin deficiency.' },
    { id: 'eyes', label: 'Eyes', cx: 90, cy: 55, r: 8, severity: 'moderate', description: 'High blood sugar damages tiny blood vessels in the retina (diabetic retinopathy), risking blindness.' },
    { id: 'kidneys', label: 'Kidneys', cx: 78, cy: 235, r: 10, severity: 'moderate', description: 'Nephropathy — excess glucose damages the kidney\'s filtration system over years.' },
    { id: 'feet', label: 'Feet & Nerves', cx: 80, cy: 470, r: 10, severity: 'moderate', description: 'Peripheral neuropathy causes numbness, tingling, and poor wound healing in feet.' },
    { id: 'heart', label: 'Heart', cx: 93, cy: 155, r: 10, severity: 'moderate', description: 'Elevated glucose damages blood vessels, doubling the risk of cardiovascular disease.' },
  ],
  externalSymptoms: [
    { name: 'Frequent Urination', description: 'Kidneys work overtime to filter excess blood sugar, causing you to urinate every 1-2 hours, including at night.', severity: 'moderate', icon: '🚿' },
    { name: 'Extreme Thirst', description: 'Fluid lost through frequent urination creates intense, unquenchable thirst throughout the day.', severity: 'moderate', icon: '💧' },
    { name: 'Blurred Vision', description: 'High glucose causes the eye lens to swell, leading to fluctuating or consistently blurred vision.', severity: 'moderate', icon: '👁️' },
    { name: 'Slow-Healing Wounds', description: 'Poor circulation and high sugar impairs the immune system, causing cuts and bruises to heal very slowly.', severity: 'severe', icon: '🩹' },
    { name: 'Dark Skin Patches', description: 'Acanthosis nigricans — velvety dark patches on neck, armpits, and groin from insulin resistance.', severity: 'mild', icon: '🟫' },
    { name: 'Unexplained Weight Loss', description: 'When cells can\'t use glucose for energy, the body breaks down fat and muscle instead.', severity: 'moderate', icon: '⚖️' },
    { name: 'Tingling in Hands/Feet', description: 'Nerve damage (neuropathy) causes pins-and-needles, burning, or numbness, usually starting in feet.', severity: 'moderate', icon: '⚡' },
  ],
  internalSymptoms: [
    { name: 'Beta Cell Exhaustion', description: 'Insulin-producing cells in the pancreas are chronically overworked until they fail to produce adequate insulin.', severity: 'severe', icon: '🔬' },
    { name: 'Insulin Resistance', description: 'Muscle, fat, and liver cells stop responding to insulin signals, forcing the pancreas to produce more.', severity: 'severe', icon: '🧬' },
    { name: 'Vascular Inflammation', description: 'Persistently high glucose triggers chronic low-grade inflammation in blood vessel walls throughout the body.', severity: 'moderate', icon: '🩸' },
    { name: 'Retinal Damage', description: 'Microaneurysms form in retinal capillaries; untreated this leads to bleeding, scarring, and eventual blindness.', severity: 'severe', icon: '👁️' },
    { name: 'Kidney Filtration Decline', description: 'Glomeruli (kidney filters) thicken and leak proteins into urine — a sign of progressive kidney damage.', severity: 'moderate', icon: '🫘' },
  ],
  progressionStages: [
    { stage: 'early', label: 'Prediabetes', timeframe: '1–5 years before diagnosis', description: 'Blood sugar is higher than normal but not yet diabetic range. Often zero symptoms. Fully reversible with lifestyle change.', symptoms: ['Mild fatigue after meals', 'Slightly elevated fasting glucose', 'Mild weight gain around belly'], reversible: true, riskRange: [0, 30] },
    { stage: 'developing', label: 'Early Diabetes', timeframe: 'First 2–5 years', description: 'Insulin resistance is established. Beta cells are struggling. Lifestyle + medication can still significantly slow progression.', symptoms: ['Increased thirst and urination', 'Fatigue', 'Blurred vision episodes', 'Slow wound healing'], reversible: true, riskRange: [30, 55] },
    { stage: 'advanced', label: 'Established Diabetes', timeframe: '5–15 years', description: 'Significant organ involvement begins. Eye, kidney, and nerve damage starts if blood sugar remains poorly controlled.', symptoms: ['Neuropathy in feet', 'Persistent blurry vision', 'Frequent infections', 'Kidney protein leakage'], reversible: false, riskRange: [55, 75] },
    { stage: 'severe', label: 'Diabetic Complications', timeframe: '15+ years', description: 'Multi-organ complications including retinopathy, nephropathy, heart disease, and limb-threatening ulcers.', symptoms: ['Vision loss', 'Kidney failure (dialysis)', 'Foot ulcers/amputation risk', 'Heart attack', 'Stroke'], reversible: false, riskRange: [75, 100] },
  ],
  treatments: [
    { category: 'lifestyle', title: 'Weight Loss (5–10%)', description: 'Even a 5–10% reduction in body weight can dramatically improve insulin sensitivity and sometimes reverse prediabetes.', icon: '🏃', effectiveness: 'proven' },
    { category: 'dietary', title: 'Low-Glycemic Diet', description: 'Prioritize whole grains, vegetables, legumes, and lean protein. Eliminate sugary drinks, refined carbs, and ultra-processed foods.', icon: '🥗', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Exercise 150 min/week', description: 'Aerobic exercise (walking, cycling, swimming) plus resistance training improves glucose uptake without insulin.', icon: '🚴', effectiveness: 'proven' },
    { category: 'medical', title: 'Metformin', description: 'First-line medication that reduces liver glucose production and improves insulin sensitivity. Safe and well-tolerated.', icon: '💊', effectiveness: 'proven' },
    { category: 'medical', title: 'GLP-1 Receptor Agonists', description: 'Semaglutide (Ozempic) and similar drugs reduce appetite, slow digestion, and lower blood sugar with proven cardiovascular benefits.', icon: '💉', effectiveness: 'proven' },
    { category: 'monitoring', title: 'Blood Sugar Monitoring', description: 'Regular HbA1c tests (every 3 months) and daily glucose checks help fine-tune treatment and catch complications early.', icon: '📊', effectiveness: 'proven' },
  ],
  precautions: [
    { type: 'do', text: 'Check your feet daily for cuts, blisters, or sores', icon: '✅' },
    { type: 'do', text: 'Eat meals at consistent times every day', icon: '✅' },
    { type: 'do', text: 'Get annual eye exams and kidney function tests', icon: '✅' },
    { type: 'do', text: 'Stay hydrated with water (not juice or soda)', icon: '✅' },
    { type: 'do', text: 'Sleep 7–9 hours — poor sleep raises blood sugar', icon: '✅' },
    { type: 'dont', text: 'Skip meals or fast aggressively without medical guidance', icon: '❌' },
    { type: 'dont', text: 'Smoke — it dramatically worsens vascular damage', icon: '❌' },
    { type: 'dont', text: 'Drink alcohol on an empty stomach', icon: '❌' },
    { type: 'dont', text: 'Go barefoot — even minor foot injuries can become serious', icon: '❌' },
    { type: 'dont', text: 'Ignore fluctuating blood sugar readings', icon: '❌' },
  ],
  emergencySigns: [
    'Blood sugar above 300 mg/dL or below 70 mg/dL',
    'Confusion, shaking, sweating (hypoglycemia)',
    'Fruity-smelling breath with vomiting (diabetic ketoacidosis)',
    'Chest pain or shortness of breath',
    'Foot wound that isn\'t healing or shows signs of infection',
  ],
  recoveryOutlook: {
    withIntervention: 'With early lifestyle changes and medication, most people with Type 2 diabetes can achieve near-normal blood sugar and prevent or delay serious complications for 20+ years.',
    withoutIntervention: 'Uncontrolled diabetes leads to blindness, kidney failure, amputations, and a 2–4× higher risk of heart disease and stroke within 10–20 years.',
    keyFact: '58% of Type 2 diabetes cases can be prevented or delayed with modest lifestyle changes — just 30 minutes of daily walking makes a measurable difference.',
  },
  quickStats: [
    { label: 'Global Prevalence', value: '537M people' },
    { label: 'Preventable', value: '~58% of cases' },
    { label: 'Key Risk Factor', value: 'Abdominal obesity' },
    { label: 'Reversal Window', value: 'Prediabetes stage' },
  ],
}

// ─────────────────────────────────────────────
// CARDIOVASCULAR DISEASE (CVD)
// ─────────────────────────────────────────────
const cvd: DiseaseData = {
  id: 'cvd',
  name: 'CVD',
  fullName: 'Cardiovascular Disease',
  tagline: 'Silent buildup in arteries that can lead to heart attack or stroke',
  color: '#ef4444',
  gradientFrom: 'from-red-500',
  gradientTo: 'to-rose-600',
  glowColor: 'rgba(239,68,68,0.4)',
  affectedBodyZones: [
    { id: 'heart', label: 'Heart', cx: 93, cy: 155, r: 14, severity: 'severe', description: 'Coronary artery disease restricts blood flow to the heart muscle, causing angina or heart attack.' },
    { id: 'arteries', label: 'Arteries', cx: 100, cy: 200, r: 10, severity: 'severe', description: 'Atherosclerosis — plaque buildup inside artery walls — hardens and narrows blood vessels throughout the body.' },
    { id: 'brain', label: 'Brain', cx: 100, cy: 58, r: 10, severity: 'moderate', description: 'Reduced blood flow to the brain increases stroke risk; small silent strokes can occur without obvious symptoms.' },
    { id: 'legs', label: 'Legs & Peripheral', cx: 90, cy: 420, r: 10, severity: 'mild', description: 'Peripheral artery disease causes pain and cramping in legs during walking (claudication).' },
  ],
  externalSymptoms: [
    { name: 'Chest Pain (Angina)', description: 'A tight, squeezing, or pressure feeling in the chest — especially during physical exertion or stress. May radiate to the left arm or jaw.', severity: 'severe', icon: '❤️' },
    { name: 'Shortness of Breath', description: 'The heart struggling to pump blood efficiently causes breathlessness during activities that were once easy.', severity: 'moderate', icon: '💨' },
    { name: 'Swollen Ankles & Feet', description: 'Heart failure causes fluid to back up into the legs, causing visible puffiness around the ankles and feet.', severity: 'moderate', icon: '🦶' },
    { name: 'Rapid or Irregular Heartbeat', description: 'Palpitations — sensing your heart skipping beats, fluttering, or pounding — can signal arrhythmia or heart strain.', severity: 'moderate', icon: '💓' },
    { name: 'Dizziness & Fainting', description: 'Reduced blood flow to the brain causes lightheadedness, near-fainting, or actual syncope (blackouts).', severity: 'moderate', icon: '😵' },
    { name: 'Pale or Bluish Skin', description: 'Poor circulation leads to pallor, or cyanosis (bluish tint) in lips and fingertips due to insufficient oxygen delivery.', severity: 'severe', icon: '💙' },
    { name: 'Jaw, Neck, or Back Pain', description: 'Cardiac pain can radiate far from the chest — including jaw, neck, upper back, or even just the left arm in women.', severity: 'severe', icon: '🦷' },
  ],
  internalSymptoms: [
    { name: 'Arterial Plaque Buildup', description: 'LDL cholesterol, calcium, and inflammatory cells deposit inside artery walls, progressively narrowing the lumen over decades.', severity: 'severe', icon: '🩸' },
    { name: 'Myocardial Ischemia', description: 'Reduced oxygen to heart muscle causes cellular stress, micro-damage, and eventually large-scale cell death during a heart attack.', severity: 'severe', icon: '❤️‍🔥' },
    { name: 'Ventricular Remodeling', description: 'The heart changes shape in response to chronic pressure overload — walls thicken, then weaken and dilate over years.', severity: 'severe', icon: '🔬' },
    { name: 'Endothelial Dysfunction', description: 'The inner lining of blood vessels loses its ability to regulate blood flow, promote healing, and prevent clotting.', severity: 'moderate', icon: '🧬' },
    { name: 'Electrical Conduction Disruption', description: 'Scarring and ischemia disrupt the heart\'s electrical pathways, causing dangerous arrhythmias like ventricular fibrillation.', severity: 'severe', icon: '⚡' },
  ],
  progressionStages: [
    { stage: 'early', label: 'Risk Factor Accumulation', timeframe: 'Teens–40s', description: 'Silent plaque begins forming in artery walls. No symptoms. High cholesterol, smoking, and inactivity are the main drivers.', symptoms: ['No symptoms (silent phase)', 'Elevated LDL cholesterol', 'High blood pressure', 'Mildly abnormal ECG'], reversible: true, riskRange: [0, 25] },
    { stage: 'developing', label: 'Coronary Artery Disease', timeframe: '40s–60s', description: 'Arteries are noticeably narrowed. Exercise triggers chest discomfort. Stress tests start showing abnormalities.', symptoms: ['Angina during exertion', 'Reduced exercise tolerance', 'Occasional palpitations'], reversible: true, riskRange: [25, 55] },
    { stage: 'advanced', label: 'Significant CAD / Heart Failure', timeframe: '50s–70s', description: 'Major blockages present. High imminent risk of heart attack. Heart may be showing signs of failure with reduced ejection fraction.', symptoms: ['Angina at rest', 'Breathlessness lying down', 'Swollen legs', 'Fatigue at minimal activity'], reversible: false, riskRange: [55, 80] },
    { stage: 'severe', label: 'Acute Event / End-Stage', timeframe: 'Any point', description: 'Heart attack, stroke, or sudden cardiac death. Survivors face chronic heart failure and severely reduced quality of life.', symptoms: ['Crushing chest pain', 'Stroke symptoms', 'Cardiac arrest', 'Severe breathlessness at rest'], reversible: false, riskRange: [80, 100] },
  ],
  treatments: [
    { category: 'lifestyle', title: 'Quit Smoking Immediately', description: 'Smoking cessation is the single most impactful intervention. Cardiovascular risk begins dropping within 24 hours of quitting.', icon: '🚭', effectiveness: 'proven' },
    { category: 'dietary', title: 'Mediterranean Diet', description: 'Olive oil, fish, vegetables, nuts, and whole grains. This diet has the strongest clinical evidence for reducing cardiovascular events.', icon: '🫒', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Aerobic Exercise (30 min/day)', description: 'Regular cardio strengthens the heart muscle, lowers blood pressure, raises HDL, and reduces inflammatory markers.', icon: '🏊', effectiveness: 'proven' },
    { category: 'medical', title: 'Statins (Cholesterol-Lowering)', description: 'Atorvastatin and rosuvastatin reduce LDL and plaque inflammation, cutting heart attack risk by 25–35%.', icon: '💊', effectiveness: 'proven' },
    { category: 'medical', title: 'Aspirin / Antiplatelet Therapy', description: 'Prevents blood clots from forming on existing plaques. Used in secondary prevention after a cardiac event.', icon: '💉', effectiveness: 'proven' },
    { category: 'medical', title: 'Beta-Blockers & ACE Inhibitors', description: 'Reduce heart workload, lower blood pressure, and protect the heart muscle after damage.', icon: '🫀', effectiveness: 'proven' },
  ],
  precautions: [
    { type: 'do', text: 'Know your numbers: blood pressure, LDL, HDL, triglycerides', icon: '✅' },
    { type: 'do', text: 'Keep blood pressure below 130/80 mmHg', icon: '✅' },
    { type: 'do', text: 'Manage stress — chronic cortisol directly harms arteries', icon: '✅' },
    { type: 'do', text: 'Limit saturated fats to <7% of daily calories', icon: '✅' },
    { type: 'do', text: 'Get 7–9 hours of sleep — poor sleep raises heart attack risk', icon: '✅' },
    { type: 'dont', text: 'Ignore chest pain or dismiss it as "just stress"', icon: '❌' },
    { type: 'dont', text: 'Consume more than 1 alcoholic drink/day (women) or 2 (men)', icon: '❌' },
    { type: 'dont', text: 'Eat more than 1,500 mg of sodium per day', icon: '❌' },
    { type: 'dont', text: 'Sit for more than 60 minutes without moving', icon: '❌' },
    { type: 'dont', text: 'Skip prescribed medications without consulting your doctor', icon: '❌' },
  ],
  emergencySigns: [
    'Sudden crushing or squeezing chest pain lasting > 15 minutes',
    'Pain spreading to left arm, jaw, neck, or back',
    'Sudden facial drooping, arm weakness, or slurred speech (stroke)',
    'Rapid heartbeat with dizziness or fainting',
    'Severe shortness of breath not relieved by rest',
  ],
  recoveryOutlook: {
    withIntervention: 'With aggressive lifestyle modification and medication, cardiovascular events can be delayed by 10–20 years. Post-heart attack, cardiac rehab improves survival by 25%.',
    withoutIntervention: 'Untreated CVD leads to progressive heart failure, repeated cardiac events, and an average 10-year reduction in lifespan.',
    keyFact: 'Heart disease kills 1 person every 33 seconds in the US. Yet 80% of premature cardiovascular deaths are preventable through lifestyle change.',
  },
  quickStats: [
    { label: 'Global Deaths/Year', value: '17.9 Million' },
    { label: 'Preventable', value: '~80%' },
    { label: 'Silent Years', value: '10–30 years' },
    { label: 'Key Warning', value: 'Often no symptoms' },
  ],
}

// ─────────────────────────────────────────────
// HYPERTENSION
// ─────────────────────────────────────────────
const hypertension: DiseaseData = {
  id: 'hypertension',
  name: 'Hypertension',
  fullName: 'Hypertension (High Blood Pressure)',
  tagline: 'The "silent killer" — damaging vessels for years before symptoms appear',
  color: '#8b5cf6',
  gradientFrom: 'from-violet-500',
  gradientTo: 'to-purple-600',
  glowColor: 'rgba(139,92,246,0.4)',
  affectedBodyZones: [
    { id: 'arteries', label: 'Arteries', cx: 100, cy: 200, r: 12, severity: 'severe', description: 'Chronic high pressure damages artery walls, causing them to thicken, harden, and narrow throughout the body.' },
    { id: 'heart', label: 'Heart', cx: 93, cy: 155, r: 12, severity: 'severe', description: 'The heart works harder to pump against high resistance — its left ventricle wall thickens (hypertrophy), eventually weakening.' },
    { id: 'kidneys', label: 'Kidneys', cx: 78, cy: 235, r: 10, severity: 'moderate', description: 'High pressure damages glomeruli, causing protein leakage and progressive decline in kidney function.' },
    { id: 'brain', label: 'Brain', cx: 100, cy: 58, r: 10, severity: 'severe', description: 'Weakened blood vessels in the brain risk rupture (hemorrhagic stroke) or blockage (ischemic stroke).' },
    { id: 'eyes', label: 'Eyes', cx: 90, cy: 55, r: 7, severity: 'moderate', description: 'Hypertensive retinopathy damages the delicate vessels in the retina, causing visual disturbances or loss.' },
  ],
  externalSymptoms: [
    { name: 'Often No Symptoms', description: 'The dangerous reality: hypertension typically causes zero noticeable symptoms until a crisis occurs. Regular measurement is the only way to know.', severity: 'severe', icon: '🔇' },
    { name: 'Severe Headaches', description: 'In hypertensive crisis (BP > 180/120), intense headaches at the back of the skull, often throbbing, may signal danger.', severity: 'severe', icon: '🤕' },
    { name: 'Nosebleeds', description: 'Frequent or hard-to-stop nosebleeds can occur in severe or uncontrolled hypertension due to fragile blood vessel walls.', severity: 'moderate', icon: '🩸' },
    { name: 'Visual Disturbances', description: 'Blurred or double vision, seeing spots, or temporary vision loss may occur when blood pressure spikes dramatically.', severity: 'severe', icon: '👁️' },
    { name: 'Facial Flushing', description: 'Redness in the face, especially after exertion or stress, from dilated facial blood vessels responding to pressure changes.', severity: 'mild', icon: '🔴' },
    { name: 'Shortness of Breath', description: 'As the heart strains against high resistance over years, it may begin to fail — causing breathlessness during normal activities.', severity: 'moderate', icon: '💨' },
  ],
  internalSymptoms: [
    { name: 'Arterial Wall Thickening', description: 'Years of excess pressure cause the artery\'s muscular middle layer to grow thicker, permanently reducing vessel flexibility.', severity: 'severe', icon: '🩸' },
    { name: 'Left Ventricular Hypertrophy', description: 'The heart\'s main pumping chamber thickens in response to resistance, but eventually this leads to stiffness and heart failure.', severity: 'severe', icon: '❤️' },
    { name: 'Microaneurysm Formation', description: 'Small bulges form in weakened artery walls throughout the brain and kidneys, which can rupture catastrophically.', severity: 'severe', icon: '🔬' },
    { name: 'Glomerular Damage', description: 'Pressure damages kidney filtering units, causing albumin to leak into urine — an early sign of hypertensive nephropathy.', severity: 'moderate', icon: '🫘' },
  ],
  progressionStages: [
    { stage: 'early', label: 'Elevated BP', timeframe: '120–129 / <80', description: 'Above normal but not yet hypertension. No organ damage yet. This is the ideal stage to intervene.', symptoms: ['No symptoms', 'Occasional headaches', 'Mild dizziness'], reversible: true, riskRange: [0, 25] },
    { stage: 'developing', label: 'Stage 1 Hypertension', timeframe: '130–139 / 80–89', description: 'Consistent elevated pressure begins to silently damage arteries and the heart.', symptoms: ['No obvious symptoms', 'Occasional palpitations', 'Mild shortness of breath during exertion'], reversible: true, riskRange: [25, 50] },
    { stage: 'advanced', label: 'Stage 2 Hypertension', timeframe: '≥140 / ≥90', description: 'Significant vascular damage. Heart, kidneys, and brain are all at risk. Medication is typically required.', symptoms: ['Headaches', 'Blurred vision', 'Fatigue', 'Chest discomfort'], reversible: false, riskRange: [50, 75] },
    { stage: 'severe', label: 'Hypertensive Crisis', timeframe: '≥180 / ≥120', description: 'Medical emergency. Risk of stroke, heart attack, aortic dissection, or kidney failure within hours.', symptoms: ['Severe headache', 'Vision changes', 'Chest pain', 'Stroke symptoms', 'Confusion'], reversible: false, riskRange: [75, 100] },
  ],
  treatments: [
    { category: 'lifestyle', title: 'DASH Diet', description: 'Dietary Approaches to Stop Hypertension: high in potassium, magnesium, calcium; low in sodium. Can lower BP by 8–14 mmHg.', icon: '🥦', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Reduce Sodium to <1,500 mg/day', description: 'Every 1g reduction in daily sodium lowers systolic BP by ~2 mmHg. Processed food is the #1 hidden source.', icon: '🧂', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Regular Aerobic Exercise', description: '30–60 minutes of moderate-intensity cardio 5 days a week can reduce systolic BP by 5–8 mmHg.', icon: '🏃', effectiveness: 'proven' },
    { category: 'medical', title: 'ACE Inhibitors / ARBs', description: 'Relax blood vessels and protect kidneys. First-line treatment especially in diabetics or people with kidney disease.', icon: '💊', effectiveness: 'proven' },
    { category: 'medical', title: 'Calcium Channel Blockers', description: 'Relax and widen arteries. Effective in older adults and those of African descent.', icon: '💉', effectiveness: 'proven' },
    { category: 'monitoring', title: 'Home BP Monitoring', description: 'Daily measurements at the same time each day. Target below 130/80 mmHg. Helps catch white-coat hypertension vs true HTN.', icon: '📊', effectiveness: 'proven' },
  ],
  precautions: [
    { type: 'do', text: 'Measure blood pressure twice daily — morning and evening', icon: '✅' },
    { type: 'do', text: 'Maintain a healthy weight (BMI 18.5–24.9)', icon: '✅' },
    { type: 'do', text: 'Limit caffeine — it temporarily raises blood pressure', icon: '✅' },
    { type: 'do', text: 'Practice daily stress reduction: meditation, deep breathing, yoga', icon: '✅' },
    { type: 'do', text: 'Increase potassium-rich foods: bananas, sweet potato, avocado', icon: '✅' },
    { type: 'dont', text: 'Use non-steroidal anti-inflammatories (ibuprofen) regularly', icon: '❌' },
    { type: 'dont', text: 'Eat processed, packaged, or fast food daily', icon: '❌' },
    { type: 'dont', text: 'Stop blood pressure medication abruptly', icon: '❌' },
    { type: 'dont', text: 'Ignore readings above 140/90 — even if you feel fine', icon: '❌' },
    { type: 'dont', text: 'Hold your breath during exercise (Valsalva maneuver)', icon: '❌' },
  ],
  emergencySigns: [
    'Blood pressure above 180/120 mmHg',
    'Sudden severe headache described as "worst of my life"',
    'Sudden vision changes or loss',
    'Chest pain or pressure',
    'Difficulty speaking, arm weakness, or facial drooping (stroke)',
  ],
  recoveryOutlook: {
    withIntervention: 'Treating hypertension reduces stroke risk by 35–40%, heart attack risk by 20–25%, and heart failure risk by 50%. Most people achieve target BP within weeks of starting treatment.',
    withoutIntervention: 'Sustained high blood pressure doubles the risk of heart failure, is responsible for 54% of strokes worldwide, and is the #1 preventable cause of premature death globally.',
    keyFact: 'Only 1 in 5 people with hypertension have it under control. The DASH diet alone can lower blood pressure as effectively as some medications.',
  },
  quickStats: [
    { label: 'Adults Affected', value: '1.28 Billion' },
    { label: 'Undiagnosed', value: '~46%' },
    { label: 'Nickname', value: 'Silent Killer' },
    { label: 'Target BP', value: '<130/80 mmHg' },
  ],
}

// ─────────────────────────────────────────────
// CHRONIC KIDNEY DISEASE (CKD)
// ─────────────────────────────────────────────
const ckd: DiseaseData = {
  id: 'ckd',
  name: 'CKD',
  fullName: 'Chronic Kidney Disease',
  tagline: 'Progressive loss of kidney function — often silent until advanced stages',
  color: '#06b6d4',
  gradientFrom: 'from-cyan-500',
  gradientTo: 'to-blue-600',
  glowColor: 'rgba(6,182,212,0.4)',
  affectedBodyZones: [
    { id: 'kidneys', label: 'Kidneys', cx: 78, cy: 235, r: 14, severity: 'severe', description: 'Progressive fibrosis and glomerular destruction reduces the kidneys\' ability to filter waste, balance fluids, and produce hormones.' },
    { id: 'heart', label: 'Heart', cx: 93, cy: 155, r: 10, severity: 'moderate', description: 'CKD dramatically accelerates cardiovascular disease — more CKD patients die of heart disease than kidney failure.' },
    { id: 'bones', label: 'Bones', cx: 100, cy: 300, r: 8, severity: 'moderate', description: 'Kidneys failing to activate Vitamin D and regulate phosphate leads to weak, brittle bones (renal osteodystrophy).' },
    { id: 'blood', label: 'Blood (Anemia)', cx: 100, cy: 175, r: 8, severity: 'moderate', description: 'Failing kidneys produce less erythropoietin — the hormone that triggers red blood cell production — causing severe anemia.' },
  ],
  externalSymptoms: [
    { name: 'Swelling in Legs & Face', description: 'Failing kidneys retain fluid, causing puffiness around the eyes in the morning and swelling in the legs and feet throughout the day.', severity: 'moderate', icon: '🫸' },
    { name: 'Foamy or Dark Urine', description: 'Protein leaking through damaged filters creates foamy urine. Dark or brown urine signals blood in the urine (hematuria).', severity: 'moderate', icon: '🚽' },
    { name: 'Severe Itching', description: 'Uremic toxins building up in the blood deposit in the skin, causing intense, persistent itching — one of the most distressing CKD symptoms.', severity: 'moderate', icon: '🔴' },
    { name: 'Extreme Fatigue', description: 'Anemia from reduced erythropoietin plus toxin buildup causes profound, debilitating tiredness that doesn\'t improve with rest.', severity: 'severe', icon: '😴' },
    { name: 'Metallic Taste & Ammonia Breath', description: 'Urea breakdown in saliva creates a distinctive ammonia or metallic taste and odor when kidney function falls below 15–20%.', severity: 'moderate', icon: '👄' },
    { name: 'Muscle Cramps', description: 'Electrolyte imbalances — especially low calcium and magnesium — cause painful muscle cramps, particularly at night.', severity: 'moderate', icon: '💪' },
  ],
  internalSymptoms: [
    { name: 'Glomerulosclerosis', description: 'Kidney filtering units scar over — once scarred, nephrons cannot regenerate. This permanent loss is why CKD is progressive.', severity: 'severe', icon: '🔬' },
    { name: 'Uremic Toxin Accumulation', description: 'Waste products (urea, creatinine, uric acid) build up in the blood, poisoning cells and organs throughout the body.', severity: 'severe', icon: '☠️' },
    { name: 'Anemia of CKD', description: 'Reduced erythropoietin production decreases red blood cell creation, reducing oxygen delivery to every organ.', severity: 'moderate', icon: '🩸' },
    { name: 'Metabolic Acidosis', description: 'Kidneys fail to excrete acids, causing blood pH to drop — this accelerates muscle wasting and bone loss.', severity: 'moderate', icon: '🧪' },
  ],
  progressionStages: [
    { stage: 'early', label: 'Stages 1–2 (Mild)', timeframe: 'GFR > 60', description: 'Kidney damage present but GFR is near-normal. Usually no symptoms. Identified by protein in urine or imaging.', symptoms: ['No symptoms', 'Mild protein in urine', 'Slightly elevated creatinine'], reversible: true, riskRange: [0, 25] },
    { stage: 'developing', label: 'Stage 3 (Moderate)', timeframe: 'GFR 30–59', description: 'Noticeable decline in kidney function. Anemia, blood pressure problems, and bone disease begin.', symptoms: ['Fatigue', 'Mild anemia', 'Swollen ankles', 'Elevated blood pressure'], reversible: false, riskRange: [25, 55] },
    { stage: 'advanced', label: 'Stage 4 (Severe)', timeframe: 'GFR 15–29', description: 'Significant kidney damage. Preparation for kidney replacement therapy (dialysis or transplant) begins.', symptoms: ['Severe fatigue', 'Loss of appetite', 'Nausea', 'Itching', 'Bone pain'], reversible: false, riskRange: [55, 80] },
    { stage: 'severe', label: 'Stage 5 (Kidney Failure)', timeframe: 'GFR < 15', description: 'End-stage renal disease. Kidneys can no longer sustain life without dialysis or transplantation.', symptoms: ['Severe uremic symptoms', 'Confusion', 'Difficulty breathing', 'Dangerous electrolyte levels'], reversible: false, riskRange: [80, 100] },
  ],
  treatments: [
    { category: 'medical', title: 'SGLT2 Inhibitors', description: 'Originally for diabetes, drugs like empagliflozin dramatically slow CKD progression regardless of diabetes status. A major breakthrough.', icon: '💊', effectiveness: 'proven' },
    { category: 'medical', title: 'ACE Inhibitors / ARBs', description: 'Reduce protein leakage and protect kidney filters. Essential in CKD caused by diabetes or hypertension.', icon: '💉', effectiveness: 'proven' },
    { category: 'dietary', title: 'Low-Protein, Low-Potassium Diet', description: 'Reducing protein intake slows the progression of CKD. A renal dietitian can design a personalized plan.', icon: '🥩', effectiveness: 'recommended' },
    { category: 'lifestyle', title: 'Tight Blood Pressure Control', description: 'Keeping BP below 130/80 is the most important modifiable factor in slowing CKD progression.', icon: '🫀', effectiveness: 'proven' },
    { category: 'medical', title: 'Erythropoiesis-Stimulating Agents', description: 'EPO injections stimulate red blood cell production, treating the anemia of CKD and improving energy levels.', icon: '🩸', effectiveness: 'proven' },
    { category: 'medical', title: 'Dialysis / Transplant', description: 'In Stage 5, hemodialysis (3×/week) or peritoneal dialysis replaces kidney function. A transplant offers the best quality of life.', icon: '🏥', effectiveness: 'proven' },
  ],
  precautions: [
    { type: 'do', text: 'Monitor GFR and creatinine levels every 3–6 months', icon: '✅' },
    { type: 'do', text: 'Control blood pressure and blood sugar diligently', icon: '✅' },
    { type: 'do', text: 'Stay hydrated — but follow fluid restriction if in Stage 4/5', icon: '✅' },
    { type: 'do', text: 'Work with a renal dietitian for personalized nutrition', icon: '✅' },
    { type: 'do', text: 'Avoid nephrotoxic substances: IV contrast dye, heavy metals', icon: '✅' },
    { type: 'dont', text: 'Take NSAIDs (ibuprofen, naproxen) — they damage kidneys', icon: '❌' },
    { type: 'dont', text: 'Use herbal supplements without checking for renal safety', icon: '❌' },
    { type: 'dont', text: 'Eat high-potassium foods (bananas, oranges) in later stages', icon: '❌' },
    { type: 'dont', text: 'Smoke — it doubles the rate of CKD progression', icon: '❌' },
    { type: 'dont', text: 'Delay getting urine and blood tested if at risk', icon: '❌' },
  ],
  emergencySigns: [
    'Urine output suddenly stops or becomes extremely low',
    'Dangerous potassium level (symptoms: muscle weakness, irregular heartbeat)',
    'Severe breathing difficulty (fluid in lungs)',
    'Confusion, drowsiness, or seizures (uremic encephalopathy)',
    'Chest pain with kidney disease history',
  ],
  recoveryOutlook: {
    withIntervention: 'With tight BP and blood sugar control, CKD progression can be slowed dramatically. Some patients remain at Stage 3 for decades. New SGLT2 inhibitors have reduced progression risk by up to 40%.',
    withoutIntervention: 'Untreated CKD progresses to kidney failure in 5–15 years. Dialysis is life-sustaining but severely impacts quality of life — 3 sessions per week, 4 hours each.',
    keyFact: 'The kidneys can lose up to 90% of their function before you feel seriously ill. Regular urine and blood tests are the only early warning system.',
  },
  quickStats: [
    { label: 'People Affected', value: '850 Million' },
    { label: 'Undiagnosed', value: '~90%' },
    { label: 'Dialysis Sessions', value: '3×/week' },
    { label: 'Silent Until', value: 'Stage 3–4' },
  ],
}

// ─────────────────────────────────────────────
// OBESITY
// ─────────────────────────────────────────────
const obesity: DiseaseData = {
  id: 'obesity',
  name: 'Obesity',
  fullName: 'Obesity & Metabolic Syndrome',
  tagline: 'Excess body fat that disrupts hormones, metabolism, and organ function',
  color: '#f97316',
  gradientFrom: 'from-orange-500',
  gradientTo: 'to-red-500',
  glowColor: 'rgba(249,115,22,0.4)',
  affectedBodyZones: [
    { id: 'liver', label: 'Liver', cx: 112, cy: 190, r: 12, severity: 'severe', description: 'Non-alcoholic fatty liver disease (NAFLD) — fat accumulates in liver cells, causing inflammation and fibrosis.' },
    { id: 'heart', label: 'Heart', cx: 93, cy: 155, r: 10, severity: 'severe', description: 'Excess weight raises blood pressure, increases LDL, and causes the heart to work harder — tripling CVD risk.' },
    { id: 'joints', label: 'Joints (Knees)', cx: 90, cy: 410, r: 10, severity: 'moderate', description: 'Each pound of excess weight adds 4 pounds of force on knee joints, accelerating cartilage destruction.' },
    { id: 'lungs', label: 'Lungs (Sleep Apnea)', cx: 80, cy: 155, r: 8, severity: 'moderate', description: 'Fat deposits around the airway collapse it during sleep, causing obstructive sleep apnea and oxygen deprivation.' },
    { id: 'hormones', label: 'Hormonal System', cx: 100, cy: 210, r: 10, severity: 'severe', description: 'Excess fat tissue acts as an endocrine organ, secreting inflammatory cytokines that disrupt insulin, leptin, and sex hormones.' },
  ],
  externalSymptoms: [
    { name: 'Breathlessness on Exertion', description: 'Excess weight increases the work of breathing and puts the cardiovascular system under constant strain, causing rapid breathlessness.', severity: 'moderate', icon: '💨' },
    { name: 'Chronic Joint Pain', description: 'Especially in knees, hips, and lower back — every 10 pounds of excess weight adds 40 pounds of force to weight-bearing joints.', severity: 'moderate', icon: '🦴' },
    { name: 'Snoring & Sleep Apnea', description: 'Fatty tissue narrows the upper airway, causing snoring and potentially complete airway collapse — waking the brain hundreds of times a night.', severity: 'moderate', icon: '😴' },
    { name: 'Sweating & Heat Intolerance', description: 'Increased metabolic rate and insulating body fat make temperature regulation difficult, causing excessive sweating in mild conditions.', severity: 'mild', icon: '💦' },
    { name: 'Skin Fold Infections', description: 'Warm, moist skin folds harbor bacteria and fungi, causing recurring fungal infections and rashes.', severity: 'mild', icon: '🔴' },
    { name: 'Acid Reflux (GERD)', description: 'Abdominal pressure from excess fat pushes stomach acid up into the esophagus, causing chronic heartburn.', severity: 'moderate', icon: '🔥' },
  ],
  internalSymptoms: [
    { name: 'Hepatic Steatosis (Fatty Liver)', description: 'Fat infiltrates liver cells, impairing detoxification, glucose processing, and fat metabolism — eventually causing cirrhosis.', severity: 'severe', icon: '🫀' },
    { name: 'Chronic Systemic Inflammation', description: 'Visceral fat secretes TNF-α, IL-6, and leptin — inflammatory molecules that damage blood vessels and promote insulin resistance body-wide.', severity: 'severe', icon: '🔥' },
    { name: 'Insulin Resistance', description: 'Excess fat — especially visceral abdominal fat — overwhelms insulin signaling pathways, eventually leading to Type 2 diabetes.', severity: 'severe', icon: '🧬' },
    { name: 'Dyslipidemia', description: 'Obesity characteristically raises triglycerides and LDL while lowering protective HDL — a perfect storm for arterial plaque buildup.', severity: 'moderate', icon: '🩸' },
  ],
  progressionStages: [
    { stage: 'early', label: 'Overweight (BMI 25–29.9)', timeframe: 'Any age', description: 'Metabolic risks begin rising. Visceral fat accumulates around organs even before it\'s visible externally.', symptoms: ['Mild fatigue', 'Slight breathlessness', 'Mild joint discomfort'], reversible: true, riskRange: [0, 30] },
    { stage: 'developing', label: 'Obesity Class I (BMI 30–34.9)', timeframe: '1–10 years', description: 'Significant metabolic disruption. Insulin resistance, hypertension, and fatty liver commonly present.', symptoms: ['Fatigue', 'Joint pain', 'Elevated blood pressure', 'Snoring'], reversible: true, riskRange: [30, 55] },
    { stage: 'advanced', label: 'Obesity Class II (BMI 35–39.9)', timeframe: '5–15 years', description: 'High risk of Type 2 diabetes, sleep apnea, and cardiovascular disease. Physical mobility becomes significantly impaired.', symptoms: ['Severe joint pain', 'Sleep apnea', 'Type 2 diabetes', 'Fatty liver disease'], reversible: false, riskRange: [55, 75] },
    { stage: 'severe', label: 'Obesity Class III (BMI ≥ 40)', timeframe: 'Long-term', description: 'Severe obesity — associated with 10+ years of reduced lifespan, multiple organ involvement, and significant disability.', symptoms: ['Heart failure', 'Kidney disease', 'Cirrhosis', 'Severe OSA', 'Limited mobility'], reversible: false, riskRange: [75, 100] },
  ],
  treatments: [
    { category: 'lifestyle', title: 'Caloric Deficit (500–750 kcal/day)', description: 'Sustainable 1–1.5 lb/week weight loss through a moderate caloric deficit. Crash diets cause muscle loss and rebound.', icon: '🥗', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Resistance Training', description: 'Building muscle mass increases resting metabolic rate. Even 2–3 sessions/week dramatically improves body composition.', icon: '🏋️', effectiveness: 'proven' },
    { category: 'medical', title: 'GLP-1 Agonists (Semaglutide)', description: 'Wegovy/Ozempic — the most effective medical weight loss tools available, achieving 15–20% weight reduction in clinical trials.', icon: '💉', effectiveness: 'proven' },
    { category: 'medical', title: 'Bariatric Surgery', description: 'For Class III obesity, gastric bypass or sleeve gastrectomy achieves 25–35% weight loss and often resolves diabetes.', icon: '🏥', effectiveness: 'proven' },
    { category: 'dietary', title: 'Whole Food Diet', description: 'Focus on protein, fiber, and whole foods. Protein (1.2–1.6g/kg) preserves muscle during weight loss and reduces hunger.', icon: '🍎', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Sleep Optimization', description: 'Poor sleep raises ghrelin (hunger hormone) by 24% and lowers leptin (fullness hormone). Getting 8 hours is critical for weight management.', icon: '🌙', effectiveness: 'recommended' },
  ],
  precautions: [
    { type: 'do', text: 'Track food intake — awareness alone reduces intake by 15–20%', icon: '✅' },
    { type: 'do', text: 'Prioritize protein (30g) at every meal to preserve muscle', icon: '✅' },
    { type: 'do', text: 'Walk 8,000–10,000 steps daily as baseline non-exercise activity', icon: '✅' },
    { type: 'do', text: 'Get screened for sleep apnea — it sabotages weight loss', icon: '✅' },
    { type: 'do', text: 'Manage stress — cortisol drives visceral fat accumulation', icon: '✅' },
    { type: 'dont', text: 'Pursue fad diets or extreme caloric restriction (<1,200 kcal)', icon: '❌' },
    { type: 'dont', text: 'Drink calories — sodas, juices, alcohol, specialty coffees', icon: '❌' },
    { type: 'dont', text: 'Skip breakfast — it leads to overeating later in the day', icon: '❌' },
    { type: 'dont', text: 'Rely on willpower alone — restructure your environment instead', icon: '❌' },
    { type: 'dont', text: 'Ignore comorbidities — treat sleep apnea, insulin resistance simultaneously', icon: '❌' },
  ],
  emergencySigns: [
    'Chest pain or pressure during routine activity',
    'Stopping breathing during sleep (witnessed by a partner)',
    'Sudden severe abdominal pain (can signal fatty liver crisis or gallstones)',
    'Leg pain, redness, or swelling (deep vein thrombosis risk is elevated)',
    'Blood sugar above 300 mg/dL',
  ],
  recoveryOutlook: {
    withIntervention: 'A 10% body weight reduction reduces diabetes risk by 58%, lowers blood pressure by 10 mmHg, reduces CVD risk by 20%, and eliminates sleep apnea in many patients.',
    withoutIntervention: 'Severe obesity reduces lifespan by 8–10 years on average, with exponentially increasing risk of diabetes, heart disease, cancers, and mobility disability.',
    keyFact: 'Weight loss of just 5–10% of body weight — even without reaching a "normal" BMI — produces dramatic metabolic improvements within weeks.',
  },
  quickStats: [
    { label: 'Adults Affected', value: '>1 Billion' },
    { label: 'Life Expectancy Loss', value: '8–10 years' },
    { label: 'BMI Threshold', value: '≥30 kg/m²' },
    { label: 'Key Organ', value: 'Visceral fat' },
  ],
}

// ─────────────────────────────────────────────
// STROKE
// ─────────────────────────────────────────────
const stroke: DiseaseData = {
  id: 'stroke',
  name: 'Stroke',
  fullName: 'Cerebrovascular Accident (Stroke)',
  tagline: 'A brain attack — every minute without treatment, 1.9 million neurons die',
  color: '#ec4899',
  gradientFrom: 'from-pink-500',
  gradientTo: 'to-fuchsia-600',
  glowColor: 'rgba(236,72,153,0.4)',
  affectedBodyZones: [
    { id: 'brain', label: 'Brain', cx: 100, cy: 58, r: 16, severity: 'severe', description: 'Blood supply to part of the brain is cut off — brain cells begin dying within minutes without oxygen.' },
    { id: 'arteries_brain', label: 'Cerebral Arteries', cx: 100, cy: 90, r: 8, severity: 'severe', description: 'Either a clot blocks a cerebral artery (ischemic) or a weakened artery bursts (hemorrhagic).' },
    { id: 'speech', label: 'Speech Center', cx: 88, cy: 65, r: 6, severity: 'moderate', description: 'Broca\'s area damage causes difficulty speaking; Wernicke\'s area damage causes difficulty understanding speech.' },
  ],
  externalSymptoms: [
    { name: 'Sudden Face Drooping', description: 'One side of the face suddenly droops or becomes numb. Ask the person to smile — one side won\'t move.', severity: 'severe', icon: '😕' },
    { name: 'Arm Weakness', description: 'Sudden weakness or numbness in one arm. Ask the person to raise both arms — one will drift downward.', severity: 'severe', icon: '💪' },
    { name: 'Speech Difficulty', description: 'Sudden slurred speech, inability to speak, or saying words that don\'t make sense.', severity: 'severe', icon: '🗣️' },
    { name: 'Vision Loss', description: 'Sudden blurred, doubled, or complete loss of vision in one or both eyes.', severity: 'severe', icon: '👁️' },
    { name: 'Sudden Severe Headache', description: 'The "thunderclap headache" — worst headache of your life, coming on in seconds. Classic sign of hemorrhagic stroke.', severity: 'severe', icon: '🤕' },
    { name: 'Loss of Balance', description: 'Sudden dizziness, loss of coordination, or inability to walk straight — especially combined with other symptoms.', severity: 'severe', icon: '🌀' },
  ],
  internalSymptoms: [
    { name: 'Neuronal Death', description: 'Without oxygen, brain neurons die at a rate of 1.9 million per minute — making "time is brain" literally true.', severity: 'severe', icon: '🧠' },
    { name: 'Cerebral Edema', description: 'After a stroke, the damaged area swells — this secondary swelling can be as dangerous as the initial injury.', severity: 'severe', icon: '🔬' },
    { name: 'Blood-Brain Barrier Breakdown', description: 'Stroke disrupts the protective barrier around brain blood vessels, allowing toxins and immune cells to flood brain tissue.', severity: 'severe', icon: '🧬' },
  ],
  progressionStages: [
    { stage: 'early', label: 'TIA (Mini-Stroke)', timeframe: 'Minutes to 24 hours', description: 'Transient ischemic attack — temporary symptoms that resolve within 24 hours. A major warning sign that full stroke is imminent.', symptoms: ['Brief vision loss', 'Temporary speech difficulty', 'Short arm or face weakness'], reversible: true, riskRange: [0, 40] },
    { stage: 'developing', label: 'Acute Stroke (0–4.5 hours)', timeframe: 'First 4.5 hours', description: 'The critical treatment window. IV tPA (clot-busting drug) must be given within 4.5 hours of symptom onset.', symptoms: ['Facial drooping', 'Arm weakness', 'Speech difficulty', 'Severe headache'], reversible: true, riskRange: [40, 65] },
    { stage: 'advanced', label: 'Established Stroke', timeframe: '24–72 hours', description: 'After the acute phase, brain swelling peaks and deficits become clearer. Intensive rehabilitation begins.', symptoms: ['Paralysis', 'Aphasia (speech loss)', 'Cognitive impairment', 'Dysphagia (swallowing difficulty)'], reversible: false, riskRange: [65, 85] },
    { stage: 'severe', label: 'Chronic Post-Stroke', timeframe: 'Weeks to years', description: 'Permanent deficits require long-term rehabilitation. Risk of depression, dementia, and recurrent stroke is high.', symptoms: ['Permanent weakness/paralysis', 'Ongoing speech difficulties', 'Memory and cognitive problems', 'Depression'], reversible: false, riskRange: [85, 100] },
  ],
  treatments: [
    { category: 'medical', title: 'IV tPA (Within 4.5 Hours)', description: 'Tissue plasminogen activator dissolves the clot. The single most effective treatment — but only works in the first 4.5 hours.', icon: '💉', effectiveness: 'proven' },
    { category: 'medical', title: 'Mechanical Thrombectomy', description: 'A catheter removes the clot directly from the brain artery. Effective up to 24 hours in selected patients.', icon: '🏥', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Stroke Rehabilitation', description: 'Intensive physical, occupational, and speech therapy exploits neuroplasticity to recover lost functions — starting within 24 hours.', icon: '🧠', effectiveness: 'proven' },
    { category: 'medical', title: 'Antiplatelet Therapy (Post-Stroke)', description: 'Aspirin + clopidogrel in the first 21 days after TIA or minor stroke cuts recurrence risk by 30–40%.', icon: '💊', effectiveness: 'proven' },
    { category: 'lifestyle', title: 'Control All Risk Factors', description: 'Aggressive management of hypertension, AFib, diabetes, and cholesterol after stroke reduces recurrence by 80%.', icon: '🛡️', effectiveness: 'proven' },
  ],
  precautions: [
    { type: 'do', text: 'Know the FAST signs (Face-Arm-Speech-Time) by heart', icon: '✅' },
    { type: 'do', text: 'Control blood pressure — it\'s the #1 stroke risk factor', icon: '✅' },
    { type: 'do', text: 'Get screened for atrial fibrillation (AFib) — it causes 20% of strokes', icon: '✅' },
    { type: 'do', text: 'Call emergency services immediately at any FAST symptom', icon: '✅' },
    { type: 'dont', text: 'Wait to see if symptoms resolve on their own', icon: '❌' },
    { type: 'dont', text: 'Drive yourself to hospital — call an ambulance', icon: '❌' },
    { type: 'dont', text: 'Smoke — it doubles stroke risk', icon: '❌' },
    { type: 'dont', text: 'Miss doses of blood thinners if prescribed for AFib', icon: '❌' },
  ],
  emergencySigns: [
    'Any FAST symptom: Face drooping, Arm weakness, Speech difficulty',
    'Sudden severe headache unlike any before',
    'Sudden vision loss or double vision',
    'Sudden loss of balance or coordination',
    'These are ALL emergencies — call 999/911 immediately',
  ],
  recoveryOutlook: {
    withIntervention: 'tPA given within 3 hours restores independent function in 30% more patients vs. no treatment. With excellent rehab, up to 50% of stroke survivors regain functional independence.',
    withoutIntervention: 'Without treatment, 1.9 million brain cells die every minute. Large untreated strokes lead to permanent paralysis, cognitive failure, or death.',
    keyFact: 'Time is the most critical factor in stroke. Getting to the hospital 15 minutes faster can mean the difference between full recovery and permanent disability.',
  },
  quickStats: [
    { label: 'Strokes/Year (Global)', value: '15 Million' },
    { label: 'Treatment Window', value: '4.5 hours' },
    { label: 'Neurons Die/Minute', value: '1.9 Million' },
    { label: 'Preventable', value: '~80%' },
  ],
}

// ─────────────────────────────────────────────
// ANEMIA
// ─────────────────────────────────────────────
const anemia: DiseaseData = {
  id: 'anemia',
  name: 'Anemia',
  fullName: 'Iron-Deficiency Anemia',
  tagline: 'Too few red blood cells leave every organ starved of oxygen',
  color: '#10b981',
  gradientFrom: 'from-emerald-500',
  gradientTo: 'to-teal-600',
  glowColor: 'rgba(16,185,129,0.4)',
  affectedBodyZones: [
    { id: 'blood', label: 'Red Blood Cells', cx: 100, cy: 175, r: 12, severity: 'severe', description: 'Insufficient hemoglobin means red blood cells cannot carry enough oxygen to tissues — causing widespread cellular oxygen deprivation.' },
    { id: 'heart', label: 'Heart', cx: 93, cy: 155, r: 10, severity: 'moderate', description: 'The heart beats faster to compensate for reduced oxygen delivery — over time, this causes cardiomegaly (enlarged heart).' },
    { id: 'brain', label: 'Brain', cx: 100, cy: 58, r: 8, severity: 'moderate', description: 'Oxygen deprivation impairs concentration, memory, and mood — anemia is a major overlooked cause of cognitive issues.' },
    { id: 'nails', label: 'Nails & Skin', cx: 170, cy: 270, r: 6, severity: 'mild', description: 'Spoon-shaped nails (koilonychia) and pale inner eyelids are classic external signs of severe iron deficiency anemia.' },
  ],
  externalSymptoms: [
    { name: 'Extreme Fatigue', description: 'The most common symptom — feeling deeply exhausted even after full sleep, because every cell in the body is getting less oxygen.', severity: 'severe', icon: '😩' },
    { name: 'Pale Skin & Pale Inner Eyelids', description: 'Hemoglobin gives blood its red color. Less hemoglobin = pale skin, pale gums, and very pale inner eyelids (pull down gently to check).', severity: 'moderate', icon: '⬜' },
    { name: 'Rapid or Irregular Heartbeat', description: 'The heart beats faster to pump what little oxygen-carrying blood exists more rapidly to vital organs.', severity: 'moderate', icon: '💓' },
    { name: 'Brittle Nails & Hair Loss', description: 'Iron is essential for keratin production. Deficiency causes spoon-shaped nails (koilonychia) and diffuse hair thinning.', severity: 'mild', icon: '💅' },
    { name: 'Shortness of Breath', description: 'Even mild activity causes breathlessness because the blood simply cannot deliver enough oxygen to meet muscles\' demands.', severity: 'moderate', icon: '💨' },
    { name: 'Pica (Craving Non-Food)', description: 'A strange but well-documented symptom — craving and eating ice, clay, or other non-food items. Often a tip-off for severe iron deficiency.', severity: 'mild', icon: '🧊' },
    { name: 'Cold Hands & Feet', description: 'Poor peripheral circulation from reduced oxygen delivery keeps extremities persistently cold, even in warm environments.', severity: 'mild', icon: '🥶' },
  ],
  internalSymptoms: [
    { name: 'Hypochromic Microcytic RBCs', description: 'Iron-deficient red blood cells are smaller than normal (microcytic) and carry less hemoglobin (hypochromic) — visible under a microscope.', severity: 'severe', icon: '🔬' },
    { name: 'Compensatory Cardiac Output Increase', description: 'The heart increases stroke volume and heart rate to maintain tissue oxygenation — a short-term fix that damages the heart long-term.', severity: 'moderate', icon: '❤️' },
    { name: 'Impaired Immune Function', description: 'Iron-dependent enzymes are critical for immune cell function. Anemia significantly raises infection risk.', severity: 'moderate', icon: '🛡️' },
  ],
  progressionStages: [
    { stage: 'early', label: 'Iron Depletion', timeframe: 'Ferritin < 20 ng/mL', description: 'Iron stores are depleted but hemoglobin is still normal. No symptoms, but the body is working harder.', symptoms: ['No obvious symptoms', 'Mild fatigue', 'Reduced athletic performance'], reversible: true, riskRange: [0, 30] },
    { stage: 'developing', label: 'Iron-Deficient Erythropoiesis', timeframe: 'Ferritin < 12 ng/mL', description: 'Iron supply to the bone marrow falls below the threshold needed for normal red blood cell production.', symptoms: ['Mild fatigue', 'Concentration difficulties', 'Pale appearance beginning'], reversible: true, riskRange: [30, 55] },
    { stage: 'advanced', label: 'Iron Deficiency Anemia (Mild–Moderate)', timeframe: 'Hgb 8–12 g/dL', description: 'Hemoglobin is below normal. Classic symptoms appear. Treatment with iron supplementation is highly effective.', symptoms: ['Significant fatigue', 'Breathlessness on exertion', 'Palpitations', 'Pale skin'], reversible: true, riskRange: [55, 75] },
    { stage: 'severe', label: 'Severe Anemia', timeframe: 'Hgb < 8 g/dL', description: 'Life-threatening oxygen deprivation. Heart failure, organ dysfunction, and in extreme cases death can occur.', symptoms: ['Severe breathlessness at rest', 'Chest pain', 'Confusion', 'Heart failure symptoms'], reversible: true, riskRange: [75, 100] },
  ],
  treatments: [
    { category: 'medical', title: 'Oral Iron Supplements', description: 'Ferrous sulfate (325mg, 2-3x daily) is first-line treatment. Take on an empty stomach with Vitamin C for best absorption.', icon: '💊', effectiveness: 'proven' },
    { category: 'dietary', title: 'Iron-Rich Diet', description: 'Red meat, organ meats, shellfish, lentils, spinach, fortified cereals. Combine plant iron (non-heme) with Vitamin C to boost absorption 3-fold.', icon: '🥩', effectiveness: 'proven' },
    { category: 'medical', title: 'IV Iron Infusion', description: 'For severe anemia or when oral iron isn\'t tolerated — directly delivers iron to the bloodstream. Results in weeks.', icon: '💉', effectiveness: 'proven' },
    { category: 'medical', title: 'Find and Treat the Cause', description: 'Anemia is often a symptom. Heavy periods, GI bleeding, or malabsorption (celiac disease) must be identified and addressed.', icon: '🔍', effectiveness: 'proven' },
    { category: 'dietary', title: 'Vitamin C at Every Meal', description: 'Ascorbic acid converts non-heme iron to a more absorbable form. A glass of orange juice with meals increases iron absorption by 30%.', icon: '🍊', effectiveness: 'recommended' },
  ],
  precautions: [
    { type: 'do', text: 'Get a full blood count (CBC) test annually', icon: '✅' },
    { type: 'do', text: 'Take iron with Vitamin C (orange juice, bell peppers)', icon: '✅' },
    { type: 'do', text: 'Cook in cast iron pans — it adds bioavailable iron to food', icon: '✅' },
    { type: 'do', text: 'Investigate heavy menstrual periods as a primary cause', icon: '✅' },
    { type: 'dont', text: 'Take iron with tea, coffee, or dairy — they block absorption', icon: '❌' },
    { type: 'dont', text: 'Take iron supplements without a confirmed diagnosis — excess iron is toxic', icon: '❌' },
    { type: 'dont', text: 'Ignore persistent fatigue — it has a treatable cause', icon: '❌' },
    { type: 'dont', text: 'Donate blood if you are already iron-deficient', icon: '❌' },
  ],
  emergencySigns: [
    'Hemoglobin below 7 g/dL (critical threshold)',
    'Chest pain or shortness of breath at rest',
    'Heart palpitations or rapid irregular heartbeat',
    'Fainting or near-fainting',
    'Confusion or extreme weakness',
  ],
  recoveryOutlook: {
    withIntervention: 'Iron-deficiency anemia is one of the most treatable conditions in medicine. Most patients feel significant improvement within 2–4 weeks of iron supplementation, with full recovery in 2–3 months.',
    withoutIntervention: 'Untreated severe anemia causes heart failure, impaired immune function, developmental problems in children, and pregnancy complications.',
    keyFact: 'Anemia affects 1.62 billion people worldwide — making it the most common nutritional deficiency on Earth. Women of reproductive age and young children are most at risk.',
  },
  quickStats: [
    { label: 'People Affected', value: '1.62 Billion' },
    { label: 'Most Common', value: '#1 nutritional deficiency' },
    { label: 'Recovery Time', value: '2–3 months' },
    { label: 'Key Test', value: 'Ferritin + CBC' },
  ],
}

// ─────────────────────────────────────────────
// Export registry
// ─────────────────────────────────────────────
export const DISEASE_REGISTRY: Record<string, DiseaseData> = {
  diabetes,
  cvd,
  hypertension,
  ckd,
  obesity,
  stroke,
  anemia,
}

export const DISEASE_LIST = Object.values(DISEASE_REGISTRY)

export function getDiseaseById(id: string): DiseaseData | undefined {
  return DISEASE_REGISTRY[id.toLowerCase()]
}
