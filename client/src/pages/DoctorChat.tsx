import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Chat from '../components/Chat';

const DoctorChat: React.FC = () => {
  const { user } = useAuth();

  // Redirect if not a doctor
  if (user && user.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to doctors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Chat</h1>
          <p className="text-gray-600 mt-2">Chat with your assigned patients</p>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default DoctorChat;
