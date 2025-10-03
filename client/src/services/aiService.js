import api from './api';

const aiService = {
  chatWithVirtualDoctor: async (message, context = {}) => {
    try {
      const response = await api.post('/ai/chat', {
        message,
        context,
        type: 'virtual_doctor'
      });
      return response.data.data;
    } catch (error) {
      console.error('Error chatting with virtual doctor:', error);
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
