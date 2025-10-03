# Greedoc – Your AI-Powered Health Companion

<div align="center">

![Greedoc Logo](https://img.shields.io/badge/Greedoc-Health%20Companion-blue?style=for-the-badge&logo=medical-cross)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase)

A comprehensive health management platform that leverages AI to provide personalized health insights, real-time doctor-patient communication, and intelligent health monitoring.

</div>

## 🌟 Features

### 🏥 **Dual Portal System**
- **Doctor Dashboard**: Patient management, health monitoring, AI insights
- **Patient Dashboard**: Health tracking, medication reminders, virtual consultations

### 🤖 **AI-Powered Health Assistant**
- **Virtual Doctor**: GLM-powered AI for health consultations
- **Health Insights**: Personalized recommendations based on health data
- **Smart Notifications**: Proactive health alerts and reminders

### 💬 **Real-Time Communication**
- **Doctor-Patient Chat**: Secure messaging with FCM notifications
- **File Sharing**: Report and document sharing
- **Online Status**: Real-time presence indicators

### 📊 **Health Management**
- **Health Metrics**: Track vital signs and health indicators
- **Medication Tracking**: Smart reminders and adherence monitoring
- **Report Upload**: Secure document and image sharing
- **Calendar Integration**: Appointment scheduling and management

### 🔒 **Security & Privacy**
- **JWT Authentication**: Secure user authentication
- **Firebase Security**: Enterprise-grade data protection
- **Encrypted Communication**: End-to-end message encryption
- **Privacy Controls**: Granular data sharing preferences

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App] --> B[Doctor Portal]
        A --> C[Patient Portal]
        B --> D[Dashboard]
        B --> E[Patient Management]
        B --> F[Chat Interface]
        C --> G[Health Tracking]
        C --> H[Virtual Doctor]
        C --> I[Appointments]
    end
    
    subgraph "Backend Layer"
        J[Express.js API] --> K[Authentication]
        J --> L[Patient Routes]
        J --> M[Chat Routes]
        J --> N[AI Routes]
        J --> O[Health Routes]
    end
    
    subgraph "Database Layer"
        P[Firebase Firestore] --> Q[Users Collection]
        P --> R[Chats Collection]
        P --> S[Health Records]
        P --> T[Appointments]
    end
    
    subgraph "External Services"
        U[GLM API] --> V[AI Health Assistant]
        W[Firebase FCM] --> X[Push Notifications]
        Y[Firebase Auth] --> Z[User Authentication]
    end
    
    A --> J
    J --> P
    J --> U
    J --> W
    J --> Y
```

## 🔄 User Flow Diagram

```mermaid
flowchart TD
    A[User Visits App] --> B{User Type?}
    B -->|Doctor| C[Doctor Login]
    B -->|Patient| D[Patient Login]
    
    C --> E[Doctor Dashboard]
    D --> F[Patient Dashboard]
    
    E --> G[Manage Patients]
    E --> H[View Health Data]
    E --> I[Chat with Patients]
    E --> J[AI Insights]
    
    F --> K[Track Health Metrics]
    F --> L[Chat with Doctor]
    F --> M[Virtual Doctor]
    F --> N[View Appointments]
    
    G --> O[Add New Patient]
    G --> P[View Patient Details]
    G --> Q[Reset Patient Password]
    
    H --> R[Health Analytics]
    H --> S[Risk Alerts]
    
    I --> T[Real-time Messaging]
    I --> U[File Sharing]
    
    J --> V[AI Recommendations]
    J --> W[Health Predictions]
    
    K --> X[Blood Pressure]
    K --> Y[Heart Rate]
    K --> Z[Sleep Patterns]
    
    L --> T
    M --> AA[AI Consultation]
    M --> BB[Health Advice]
    
    N --> CC[Schedule Appointment]
    N --> DD[View Calendar]
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Socket.IO** - Real-time communication
- **Firebase SDK** - Authentication and messaging

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase Admin SDK** - Database and authentication
- **Socket.IO** - Real-time communication
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Database & Services
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Cloud Messaging** - Push notifications
- **GLM API** - AI health assistant
- **OpenAI API** - AI capabilities (optional)

## 📁 Project Structure

