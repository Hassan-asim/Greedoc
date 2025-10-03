const { db } = require('../config/firebase');

class Chat {
  constructor(data) {
    this.id = data.id || null;
    this.senderId = data.senderId || '';
    this.receiverId = data.receiverId || '';
    this.message = data.message || '';
    this.messageType = data.messageType || 'text'; // text, image, file, prescription
    this.attachments = data.attachments || [];
    this.isRead = data.isRead || false;
    this.readAt = data.readAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.chatRoomId = data.chatRoomId || this.generateChatRoomId(data.senderId, data.receiverId);
  }

  // Generate a consistent chat room ID between two users
  generateChatRoomId(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  }

  // Static methods
  static async findByChatRoom(chatRoomId, options = {}) {
    try {
      const { limit = 50, orderBy = 'createdAt', orderDirection = 'desc' } = options;
      const messagesRef = db.collection('chats');
      
      let query = messagesRef
        .where('chatRoomId', '==', chatRoomId)
        .orderBy(orderBy, orderDirection);
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      const messages = [];
      
      snapshot.forEach(doc => {
        messages.push(new Chat({ id: doc.id, ...doc.data() }));
      });
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      throw new Error(`Error finding chat messages: ${error.message}`);
    }
  }

  static async findUnreadMessages(userId) {
    try {
      const messagesRef = db.collection('chats');
      const snapshot = await messagesRef
        .where('receiverId', '==', userId)
        .where('isRead', '==', false)
        .orderBy('createdAt', 'desc')
        .get();
      
      const messages = [];
      snapshot.forEach(doc => {
        messages.push(new Chat({ id: doc.id, ...doc.data() }));
      });
      
      return messages;
    } catch (error) {
      throw new Error(`Error finding unread messages: ${error.message}`);
    }
  }

  static async getChatRooms(userId) {
    try {
      const messagesRef = db.collection('chats');
      const snapshot = await messagesRef
        .where('senderId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const chatRooms = new Map();
      
      snapshot.forEach(doc => {
        const message = new Chat({ id: doc.id, ...doc.data() });
        const roomId = message.chatRoomId;
        
        if (!chatRooms.has(roomId)) {
          chatRooms.set(roomId, {
            chatRoomId: roomId,
            lastMessage: message,
            unreadCount: 0
          });
        }
      });
      
      // Get messages where user is receiver
      const receiverSnapshot = await messagesRef
        .where('receiverId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      receiverSnapshot.forEach(doc => {
        const message = new Chat({ id: doc.id, ...doc.data() });
        const roomId = message.chatRoomId;
        
        if (!chatRooms.has(roomId)) {
          chatRooms.set(roomId, {
            chatRoomId: roomId,
            lastMessage: message,
            unreadCount: 0
          });
        } else {
          const room = chatRooms.get(roomId);
          if (message.createdAt > room.lastMessage.createdAt) {
            room.lastMessage = message;
          }
        }
        
        if (!message.isRead) {
          room.unreadCount++;
        }
      });
      
      return Array.from(chatRooms.values());
    } catch (error) {
      throw new Error(`Error getting chat rooms: ${error.message}`);
    }
  }

  // Instance methods
  async save() {
    try {
      const chatData = this.toObject();
      delete chatData.id;
      
      if (this.id) {
        // Update existing message
        chatData.updatedAt = new Date();
        await db.collection('chats').doc(this.id).update(chatData);
      } else {
        // Create new message
        chatData.createdAt = new Date();
        chatData.updatedAt = new Date();
        const docRef = await db.collection('chats').add(chatData);
        this.id = docRef.id;
      }
      
      return this;
    } catch (error) {
      throw new Error(`Error saving chat message: ${error.message}`);
    }
  }

  async markAsRead() {
    try {
      this.isRead = true;
      this.readAt = new Date();
      this.updatedAt = new Date();
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error marking message as read: ${error.message}`);
    }
  }

  toObject() {
    return {
      id: this.id,
      senderId: this.senderId,
      receiverId: this.receiverId,
      message: this.message,
      messageType: this.messageType,
      attachments: this.attachments,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      chatRoomId: this.chatRoomId
    };
  }

  toJSON() {
    return this.toObject();
  }
}

module.exports = Chat;
