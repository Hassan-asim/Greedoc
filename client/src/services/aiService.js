import api from './api';

const aiService = {
  chatWithVirtualDoctor: async (message, context = {}, patientId) => {
    try {
      const payload = { message, context, type: 'virtual_doctor' };
      if (patientId) payload.patientId = patientId;
      const response = await api.post('/ai/chat', payload);
      return response.data.data;
    } catch (error) {
      console.error('Error chatting with virtual doctor:', error);
      throw error;
    }
  },

  getVirtualDoctorHistory: async (patientId) => {
    try {
      const url = patientId ? `/ai/chat/history/${patientId}` : '/ai/chat/history';
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching virtual doctor history:', error);
      throw error;
    }
  },

  getHealthInsights: async (patientId) => {
    try {
      const response = await api.get(`/ai/insights/${patientId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting health insights:', error);
      throw error;
    }
  },

  analyzeSymptoms: async (symptoms, patientId) => {
    try {
      const response = await api.post('/ai/analyze-symptoms', {
        symptoms,
        patientId
      });
      return response.data.data;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  }
};

export default aiService;
