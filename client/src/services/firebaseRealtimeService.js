import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

class FirebaseRealtimeService {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Listen to messages in a chat room
  listenToMessages(chatRoomId, callback) {
    console.log("Setting up message listener for room:", chatRoomId);
    const messagesRef = collection(db, "chats");
    const q = query(messagesRef, where("chatRoomId", "==", chatRoomId));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        console.log(
          `Received ${snapshot.size} messages for room ${chatRoomId}`
        );
        const messages = [];
        const senderIds = new Set();

        snapshot.forEach((doc) => {
          const messageData = { id: doc.id, ...doc.data() };

          // Convert Firestore Timestamps to JavaScript Dates
          if (messageData.createdAt && messageData.createdAt.toDate) {
            messageData.createdAt = messageData.createdAt.toDate();
          }
          if (messageData.readAt && messageData.readAt.toDate) {
            messageData.readAt = messageData.readAt.toDate();
          }

          console.log("Message data:", messageData);
          messages.push(messageData);
          senderIds.add(messageData.senderId);
        });

        // Sort by createdAt on the client side to avoid index requirements
        messages.sort((a, b) => {
          const aTime = new Date(a.createdAt);
          const bTime = new Date(b.createdAt);
          return aTime - bTime; // Oldest first
        });

        // Fetch sender details for all unique senders
        const senderDetails = new Map();
        for (const senderId of senderIds) {
          try {
            const API_BASE_URL =
              import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const response = await fetch(`${API_BASE_URL}/users/${senderId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const userData = await response.json();
              console.log("User data received for message sender:", userData);
              senderDetails.set(senderId, {
                id: senderId,
                fullName: `${userData.data.user.firstName} ${userData.data.user.lastName}`,
                avatar: userData.data.user.avatar || null,
              });
            } else {
              senderDetails.set(senderId, {
                id: senderId,
                fullName: "Unknown User",
                avatar: null,
              });
            }
          } catch (error) {
            console.error("Error fetching sender details:", error);
            senderDetails.set(senderId, {
              id: senderId,
              fullName: "Unknown User",
              avatar: null,
            });
          }
        }

        // Add sender details to messages
        const messagesWithSenders = messages.map((message) => ({
          ...message,
          sender: senderDetails.get(message.senderId) || {
            id: message.senderId,
            fullName: "Unknown User",
            avatar: null,
          },
        }));

        console.log(
          "Sending messages to callback:",
          messagesWithSenders.length
        );
        callback(messagesWithSenders);
      },
      (error) => {
        console.error("Error in message listener:", error);
      }
    );

    this.listeners.set(`messages-${chatRoomId}`, unsubscribe);
    return unsubscribe;
  }

  // Listen to chat rooms for a user (filtered by relationships)
  listenToChatRooms(
    userId,
    userRole,
    assignedDoctor = null,
    doctorPatients = [],
    callback
  ) {
    const messagesRef = collection(db, "chats");

    // Get all messages where user is sender
    const senderQuery = query(messagesRef, where("senderId", "==", userId));

    // Get all messages where user is receiver
    const receiverQuery = query(messagesRef, where("receiverId", "==", userId));

    let senderMessages = [];
    let receiverMessages = [];

    const processMessages = () => {
      const chatRooms = new Map();
      const allMessages = [...senderMessages, ...receiverMessages];

      // Filter messages based on user role and relationships
      const filteredMessages = allMessages.filter((message) => {
        if (userRole === "patient" && assignedDoctor) {
          // Patient can only see messages with their assigned doctor
          return (
            (message.senderId === userId &&
              message.receiverId === assignedDoctor.id) ||
            (message.senderId === assignedDoctor.id &&
              message.receiverId === userId)
          );
        } else if (userRole === "doctor" && doctorPatients.length > 0) {
          // Doctor can only see messages with their assigned patients
          const patientIds = doctorPatients.map((p) => p.id);
          return (
            (message.senderId === userId &&
              patientIds.includes(message.receiverId)) ||
            (patientIds.includes(message.senderId) &&
              message.receiverId === userId)
          );
        }
        return false; // No relationship, don't show
      });

      // Sort filtered messages by creation time
      filteredMessages.sort((a, b) => {
        const aTime = new Date(a.createdAt);
        const bTime = new Date(b.createdAt);
        return bTime - aTime; // Newest first
      });

      filteredMessages.forEach((message) => {
        const roomId = message.chatRoomId;

        if (!chatRooms.has(roomId)) {
          chatRooms.set(roomId, {
            chatRoomId: roomId,
            lastMessage: message,
            unreadCount: 0,
            otherUser: null, // Will be populated below
          });
        } else {
          const room = chatRooms.get(roomId);
          const messageTime = new Date(message.createdAt);
          const lastMessageTime = new Date(room.lastMessage.createdAt);

          if (messageTime > lastMessageTime) {
            room.lastMessage = message;
          }
        }

        // Count unread messages where user is receiver
        if (message.receiverId === userId && !message.isRead) {
          const room = chatRooms.get(roomId);
          room.unreadCount++;
        }
      });

      // Now fetch user details for each chat room
      const fetchUserDetails = async () => {
        const roomsWithUsers = [];

        for (const room of chatRooms.values()) {
          const roomId = room.chatRoomId;
          const roomParts = roomId.split("_");

          if (roomParts.length === 3) {
            const [, firstId, secondId] = roomParts;
            const otherUserId = userId === firstId ? secondId : firstId;

            try {
              // Fetch user details from the backend API
              const API_BASE_URL =
                import.meta.env.VITE_API_URL || "http://localhost:5000/api";
              const response = await fetch(
                `${API_BASE_URL}/users/${otherUserId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (response.ok) {
                const userData = await response.json();
                console.log("User data received for chat room:", userData);
                room.otherUser = {
                  id: otherUserId,
                  fullName: `${userData.data.user.firstName} ${userData.data.user.lastName}`,
                  avatar: userData.data.user.avatar || null,
                  isOnline: userData.data.user.isOnline || false,
                };
              } else {
                // Fallback to unknown user
                room.otherUser = {
                  id: otherUserId,
                  fullName: "Unknown User",
                  avatar: null,
                  isOnline: false,
                };
              }
            } catch (error) {
              console.error("Error fetching user details:", error);
              // Fallback to unknown user
              room.otherUser = {
                id: otherUserId,
                fullName: "Unknown User",
                avatar: null,
                isOnline: false,
              };
            }
          }

          roomsWithUsers.push(room);
        }

        callback(roomsWithUsers);
      };

      fetchUserDetails();
    };

