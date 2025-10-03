import api from './api';

const chatService = {
  // Send a message
  sendMessage: async (receiverId, message, type = 'text', fileUrl = null, fileName = null) => {
    try {
      const response = await api.post('/chat/message', {
        receiverId,
        message,
        type,
        fileUrl,
        fileName
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get chat rooms
  getChatRooms: async () => {
    try {
      const response = await api.get('/chat/rooms');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get messages for a specific receiver
  getMessages: async (receiverId) => {
    try {
      const response = await api.get(`/chat/messages/${receiverId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Register FCM token
  registerFcmToken: async (fcmToken) => {
    try {
      const response = await api.post('/chat/register-fcm-token', { fcmToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default chatService;
