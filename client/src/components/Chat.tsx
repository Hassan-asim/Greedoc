import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiPaperclip, FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import chatService from '../services/chatService';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat rooms on component mount
  useEffect(() => {
    loadChatRooms();
  }, []);

  // Load messages when selected room changes
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
    }
  }, [selectedRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChatRooms();
      setChatRooms(response.data.chatRooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId: string) => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(chatRoomId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      // Find the other user in the selected room
      const room = chatRooms.find(r => r.chatRoomId === selectedRoom);
      if (!room?.otherUser) return;

      const response = await chatService.sendMessage(
        room.otherUser.id,
        newMessage.trim(),
        'text'
      );

      // Add message to local state
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');

      // Update last message in chat rooms
      setChatRooms(prev => 
        prev.map(room => 
          room.chatRoomId === selectedRoom 
            ? { ...room, lastMessage: response.data.message }
            : room
        )
      );
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Rooms Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        
        <div className="overflow-y-auto h-full">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : chatRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
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
                      const room = chatRooms.find(r => r.chatRoomId === selectedRoom);
                      return room?.otherUser ? getInitials(room.otherUser.fullName) : 'U';
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {(() => {
                        const room = chatRooms.find(r => r.chatRoomId === selectedRoom);
                        return room?.otherUser?.fullName || 'Unknown User';
                      })()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const room = chatRooms.find(r => r.chatRoomId === selectedRoom);
                        return room?.otherUser?.isOnline ? 'Online' : 'Offline';
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
                    onChange={(e) => setNewMessage(e.target.value)}
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
    </div>
  );
};

export default Chat;
