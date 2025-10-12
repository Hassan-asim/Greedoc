import { api } from './api';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  medications: Medication[];
  notes: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  prescriptionDate: string;
  validUntil?: string;
  followUpDate?: string;
  diagnosis?: string;
  allergies: string[];
  contraindications: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isExpired: boolean;
  needsFollowUp: boolean;
}

export interface CreatePrescriptionData {
  patientId: string;
  patientName: string;
  medications: Omit<Medication, 'id'>[];
  notes?: string;
  prescriptionDate?: string;
  validUntil?: string;
  followUpDate?: string;
  diagnosis?: string;
  allergies?: string[];
  contraindications?: string[];
}

export interface UpdatePrescriptionData {
  patientName?: string;
  medications?: Medication[];
  notes?: string;
  prescriptionDate?: string;
  validUntil?: string;
  followUpDate?: string;
  diagnosis?: string;
  allergies?: string[];
  contraindications?: string[];
}

class PrescriptionService {
  /**
   * Get prescriptions for the current user
   */
  async getPrescriptions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    patientId?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.patientId) queryParams.append('patientId', params.patientId);

    const response = await api.get(`/prescriptions?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get a specific prescription by ID
   */
  async getPrescription(id: string) {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  }

  /**
   * Create a new prescription
   */
  async createPrescription(data: CreatePrescriptionData) {
    const response = await api.post('/prescriptions', data);
    return response.data;
  }

  /**
   * Update a prescription
   */
  async updatePrescription(id: string, data: UpdatePrescriptionData) {
    const response = await api.put(`/prescriptions/${id}`, data);
    return response.data;
  }

  /**
   * Update prescription status
   */
  async updatePrescriptionStatus(id: string, status: 'draft' | 'active' | 'completed' | 'cancelled') {
    const response = await api.put(`/prescriptions/${id}/status`, { status });
    return response.data;
  }

  /**
   * Delete a prescription
   */
  async deletePrescription(id: string) {
    const response = await api.delete(`/prescriptions/${id}`);
    return response.data;
  }

  /**
   * Get prescriptions for a specific patient
   */
  async getPatientPrescriptions(patientId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/prescriptions/patient/${patientId}?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get active prescriptions for a patient
   */
  async getActivePrescriptions(patientId: string) {
    const response = await api.get(`/prescriptions/active/${patientId}`);
    return response.data;
  }
}

export const prescriptionService = new PrescriptionService();
