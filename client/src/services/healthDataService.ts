import api from './api';

export interface HealthMetric {
  value: number | string;
  unit: string;
  timestamp: string;
  notes?: string;
}

export interface HealthData {
  id: string;
  patientId: string;
  healthMetrics: {
    heartRate?: HealthMetric;
    steps?: HealthMetric;
    sleep?: HealthMetric;
    bloodPressure?: HealthMetric;
    weight?: HealthMetric;
    temperature?: HealthMetric;
  };
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthDataData {
  type: 'steps' | 'heart_rate' | 'sleep' | 'blood_pressure' | 'weight' | 'temperature';
  value: number | string;
  unit: string;
  timestamp?: string;
  notes?: string;
}

export interface UpdateHealthDataData {
  type?: 'steps' | 'heart_rate' | 'sleep' | 'blood_pressure' | 'weight' | 'temperature';
  value?: number | string;
  unit?: string;
  timestamp?: string;
  notes?: string;
}

export interface BulkHealthDataUpdate {
  healthMetrics: {
    heartRate?: HealthMetric;
    steps?: HealthMetric;
    sleep?: HealthMetric;
    bloodPressure?: HealthMetric;
    weight?: HealthMetric;
    temperature?: HealthMetric;
  };
}

export interface HealthDataFilters {
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface HealthMetric {
  type: 'steps' | 'heart_rate' | 'sleep' | 'blood_pressure' | 'weight' | 'temperature';
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  color: string;
}

class HealthDataService {
  /**
   * Get health data for the current patient
   */
  async getHealthData(filters?: HealthDataFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.orderBy) queryParams.append('orderBy', filters.orderBy);
    if (filters?.orderDirection) queryParams.append('orderDirection', filters.orderDirection);

    const response = await api.get(`/health-data?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get a specific health data entry by ID
   */
  async getHealthDataById(id: string) {
    const response = await api.get(`/health-data/${id}`);
    return response.data;
  }

  /**
   * Create new health data entry
   */
  async createHealthData(data: CreateHealthDataData) {
    const response = await api.post('/health-data', data);
    return response.data;
  }

  /**
   * Update health data entry
   */
  async updateHealthData(id: string, data: UpdateHealthDataData) {
    const response = await api.put(`/health-data/${id}`, data);
    return response.data;
  }

  /**
   * Update multiple health metrics at once
   */
  async updateBulkHealthData(data: BulkHealthDataUpdate) {
    const response = await api.put('/health-data/bulk', data);
    return response.data;
  }

  /**
   * Delete health data entry
   */
  async deleteHealthData(id: string) {
    const response = await api.delete(`/health-data/${id}`);
    return response.data;
  }

  /**
   * Get available health metric types
   */
  async getHealthMetricTypes() {
    const response = await api.get('/health-data/metrics/types');
    return response.data;
  }

  /**
   * Get health data for a specific patient (Doctor access)
   */
  async getPatientHealthData(patientId: string, filters?: HealthDataFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const response = await api.get(`/health-data/patient/${patientId}?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get recent health data (last 7 days)
   */
  async getRecentHealthData(limit: number = 10) {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    return this.getHealthData({
      startDate,
      endDate,
      limit,
      orderBy: 'timestamp',
      orderDirection: 'desc'
    });
  }

  /**
   * Get health data by type
   */
  async getHealthDataByType(type: string, limit: number = 20) {
    return this.getHealthData({
      type,
      limit,
      orderBy: 'timestamp',
      orderDirection: 'desc'
    });
  }

  /**
   * Get health data for a specific date range
   */
  async getHealthDataByDateRange(startDate: string, endDate: string, limit: number = 50) {
    return this.getHealthData({
      startDate,
      endDate,
      limit,
      orderBy: 'timestamp',
      orderDirection: 'desc'
    });
  }
}

export const healthDataService = new HealthDataService();
