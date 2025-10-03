import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Chat from '../components/Chat';
import { useAuth } from '../contexts/AuthContext';
import { requestNotificationPermission, onMessageListener } from '../config/firebase';
import chatService from '../services/chatService';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Request notification permission and get FCM token
    const initializeNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          const token = await requestNotificationPermission();
          if (token) {
            setFcmToken(token);
            // Send FCM token to server
            await chatService.updateFCMToken(token);
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload) => {
      console.log('Message received in foreground:', payload);
      // Handle the message (e.g., show notification, update UI)
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  const getBackLink = () => {
    if (user?.role === 'doctor') {
      return '/doctor/dashboard';
    } else if (user?.role === 'patient') {
      return '/patient/dashboard';
    }
    return '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link 
                to={getBackLink()} 
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <FiMessageCircle className="h-8 w-8 text-primary-500" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-600">
                  {user?.role === 'doctor' ? 'Chat with your patients' : 'Chat with your doctor'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {notificationPermission === 'granted' && fcmToken && (
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Notifications enabled</span>
                </div>
              )}
              
              {notificationPermission === 'denied' && (
                <div className="flex items-center text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Notifications disabled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg h-[600px] overflow-hidden"
        >
          <Chat />
        </motion.div>
      </main>
    </div>
  );
};

export default ChatPage;
