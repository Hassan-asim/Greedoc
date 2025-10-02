# Greedoc – Your AI-powered Health Companion

A comprehensive health management platform that leverages AI to provide personalized health insights, medication tracking, and wellness recommendations.

## 🏗️ Project Structure

```
greedoc/
├── client/                 # Frontend React Application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # CSS/styling files
│   │   └── assets/        # Images, icons, etc.
│   ├── package.json
│   └── .env
├── server/                # Backend Node.js Application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.js           # Express app setup
│   ├── server.js        # Server entry point
│   ├── package.json
│   └── .env
├── docs/                 # Documentation
├── tests/               # Test files
├── .gitignore
└── README.md
```

## 🚀 Features

- **AI Health Insights**: Personalized health recommendations using AI
- **Medication Tracking**: Smart medication reminders and tracking
- **Health Monitoring**: Track vital signs and health metrics
- **Appointment Management**: Schedule and manage medical appointments
- **Health Reports**: Generate comprehensive health reports
- **User Dashboard**: Personalized health dashboard
- **Secure Authentication**: Secure user authentication and authorization

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- React Query
- Chart.js

### Backend
- Node.js
- Express.js
- Firebase Firestore
- Firebase Admin SDK
- JWT Authentication
- Bcrypt
- CORS
- Helmet

### AI Integration
- OpenAI API
- Health data analysis
- Personalized recommendations

## 📋 Prerequisites

- Node.js (v18 or higher)
- Firebase project
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd greedoc
```

### 2. Install dependencies

#### Quick Setup (Windows)
```bash
setup.bat
```

#### Quick Setup (Linux/Mac)
```bash
chmod +x setup.sh
./setup.sh
```

#### Manual Setup
```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 3. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Generate service account key

2. **Configure Service Account**
   - Download service account JSON file
   - Rename it to `firebase-service-account.json`
   - Place it in the `server` directory

3. **Environment Setup**

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
VITE_APP_NAME=Greedoc
VITE_APP_VERSION=1.0.0
```

### 4. Install Dependencies

#### Quick Install (Windows)
```bash
install-dependencies.bat
```

#### Manual Install
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 5. Start the Application

#### Quick Start (Windows)
```bash
start-app.bat
```

#### Manual Start
```bash
# Terminal 1 - Backend Server
cd server
npm run dev

# Terminal 2 - Frontend Server
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 API Documentation

API documentation is available at `/api/docs` when the server is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🚀 Deployment Options

### Vercel Deployment (Recommended for Frontend)

1. **Deploy Frontend to Vercel:**
   ```bash
   cd client
   npx vercel --prod
   ```

2. **Deploy Backend to Vercel:**
   ```bash
   cd server
   npx vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Add all environment variables from `.env` files

### Google Cloud Run Deployment

1. **Build and Deploy:**
   ```bash
   # Build the backend
   gcloud builds submit --config cloudbuild.yaml
   ```

2. **Set Environment Variables:**
   ```bash
   gcloud run services update greedoc-backend \
     --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=greedoc"
   ```

### Other Deployment Options

- **Netlify** (Frontend only)
- **Railway** (Full-stack)
- **Heroku** (Full-stack)
- **DigitalOcean App Platform** (Full-stack)

## 🆘 Support

For support, email support@greedoc.com or create an issue in the repository.
