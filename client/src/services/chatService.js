import api from "./api";

const chatService = {
  // Send a message
  sendMessage: async (
    receiverId,
    message,
    messageType = "text",
    attachments = []
  ) => {
    try {
      const response = await api.post("/chat/send", {
        receiverId,
        message,
        messageType,
        attachments,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get chat rooms
  getChatRooms: async () => {
    try {
      const response = await api.get("/chat/rooms");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get messages for a specific chat room
  getMessages: async (chatRoomId, limit = 50, offset = 0) => {
    try {
      const response = await api.get(
        `/chat/messages/${chatRoomId}?limit=${limit}&offset=${offset}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    try {
      const response = await api.put(`/chat/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get unread messages count
  getUnreadMessages: async () => {
    try {
      const response = await api.get("/chat/unread");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update FCM token
  updateFCMToken: async (fcmToken) => {
    try {
      const response = await api.post("/chat/fcm-token", { fcmToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get assigned doctor for patient
  getAssignedDoctor: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/doctor`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get patients for doctor
  getDoctorPatients: async (doctorId) => {
    try {
      const response = await api.get(`/users/${doctorId}/patients`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default chatService;
