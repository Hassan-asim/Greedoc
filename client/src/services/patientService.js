import api from './api';

const patientService = {
  getPatients: async () => {
    try {
      const response = await api.get('/patients');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  getPatient: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  getPatientCredentials: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/credentials`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient credentials:', error);
      throw error;
    }
  },

  resetPatientPassword: async (patientId) => {
    try {
      const response = await api.post(`/patients/${patientId}/reset-password`);
      return response.data.data;
    } catch (error) {
      console.error('Error resetting patient password:', error);
      throw error;
    }
  }
};

export default patientService;