    const unsubscribeSender = onSnapshot(senderQuery, (snapshot) => {
      senderMessages = [];
      snapshot.forEach((doc) => {
        const messageData = { id: doc.id, ...doc.data() };

        // Convert Firestore Timestamps to JavaScript Dates
        if (messageData.createdAt && messageData.createdAt.toDate) {
          messageData.createdAt = messageData.createdAt.toDate();
        }
        if (messageData.readAt && messageData.readAt.toDate) {
          messageData.readAt = messageData.readAt.toDate();
        }

        senderMessages.push(messageData);
      });
      processMessages();
    });

    const unsubscribeReceiver = onSnapshot(receiverQuery, (snapshot) => {
      receiverMessages = [];
      snapshot.forEach((doc) => {
        const messageData = { id: doc.id, ...doc.data() };

        // Convert Firestore Timestamps to JavaScript Dates
        if (messageData.createdAt && messageData.createdAt.toDate) {
          messageData.createdAt = messageData.createdAt.toDate();
        }
        if (messageData.readAt && messageData.readAt.toDate) {
          messageData.readAt = messageData.readAt.toDate();
        }

        receiverMessages.push(messageData);
      });
      processMessages();
    });

    // Return a function that unsubscribes from both listeners
    const unsubscribe = () => {
      unsubscribeSender();
      unsubscribeReceiver();
    };

    this.listeners.set(`chatRooms-${userId}`, unsubscribe);
    return unsubscribe;
  }

  // Send a message
  async sendMessage(
    chatRoomId,
    message,
    senderId,
    receiverId,
    messageType = "text",
    attachments = []
  ) {
    try {
      console.log("Sending message:", {
        chatRoomId,
        message,
        senderId,
        receiverId,
        messageType,
      });

      const messagesRef = collection(db, "chats");
      const messageData = {
        chatRoomId,
        senderId,
        receiverId,
        message,
        messageType,
        attachments,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(messagesRef, messageData);
      console.log("Message sent successfully:", docRef.id);
      return { id: docRef.id, ...messageData };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      const messageRef = doc(db, "chats", messageId);
      await updateDoc(messageRef, {
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  // Clean up all listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  // Ensure both users are listening to the same chat room
  ensureChatRoomSync(
    chatRoomId,
    userId,
    userRole,
    assignedDoctor,
    doctorPatients
  ) {
    console.log("Ensuring chat room sync for:", {
      chatRoomId,
      userId,
      userRole,
      hasAssignedDoctor: !!assignedDoctor,
      doctorPatientsCount: doctorPatients?.length || 0,
    });

    // Validate chat room ID format
    const roomParts = chatRoomId.split("_");
    if (roomParts.length !== 3 || roomParts[0] !== "chat") {
      console.error("Invalid chat room ID format:", chatRoomId);
      return false;
    }

    const [, firstId, secondId] = roomParts;

    // Validate that the user is part of this chat room
    if (userRole === "doctor") {
      // For doctors, they should be the second ID (doctorId)
      if (userId !== secondId) {
        console.error(
          "Doctor user ID doesn't match chat room:",
          userId,
          "vs",
          secondId
        );
        return false;
      }
      // Validate that the patient is assigned to this doctor
      const patient = doctorPatients?.find((p) => p.id === firstId);
      if (!patient) {
        console.error(
          "Patient not found in doctor's assigned patients:",
          firstId
        );
        return false;
      }
    } else if (userRole === "patient") {
      // For patients, they should be the first ID (patientId)
      if (userId !== firstId) {
        console.error(
          "Patient user ID doesn't match chat room:",
          userId,
          "vs",
          firstId
        );
        return false;
      }
      // Validate that the doctor is assigned to this patient
      if (!assignedDoctor || assignedDoctor.id !== secondId) {
        console.error("Doctor not assigned to this patient:", secondId);
        return false;
      }
    }

    console.log("Chat room sync validation passed");
    return true;
  }

  // Remove specific listener
  removeListener(key) {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }
}

export default new FirebaseRealtimeService();