```
greedoc/
├── client/                     # React Frontend
│   ├── public/                # Static assets
│   │   └── firebase-messaging-sw.js
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Chat.tsx
│   │   │   ├── EmergencyMode.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ReportUpload.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── VirtualDoctor.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   └── ...
│   │   ├── services/         # API services
│   │   │   ├── api.ts
│   │   │   ├── aiService.js
│   │   │   ├── chatService.js
│   │   │   └── patientService.js
│   │   ├── contexts/         # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── config/           # Configuration
│   │   │   └── firebase.js
│   │   └── index.css         # Global styles
│   ├── package.json
│   └── vite.config.ts
├── server/                    # Node.js Backend
│   ├── config/               # Configuration files
│   │   └── firebase.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── HealthRecord.js
│   │   └── Medication.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── chat.js
│   │   ├── ai.js
│   │   └── ...
│   ├── services/             # Business logic
│   │   └── healthAgent.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js
│   ├── server.js            # Server entry point
│   └── package.json
├── docs/                     # Documentation
│   ├── API.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
├── setup/                    # Setup files
│   ├── env.example
│   ├── env-template.txt
│   └── SETUP_GUIDE.md
├── .gitignore
├── requirements.txt
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### 1. Clone the Repository
```bash
git clone https://github.com/Hassan-asim/Greedoc.git
cd Greedoc
```

### 2. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Environment Setup
1. Copy `setup/env.example` to `.env` in the root directory
2. Fill in your Firebase and API credentials
3. Place your Firebase service account JSON file in the root directory

### 4. Start the Application
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Firebase Configuration
FIREBASE_PROJECT_ID=greedoc
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@greedoc.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url

# AI Configuration
GLM_API_KEY=your_glm_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
GLM_MODEL=glm-4
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key

# Client Configuration
CLIENT_URL=http://localhost:3000

# Health Agent Configuration
HEALTH_AGENT_ENABLED=true
NOTIFICATION_INTERVAL=300000
```

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project named "greedoc"
   - Enable Firestore Database
   - Enable Authentication

2. **Generate Service Account**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file
   - Rename to `greedoc-firebase-adminsdk-fbsvc-8a8305fd6b.json`
   - Place in the root directory

3. **Configure Firestore Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 📊 Database Schema

```mermaid
erDiagram
    USERS {
        string id PK
        string firstName
        string lastName
        string email
        string password
        string role
        string phoneNumber
        date dateOfBirth
        string gender
        object address
        object emergencyContact
        object medicalInfo
        object preferences
        string avatar
        boolean isEmailVerified
        string fcmToken
        boolean isOnline
        datetime createdAt
        datetime updatedAt
    }
    
    CHATS {
        string id PK
        string senderId FK
        string receiverId FK
        string message
        datetime timestamp
        boolean read
        string type
        string fileUrl
        string fileName
    }
    
    HEALTH_RECORDS {
        string id PK
        string patientId FK
        string type
        object data
        string notes
        datetime recordedAt
        string doctorId FK
    }
    
    MEDICATIONS {
        string id PK
        string patientId FK
        string name
        string dosage
        string frequency
        datetime startDate
        datetime endDate
        boolean isActive
    }
    
    APPOINTMENTS {
        string id PK
        string patientId FK
        string doctorId FK
        datetime scheduledAt
        string status
        string notes
        string type
    }
    
    USERS ||--o{ CHATS : sends
    USERS ||--o{ CHATS : receives
    USERS ||--o{ HEALTH_RECORDS : has
    USERS ||--o{ MEDICATIONS : takes
    USERS ||--o{ APPOINTMENTS : schedules
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Patients
- `GET /api/patients` - Get all patients (Doctor only)
- `POST /api/patients` - Create new patient (Doctor only)
- `GET /api/patients/:id` - Get patient details
- `GET /api/patients/:id/credentials` - Get patient credentials
- `POST /api/patients/:id/reset-password` - Reset patient password

### Chat
- `POST /api/chat/message` - Send message
- `GET /api/chat/rooms` - Get chat rooms
- `GET /api/chat/messages/:receiverId` - Get messages
- `POST /api/chat/register-fcm-token` - Register FCM token

### AI
- `POST /api/ai/chat` - Chat with virtual doctor
- `POST /api/ai/insight` - Get health insights

### Health
- `GET /api/health/metrics` - Get health metrics
- `POST /api/health/metrics` - Add health metric
- `GET /api/health/records` - Get health records

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Run all tests
npm run test:all
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd client
npx vercel --prod
```

### Google Cloud Run (Backend)
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Docker
```bash
docker-compose up -d
```

## 📈 Performance Monitoring

```mermaid
graph LR
    A[User Request] --> B[Load Balancer]
    B --> C[Frontend CDN]
    B --> D[API Gateway]
    D --> E[Backend Services]
    E --> F[Firebase Firestore]
    E --> G[AI Services]
    E --> H[FCM Service]
    
    I[Monitoring] --> J[Error Tracking]
    I --> K[Performance Metrics]
    I --> L[User Analytics]
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Express-validator middleware
- **CORS Protection** - Configured for specific origins
- **Helmet Security** - Security headers
- **Firebase Rules** - Database-level security
- **Rate Limiting** - API request throttling
- **Data Encryption** - Sensitive data encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commits
- Ensure code passes linting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/Hassan-asim/Greedoc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Hassan-asim/Greedoc/discussions)
- **Email**: support@greedoc.com

## 🙏 Acknowledgments

- Firebase for backend services
- GLM for AI capabilities
- React community for excellent libraries
- All contributors and testers

---

<div align="center">

**Made with ❤️ for better healthcare**

[⭐ Star this repo](https://github.com/Hassan-asim/Greedoc) | [🐛 Report Bug](https://github.com/Hassan-asim/Greedoc/issues) | [💡 Request Feature](https://github.com/Hassan-asim/Greedoc/issues)

</div>