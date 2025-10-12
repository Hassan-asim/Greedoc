const admin = require("firebase-admin");
const path = require("path");

// Try to load Firebase credentials from JSON file first, then fall back to environment variables
let firebaseConfig;
let db, rtdb, messaging;

try {
  // Try to load from JSON file
  const serviceAccountPath = path.join(
    __dirname,
    "..",
    "..",
    "greedoc-firebase-adminsdk-fbsvc-8a8305fd6b.json"
  );
  const serviceAccount = require(serviceAccountPath);

  firebaseConfig = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://greedoc-default-rtdb.firebaseio.com/",
  };

  console.log("✅ Using Firebase service account JSON file");
} catch (error) {
  console.log("⚠️ JSON file not found, trying environment variables...");

  // Check if we have the required environment variables
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    firebaseConfig = {
      credential: admin.credential.cert({
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || "greedoc",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri:
          process.env.FIREBASE_AUTH_URI ||
          "https://accounts.google.com/o/oauth2/auth",
        token_uri:
          process.env.FIREBASE_TOKEN_URI ||
          "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      }),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://greedoc-default-rtdb.firebaseio.com/",
    };
  } else {
    console.log("⚠️ Firebase credentials not found, using mock mode");
    firebaseConfig = null;
  }
}

// Initialize Firebase Admin SDK only if we have valid config
if (firebaseConfig) {
  try {
    admin.initializeApp(firebaseConfig);

    // Get Firestore instance
    db = admin.firestore();

    // Get Realtime Database instance (if needed)
    rtdb = admin.database();

    // Get FCM instance for push notifications
    messaging = admin.messaging();

    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.log(
      "⚠️ Firebase initialization failed, using mock mode:",
      error.message
    );
    db = null;
    rtdb = null;
    messaging = null;
  }
} else {
  console.log("⚠️ No Firebase config available, using mock mode");
  db = null;
  rtdb = null;
  messaging = null;
}

module.exports = {
  admin,
  db,
  rtdb,
  messaging,
};
