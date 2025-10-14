# 🚀 Greedoc Deployment Guide

This guide will help you deploy Greedoc to Google Cloud Run and Firebase Hosting using GitHub Actions.

## 📋 Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Firebase Project** (same as Google Cloud Project)
3. **GitHub Repository** with your code
4. **Google Cloud Service Account** with necessary permissions

## 🔧 Setup Steps

### Step 1: Google Cloud Setup

1. **Create a Google Cloud Project** (if not already created)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note your Project ID

2. **Enable Required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   gcloud iam service-accounts create greedoc-deploy \
     --display-name="Greedoc Deploy Service Account"
   ```

4. **Grant Permissions**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:greedoc-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/cloudbuild.builds.builder"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:greedoc-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:greedoc-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

5. **Create and Download Service Account Key**
   ```bash
   gcloud iam service-accounts keys create greedoc-deploy-key.json \
     --iam-account=greedoc-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

### Step 2: Firebase Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init hosting
   ```

4. **Create Firebase Service Account**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Download the JSON file

### Step 3: GitHub Secrets Setup

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

1. **GCP_PROJECT_ID**: Your Google Cloud Project ID
2. **GCP_SA_KEY**: Content of the `greedoc-deploy-key.json` file
3. **FIREBASE_PROJECT_ID**: Your Firebase Project ID
4. **FIREBASE_SERVICE_ACCOUNT**: Content of the Firebase service account JSON file

### Step 4: Environment Variables

Create a `.env.production` file in your repository root:

```env
# Production Environment Variables
NODE_ENV=production
PORT=5000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d

# AI API Keys
OPENAI_API_KEY=your-openai-api-key
GLM_API_KEY=your-glm-api-key
GROQ_API_KEY=your-groq-api-key

# Client URL (will be updated after deployment)
CLIENT_URL=https://your-firebase-hosting-url.web.app
VITE_API_URL=https://your-cloud-run-url.run.app/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
```

### Step 5: Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to GitHub Actions tab in your repository
   - Watch the deployment progress
   - Check for any errors

3. **Update Environment Variables**
   - After deployment, get your Cloud Run URL
   - Update `VITE_API_URL` in your environment variables
   - Update `CLIENT_URL` with your Firebase Hosting URL

## 🔍 Verification

### Backend (Cloud Run)
- Health check: `https://your-service-url.run.app/api/health-check`
- Should return: `{"status":"success","message":"Greedoc API is running"}`

### Frontend (Firebase Hosting)
- Visit your Firebase Hosting URL
- Check if the app loads correctly
- Test authentication and API calls

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check GitHub Actions logs
   - Verify all dependencies are in package.json
   - Ensure Dockerfile is correct

2. **Permission Errors**
   - Verify service account permissions
   - Check IAM roles are correctly assigned

3. **Environment Variables**
   - Ensure all required environment variables are set
   - Check Firebase configuration

4. **CORS Issues**
   - Update CORS settings in server
   - Verify CLIENT_URL is correct

### Useful Commands

```bash
# Check Cloud Run logs
gcloud run services logs read greedoc-backend --region=us-central1

# Check Firebase Hosting
firebase hosting:channel:list

# Test locally
npm run dev
```

## 📊 Monitoring

1. **Google Cloud Console**
   - Cloud Run → Services → greedoc-backend
   - Monitor requests, errors, and performance

2. **Firebase Console**
   - Hosting → Monitor traffic and performance
   - Firestore → Monitor database usage

3. **GitHub Actions**
   - Monitor deployment status
   - Check for any failed deployments

## 🔄 Continuous Deployment

The deployment is set up to automatically trigger on:
- Push to `main` branch
- Pull requests to `main` branch

To manually trigger deployment:
1. Go to GitHub Actions
2. Select "Deploy to Google Cloud Run and Firebase Hosting"
3. Click "Run workflow"

## 📝 Notes

- The backend runs on Google Cloud Run (serverless)
- The frontend is hosted on Firebase Hosting
- Database is Firebase Firestore
- Authentication is handled by Firebase Auth
- All deployments are automated via GitHub Actions

## 🆘 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify all secrets are correctly set
3. Ensure your Google Cloud project has billing enabled
4. Check Firebase project configuration
