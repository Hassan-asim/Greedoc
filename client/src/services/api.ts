import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          const { token: newToken, refreshToken: newRefreshToken } = response.data.data

          localStorage.setItem('token', newToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  updateProfile: (userData: any) =>
    api.put('/auth/profile', userData),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
}

export const healthAPI = {
  getRecords: (params?: any) =>
    api.get('/health/records', { params }),
  
  createRecord: (recordData: any) =>
    api.post('/health/records', recordData),
  
  getRecord: (id: string) =>
    api.get(`/health/records/${id}`),
  
  updateRecord: (id: string, recordData: any) =>
    api.put(`/health/records/${id}`, recordData),
  
  deleteRecord: (id: string) =>
    api.delete(`/health/records/${id}`),
  
  getVitals: (params?: any) =>
    api.get('/health/vitals', { params }),
  
  recordVitals: (vitalsData: any) =>
    api.post('/health/vitals', vitalsData),
  
  getSummary: () =>
    api.get('/health/summary'),
}

export const medicationAPI = {
  getMedications: (params?: any) =>
    api.get('/medications', { params }),
  
  createMedication: (medicationData: any) =>
    api.post('/medications', medicationData),
  
  getMedication: (id: string) =>
    api.get(`/medications/${id}`),
  
  updateMedication: (id: string, medicationData: any) =>
    api.put(`/medications/${id}`, medicationData),
  
  deleteMedication: (id: string) =>
    api.delete(`/medications/${id}`),
  
  updateMedicationStatus: (id: string, isActive: boolean, reason?: string) =>
    api.put(`/medications/${id}/status`, { isActive, discontinuedReason: reason }),
  
  getDueMedications: () =>
    api.get('/medications/reminders/due'),
  
  markMedicationTaken: (id: string, date?: string, notes?: string) =>
    api.post(`/medications/${id}/taken`, { date, notes }),
  
  getAdherenceSummary: (params?: any) =>
    api.get('/medications/adherence/summary', { params }),
}

export const appointmentAPI = {
  getAppointments: (params?: any) =>
    api.get('/appointments', { params }),
  
  createAppointment: (appointmentData: any) =>
    api.post('/appointments', appointmentData),
  
  getAppointment: (id: string) =>
    api.get(`/appointments/${id}`),
  
  updateAppointment: (id: string, appointmentData: any) =>
    api.put(`/appointments/${id}`, appointmentData),
  
  deleteAppointment: (id: string) =>
    api.delete(`/appointments/${id}`),
  
  getUpcomingAppointments: (limit?: number) =>
    api.get('/appointments/upcoming', { params: { limit } }),
  
  getCalendarAppointments: (year: number, month: number) =>
    api.get(`/appointments/calendar/${year}/${month}`),
  
  updateAppointmentStatus: (id: string, status: string, notes?: string) =>
    api.put(`/appointments/${id}/status`, { status, notes }),
}

export const aiAPI = {
  getHealthInsights: (query: string, context?: any) =>
    api.post('/ai/health-insights', { query, context }),
  
  analyzeMedications: () =>
    api.post('/ai/medication-analysis'),
  
  checkSymptoms: (symptoms: any[], duration?: string, additionalInfo?: string) =>
    api.post('/ai/symptom-checker', { symptoms, duration, additionalInfo }),
  
  getHealthSummary: () =>
    api.get('/ai/health-summary'),
}

export default api
