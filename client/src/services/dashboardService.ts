import { api } from './api';

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  pendingReports: number;
  todayAppointments: number;
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

export interface ReportStats {
  pending: number;
  completed: number;
  total: number;
}

export interface AppointmentStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

class DashboardService {
  /**
   * Get dashboard statistics for a doctor
   */
  async getDashboardStats(doctorId: string): Promise<DashboardStats> {
    try {
      const response = await api.get(`/dashboard/stats/${doctorId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStats(doctorId: string): Promise<PatientStats> {
    try {
      const response = await api.get(`/dashboard/patients/${doctorId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats(doctorId: string): Promise<ReportStats> {
    try {
      const response = await api.get(`/dashboard/reports/${doctorId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report stats:', error);
      throw error;
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(doctorId: string): Promise<AppointmentStats> {
    try {
      const response = await api.get(`/dashboard/appointments/${doctorId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
