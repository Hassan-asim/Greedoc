# Greedoc API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /auth/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  }
}
```

### Health Records

#### GET /health/records
Get user's health records.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)
- `type` (optional): Filter by record type
- `startDate` (optional): Filter records from date
- `endDate` (optional): Filter records to date

#### POST /health/records
Create a new health record.

**Request Body:**
```json
{
  "recordType": "vital_signs",
  "title": "Blood Pressure Reading",
  "description": "Morning blood pressure check",
  "date": "2024-01-15T10:00:00Z",
  "provider": {
    "name": "Dr. Smith",
    "type": "doctor"
  },
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80,
      "unit": "mmHg"
    }
  }
}
```

#### GET /health/vitals
Get user's vital signs records.

#### POST /health/vitals
Record new vital signs.

**Request Body:**
```json
{
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": {
      "value": 72
    },
    "temperature": {
      "value": 98.6
    }
  },
  "date": "2024-01-15T10:00:00Z"
}
```

### Medications

#### GET /medications
Get user's medications.

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)
- `page` (optional): Page number
- `limit` (optional): Records per page

#### POST /medications
Add a new medication.

**Request Body:**
```json
{
  "name": "Lisinopril",
  "dosage": {
    "value": 10,
    "unit": "mg",
    "form": "tablet"
  },
  "frequency": {
    "timesPerDay": 1,
    "schedule": [
      {
        "time": "08:00",
        "withMeal": "after"
      }
    ]
  },
  "startDate": "2024-01-01",
  "prescribedBy": {
    "name": "Dr. Smith",
    "type": "doctor"
  },
  "purpose": "Blood pressure management"
}
```

#### GET /medications/reminders/due
Get medications due for reminder.

#### POST /medications/:id/taken
Mark medication as taken.

**Request Body:**
```json
{
  "date": "2024-01-15T08:00:00Z",
  "notes": "Taken with breakfast"
}
```

### Appointments

#### GET /appointments
Get user's appointments.

#### POST /appointments
Create a new appointment.

**Request Body:**
```json
{
  "title": "Annual Checkup",
  "date": "2024-02-15T10:00:00Z",
  "provider": {
    "name": "Dr. Smith",
    "type": "doctor",
    "contact": {
      "phone": "+1234567890",
      "email": "dr.smith@clinic.com"
    }
  },
  "description": "Annual physical examination"
}
```

#### GET /appointments/upcoming
Get upcoming appointments.

**Query Parameters:**
- `limit` (optional): Number of appointments to return

### AI Insights

#### POST /ai/health-insights
Get AI-powered health insights.

**Request Body:**
```json
{
  "query": "How can I improve my blood pressure?",
  "context": {
    "recentSymptoms": ["headaches", "fatigue"]
  }
}
```

#### POST /ai/medication-analysis
Analyze medication interactions and provide insights.

#### POST /ai/symptom-checker
AI-powered symptom analysis.

**Request Body:**
```json
{
  "symptoms": [
    {
      "name": "headache",
      "severity": "moderate",
      "duration": "2 days"
    }
  ],
  "duration": "2 days",
  "additionalInfo": "Started after stress at work"
}
```

#### GET /ai/health-summary
Generate AI-powered health summary.

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per IP address.
