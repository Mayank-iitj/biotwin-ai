// BioTwin AI API Client
// Handles all communication with the FastAPI backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  token?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async signup(email: string, password: string, fullName?: string) {
    return this.request<{ access_token: string; refresh_token: string }>('/api/v1/auth/signup', {
      method: 'POST',
      body: { email, password, full_name: fullName },
    })
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }))
      throw new Error(error.detail)
    }

    return response.json()
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ access_token: string; refresh_token: string }>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    })
  }

  // User
  async getProfile(token: string) {
    return this.request<any>('/api/v1/users/me', { token })
  }

  async updateProfile(token: string, data: any) {
    return this.request<any>('/api/v1/users/me', { method: 'PUT', body: data, token })
  }

  async acknowledgeDisclaimer(token: string) {
    return this.request<any>('/api/v1/users/me/acknowledge-disclaimer', { method: 'POST', token })
  }

  // Digital Twin
  async getTwin(token: string) {
    return this.request<any>('/api/v1/twin/me', { token })
  }

  // Risk Assessment
  async assessRisk(token: string) {
    return this.request<any[]>('/api/v1/risk/assess', { method: 'POST', token })
  }

  async getRiskHistory(token: string, disease: string) {
    return this.request<any>(`/api/v1/risk/history?disease=${disease}`, { token })
  }

  // Simulation
  async runSimulation(token: string, modifiedFactors: Record<string, number>) {
    return this.request<any>('/api/v1/simulate', {
      method: 'POST',
      body: { modified_factors: modifiedFactors },
      token,
    })
  }

  // Recommendations
  async getRecommendations(token: string) {
    return this.request<any[]>('/api/v1/recommendations/me', { token })
  }

  async generateRecommendations(token: string) {
    return this.request<any[]>('/api/v1/recommendations/generate', { method: 'POST', token })
  }

  // Health Data
  async uploadBloodReport(token: string, fileUrl: string, reportDate?: string) {
    return this.request<any>('/api/v1/health-data/blood-report', {
      method: 'POST',
      body: { file_url: fileUrl, report_date: reportDate },
      token,
    })
  }

  async getBloodReports(token: string) {
    return this.request<any[]>('/api/v1/health-data/blood-reports', { token })
  }

  async syncWearableData(token: string, data: any[]) {
    return this.request<any>('/api/v1/health-data/wearable/sync', {
      method: 'POST',
      body: data,
      token,
    })
  }

  async logLifestyle(token: string, data: any) {
    return this.request<any>('/api/v1/health-data/lifestyle', {
      method: 'POST',
      body: data,
      token,
    })
  }

  // AI Coach
  async createChatSession(token: string) {
    return this.request<any>('/api/v1/coach/sessions', { method: 'POST', token })
  }

  async getChatSessions(token: string) {
    return this.request<any[]>('/api/v1/coach/sessions', { token })
  }

  async getChatMessages(token: string, sessionId: string) {
    return this.request<any[]>(`/api/v1/coach/sessions/${sessionId}`, { token })
  }

  // Dashboard
  async getDashboardSummary(token: string) {
    return this.request<any>('/api/v1/dashboard/summary', { token })
  }

  // Privacy
  async exportData(token: string) {
    return this.request<any>('/api/v1/privacy/export', { method: 'POST', token })
  }

  async deleteAccount(token: string) {
    return this.request<any>('/api/v1/privacy/delete-account', { method: 'POST', token })
  }
}

export const api = new ApiClient()
export default api