import { api } from './api';

export interface FollowUp {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  prescriptionId?: string;
  followUpDate: string;
  followUpTime: string;
  purpose: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isUpcoming: boolean;
  isToday: boolean;
}

export interface CreateFollowUpData {
  patientId: string;
  patientName: string;
  prescriptionId?: string;
  followUpDate: string;
  followUpTime: string;
  purpose: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateFollowUpData {
  patientName?: string;
  followUpDate?: string;
  followUpTime?: string;
  purpose?: string;
  notes?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

class FollowUpService {
  /**
   * Get follow-ups for the current user
   */
  async getFollowUps(params?: {
    page?: number;
    limit?: number;
    status?: string;
    patientId?: string;
    doctorId?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.patientId) queryParams.append('patientId', params.patientId);
    if (params?.doctorId) queryParams.append('doctorId', params.doctorId);

    const response = await api.get(`/followups?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get a specific follow-up by ID
   */
  async getFollowUp(id: string) {
    const response = await api.get(`/followups/${id}`);
    return response.data;
  }

  /**
   * Create a new follow-up
   */
  async createFollowUp(data: CreateFollowUpData) {
    const response = await api.post('/followups', data);
    return response.data;
  }

  /**
   * Update a follow-up
   */
  async updateFollowUp(id: string, data: UpdateFollowUpData) {
    const response = await api.put(`/followups/${id}`, data);
    return response.data;
  }

  /**
   * Update follow-up status
   */
  async updateFollowUpStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled') {
    const response = await api.put(`/followups/${id}/status`, { status });
    return response.data;
  }

  /**
   * Delete a follow-up
   */
  async deleteFollowUp(id: string) {
    const response = await api.delete(`/followups/${id}`);
    return response.data;
  }

  /**
   * Get follow-ups for a specific patient
   */
  async getPatientFollowUps(patientId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/followups/patient/${patientId}?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get upcoming follow-ups for a doctor
   */
  async getUpcomingFollowUps(doctorId: string, days: number = 7) {
    const response = await api.get(`/followups/upcoming/${doctorId}?days=${days}`);
    return response.data;
  }
}

export const followupService = new FollowUpService();
