import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAsOF47uDVB1_bocWnpD8IHnVFD_6GOwXY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "greedoc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "greedoc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "greedoc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "631441516405",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:631441516405:web:e96e6603528100c10d153c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-045F5FKR3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BHn7tsnOmHaZ0IpabqydqFQqM6qyVV89bSUSE1pr_YygV_U5qJAJDnIs5veChHx4gZcY4jBegcOY8H6Dz3SW0GA"
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

export { messaging };
export default app;
