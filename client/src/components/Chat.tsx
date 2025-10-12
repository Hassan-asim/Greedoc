import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiPaperclip, FiMoreVertical, FiPhone, FiVideo, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import chatService from '../services/chatService';
import firebaseRealtimeService from '../services/firebaseRealtimeService';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: string;
  attachments: any[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatar: string | null;
  } | null;
}

interface ChatRoom {
  chatRoomId: string;
  lastMessage: Message;
  unreadCount: number;
  otherUser: {
    id: string;
    fullName: string;
    avatar: string | null;
    isOnline: boolean;
  } | null;
}

interface ChatProps {
  selectedChatRoom?: string;
  onChatRoomSelect?: (chatRoomId: string) => void;
}

const Chat: React.FC<ChatProps> = ({ selectedChatRoom, onChatRoomSelect }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(selectedChatRoom || null);
  const [assignedDoctor, setAssignedDoctor] = useState<any>(null);
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Firebase real-time listeners
  useEffect(() => {
    if (user) {
      // Listen to chat rooms for the user with relationship filtering
      const unsubscribeChatRooms = firebaseRealtimeService.listenToChatRooms(
        user.id, 
        user.role, 
        assignedDoctor, 
        doctorPatients, 
        (chatRooms) => {
          setChatRooms(chatRooms);
        }
      );

      return () => {
        unsubscribeChatRooms();
        firebaseRealtimeService.cleanup();
      };
    }
  }, [user, assignedDoctor, doctorPatients]);

  // Load doctor-patient relationships
  useEffect(() => {
    loadDoctorPatientRelationships();
  }, [user]);

  const loadDoctorPatientRelationships = async () => {
    if (!user) return;

    try {
      if (user.role === 'patient') {
        console.log('Loading assigned doctor for patient:', user.id);
        // Load assigned doctor for patient
        const doctorResponse = await chatService.getAssignedDoctor(user.id);
        console.log('Doctor response:', doctorResponse);
        setAssignedDoctor(doctorResponse.data?.doctor || null);
        
        // If patient has an assigned doctor, create a chat room
        if (doctorResponse.data?.doctor) {
          const chatRoomId = `chat_${user.id}_${doctorResponse.data.doctor.id}`;
          console.log('Created chat room for patient:', chatRoomId);
          // Auto-select the doctor chat if no room is selected
          if (!selectedRoom) {
            setSelectedRoom(chatRoomId);
          }
        } else {
          console.log('No assigned doctor found for patient');
        }
      } else if (user.role === 'doctor') {
        console.log('Loading patients for doctor:', user.id);
        // Load patients for doctor
        const patientsResponse = await chatService.getDoctorPatients(user.id);
        console.log('Patients response:', patientsResponse);
        setDoctorPatients(patientsResponse.data?.patients || []);
      }
    } catch (error) {
      console.error('Error loading doctor-patient relationships:', error);
      // Set empty values on error
      setAssignedDoctor(null);
      setDoctorPatients([]);
    }
  };

  // Load messages when selected room changes
  useEffect(() => {
    if (selectedRoom && user) {
      console.log("Setting up listeners for room:", selectedRoom, "User:", user?.id, "Role:", user?.role);
      
      // Validate chat room sync before setting up listeners
      const isValidRoom = firebaseRealtimeService.ensureChatRoomSync(
        selectedRoom, 
        user.id, 
        user.role, 
        assignedDoctor, 
        doctorPatients
      );

      if (!isValidRoom) {
        console.error("Invalid chat room for user, clearing selection");
        setSelectedRoom(null);
        return;
      }
      
      // Listen to messages in the selected room
      const unsubscribeMessages = firebaseRealtimeService.listenToMessages(selectedRoom, (messages) => {
        console.log("Received messages in Chat component:", messages.length);
        setMessages(messages);
      });

      return () => {
        console.log("Cleaning up listeners for room:", selectedRoom);
        unsubscribeMessages();
      };
    }
  }, [selectedRoom, user, assignedDoctor, doctorPatients]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Firebase real-time handles loading automatically

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    console.log('Attempting to send message:', {
      message: newMessage.trim(),
      selectedRoom,
      userId: user.id,
      userRole: user.role
    });

    try {
      // Find the other user in the selected room
      let room = chatRooms.find(r => r.chatRoomId === selectedRoom);
      let receiverId;

      if (room?.otherUser) {
        // Room exists with otherUser
        receiverId = room.otherUser.id;
        console.log('Using existing room receiverId:', receiverId);
      } else {
        // Room doesn't exist yet, extract receiverId from chatRoomId
        // Format: chat_${patientId}_${doctorId} or chat_${doctorId}_${patientId}
        const roomParts = selectedRoom.split('_');
        if (roomParts.length === 3) {
          const [, firstId, secondId] = roomParts;
          // Determine which ID is the receiver based on user role
          if (user.role === 'doctor') {
            receiverId = firstId; // Patient ID
          } else {
            receiverId = secondId; // Doctor ID
          }
          console.log('Extracted receiverId from room ID:', receiverId);
        } else {
          console.error('Invalid chat room ID format:', selectedRoom);
          return;
        }
      }

      console.log('Sending message with:', {
        chatRoomId: selectedRoom,
        senderId: user.id,
        receiverId: receiverId,
        message: newMessage.trim(),
        userRole: user.role,
        assignedDoctor: assignedDoctor,
        doctorPatients: doctorPatients
      });

      // Send via Firebase real-time
      await firebaseRealtimeService.sendMessage(
        selectedRoom,
        newMessage.trim(),
        user.id,
        receiverId,
        'text'
      );

      console.log('Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateInput: any) => {
    let date: Date;
    
    // Handle Firestore Timestamp objects
    if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
      date = dateInput.toDate();
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      // Handle Firestore Timestamp with seconds property
      date = new Date(dateInput.seconds * 1000);
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      // Fallback for any other format
      date = new Date(dateInput);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get other user info for a chat room
  const getOtherUserInfo = (chatRoomId: string) => {
    const room = chatRooms.find(r => r.chatRoomId === chatRoomId);
    if (room?.otherUser) {
      return room.otherUser;
    }

    // If room doesn't exist yet, try to get user info from relationships
    const roomParts = chatRoomId.split('_');
    if (roomParts.length === 3) {
      const [, firstId, secondId] = roomParts;
      let otherUserId;
      
      if (user?.role === 'doctor') {
        otherUserId = firstId; // Patient ID
        const patient = doctorPatients.find(p => p.id === otherUserId);
        if (patient) {
          return {
            id: patient.id,
            fullName: patient.fullName,
            isOnline: false // Default to offline for new chats
          };
        }
      } else {
        otherUserId = secondId; // Doctor ID
        if (assignedDoctor && assignedDoctor.id === otherUserId) {
          return {
            id: assignedDoctor.id,
            fullName: assignedDoctor.fullName,
            isOnline: false // Default to offline for new chats
          };
        }
      }
    }

    return null;
  };

  // Add error boundary for the component
  if (!user) {
    return (
      <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          <p className="text-gray-600">You need to be logged in to use the chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Rooms Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            {user?.role === 'doctor' && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                Start New Chat
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              {/* Show assigned doctor for patients */}
              {user?.role === 'patient' && (
                <div className="p-4 border-b border-gray-200">
                  {assignedDoctor ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(assignedDoctor.fullName)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          Dr. {assignedDoctor.fullName}
                        </h3>
                        <p className="text-xs text-gray-600">Your assigned doctor</p>
                      </div>
                      <button
                        onClick={() => {
                          const chatRoomId = `chat_${user.id}_${assignedDoctor.id}`;
                          console.log('Patient clicking chat with doctor:', chatRoomId);
                          setSelectedRoom(chatRoomId);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600"
                      >
                        Chat
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                        <FiSend className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          No Doctor Assigned
                        </h3>
                        <p className="text-xs text-gray-600">Contact admin to get a doctor assigned</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show patients for doctors */}
              {user?.role === 'doctor' && doctorPatients.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Your Patients</h3>
                  <div className="space-y-2">
                    {doctorPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          const chatRoomId = `chat_${patient.id}_${user.id}`;
                          setSelectedRoom(chatRoomId);
                        }}
                      >
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(patient.fullName)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {patient.fullName}
                          </h4>
                          <p className="text-xs text-gray-600">Patient</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular chat rooms - only show if no direct relationships or if there are existing conversations */}
              {chatRooms.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {user?.role === 'patient' && !assignedDoctor ? 
                    'No doctor assigned yet' : 
                    user?.role === 'doctor' && doctorPatients.length === 0 ? 
                    'No patients assigned yet' : 
                    'No conversations yet'
                  }
                </div>
              ) : (
                chatRooms.map((room) => (
                  <motion.div
                    key={room.chatRoomId}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    className={`p-4 border-b border-gray-100 cursor-pointer ${
                      selectedRoom === room.chatRoomId ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedRoom(room.chatRoomId);
                      onChatRoomSelect?.(room.chatRoomId);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {room.otherUser ? getInitials(room.otherUser.fullName) : 'U'}
                        </div>
                        {room.otherUser?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {room.otherUser?.fullName || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(room.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {room.lastMessage.message}
                        </p>
                        {room.unreadCount > 0 && (
                          <div className="flex justify-end mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
                              {room.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {(() => {
                      const otherUser = getOtherUserInfo(selectedRoom);
                      return otherUser ? getInitials(otherUser.fullName) : 'U';
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {(() => {
                        const otherUser = getOtherUserInfo(selectedRoom);
                        return otherUser?.fullName || 'Unknown User';
                      })()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const otherUser = getOtherUserInfo(selectedRoom);
                        return otherUser?.isOnline ? 'Online' : 'Offline';
                      })()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <FiPhone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <FiVideo className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <FiMoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                        {message.senderId === user?.id && message.isRead && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <FiImage className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <FiPaperclip className="h-5 w-5" />
                </button>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSend className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {doctorPatients.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">Select a patient to start chatting:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {doctorPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
                        onClick={() => {
                          const chatRoomId = `chat_${patient.id}_${user?.id}`;
                          setSelectedRoom(chatRoomId);
                          setShowNewChatModal(false);
                        }}
                      >
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(patient.fullName)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {patient.fullName}
                          </h4>
                          <p className="text-xs text-gray-600">Patient</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSend className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Patients Assigned</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You don't have any patients assigned to you yet. Contact the administrator to get patients assigned.
                  </p>
                  <button
                    onClick={() => setShowNewChatModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
