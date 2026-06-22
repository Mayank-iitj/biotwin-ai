export interface User {
  id: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string;
  sex?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  disclaimerAcknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyHistory {
  id: string;
  userId: string;
  condition: string;
  relation: string;
  createdAt: string;
}

export interface BloodReport {
  id: string;
  userId: string;
  fileUrl: string;
  reportDate?: string;
  status: 'processing' | 'parsed' | 'failed';
  createdAt: string;
  values?: BloodReportValue[];
}

export interface BloodReportValue {
  id: string;
  bloodReportId: string;
  marker: string;
  value: number;
  unit?: string;
  referenceLow?: number;
  referenceHigh?: number;
}

export interface WearableData {
  id: string;
  userId: string;
  recordedAt: string;
  metric: 'heart_rate' | 'steps' | 'sleep_minutes' | 'hrv' | 'spo2';
  value: number;
  source: string;
}

export interface LifestyleLog {
  id: string;
  userId: string;
  logDate: string;
  exerciseMinutes?: number;
  sleepHours?: number;
  smoking?: boolean;
  alcoholUnits?: number;
  dietQualityScore?: number;
  weightKg?: number;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  disease: 'diabetes' | 'cvd' | 'hypertension' | 'ckd' | 'obesity';
  riskScore: number;
  riskBand: 'low' | 'moderate' | 'high';
  topFactors: Array<{ feature: string; contribution: number; direction: 'positive' | 'negative' }>;
  modelVersion: string;
  assessedAt: string;
}

export interface Simulation {
  id: string;
  userId: string;
  baselineAssessmentId?: string;
  modifiedFactors: Record<string, number>;
  projectedScores: Record<string, number>;
  createdAt: string;
  scores?: ProjectedScore[];
}

export interface ProjectedScore {
  disease: string;
  baseline: number;
  projected: number;
  delta: number;
}

export interface Recommendation {
  id: string;
  userId: string;
  riskAssessmentId?: string;
  category: 'diet' | 'exercise' | 'sleep' | 'medical_followup';
  text: string;
  priority: number;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface DigitalTwin {
  userId: string;
  latestBloodReport?: BloodReport;
  bloodMarkers?: BloodReportValue[];
  recentWearable?: WearableData[];
  lifestyle?: {
    weightKg?: number;
    sleepHours?: number;
  };
  familyHistory?: FamilyHistory[];
  riskAssessments: RiskAssessment[];
  recommendations: Recommendation[];
}

export interface DashboardSummary {
  userId: string;
  riskSummaries: Array<{
    disease: string;
    riskScore: number;
    riskBand: string;
  }>;
  totalRecommendations: number;
  recentActivities: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  disclaimer: string;
  meta?: {
    modelVersion?: string;
    generatedAt: string;
  };
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}