# Firebase Setup Guide

## Step 1: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/greedoc)
2. Click the gear icon (⚙️) → "Project settings"
3. Go to "Service accounts" tab
4. Click "Generate new private key"
5. Download the JSON file

## Step 2: Update Environment Variables

Copy the values from your downloaded service account JSON file to your `.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=greedoc
FIREBASE_DATABASE_URL=https://greedoc-default-rtdb.firebaseio.com/
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-from-json\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@greedoc.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40greedoc.iam.gserviceaccount.com
```

## Step 3: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to you
5. Click "Done"

## Step 4: Test Connection

Run the application and check the console for:
```
✅ Connected to Firebase
```

If you see this message, Firebase is configured correctly!

## Security Rules (Optional)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /healthRecords/{recordId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /medications/{medicationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```
