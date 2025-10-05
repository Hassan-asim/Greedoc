# Prescription System Documentation

## Overview

The prescription system allows doctors to create, manage, and track prescriptions for their patients. All prescription data is stored in Firebase Firestore and persists across page reloads.

## Features

### ✅ Patient Selection

- Doctors must select a patient before creating a prescription
- Patient selection modal shows all available patients
- Patient information is displayed in the sidebar

### ✅ Prescription Management

- Create new prescriptions with multiple medications
- Edit existing prescriptions
- Save prescriptions to Firebase database
- Prescription data persists across page reloads

### ✅ Medication Management

- Add multiple medications to a prescription
- Set dosage, frequency, duration, and instructions
- Remove medications from prescriptions
- Medication data is stored with the prescription

### ✅ Database Integration

- All prescription data is saved to Firebase Firestore
- Data persists across browser sessions
- Real-time updates when prescriptions are modified

## API Endpoints

### Prescriptions

- `GET /api/prescriptions` - Get user's prescriptions
- `GET /api/prescriptions/:id` - Get specific prescription
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `PUT /api/prescriptions/:id/status` - Update prescription status
- `DELETE /api/prescriptions/:id` - Delete prescription
- `GET /api/prescriptions/patient/:patientId` - Get patient's prescriptions
- `GET /api/prescriptions/active/:patientId` - Get active prescriptions

## Database Structure

### Prescription Document

```javascript
{
  id: "prescription-id",
  patientId: "patient-id",
  doctorId: "doctor-id",
  patientName: "Patient Name",
  doctorName: "Doctor Name",
  medications: [
    {
      id: "medication-id",
      name: "Medication Name",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "7 days",
      instructions: "Take with food",
      startDate: "2024-01-15",
      endDate: "2024-01-22"
    }
  ],
  notes: "Prescription notes",
  status: "draft|active|completed|cancelled",
  prescriptionDate: "2024-01-15T10:00:00Z",
  validUntil: "2024-02-15T10:00:00Z",
  followUpDate: "2024-01-22T10:00:00Z",
  diagnosis: "Diagnosis",
  allergies: ["Penicillin"],
  contraindications: ["Liver disease"],
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}
```

## Usage Flow

### 1. Doctor Creates Prescription

1. Doctor navigates to prescription module
2. Doctor selects a patient from the patient list
3. Doctor adds medications to the prescription
4. Doctor saves the prescription (data is stored in Firebase)

### 2. Prescription Persistence

- Prescription data is automatically saved to Firebase
- Data persists across page reloads
- Doctors can edit existing prescriptions
- All changes are saved to the database

### 3. Patient Access

- Patients can view their prescriptions
- Prescriptions are linked to specific patients
- Active prescriptions are easily accessible

## Testing

### Manual Testing

1. Start the server: `npm start`
2. Navigate to prescription module
3. Select a patient
4. Add medications
5. Save prescription
6. Reload the page - data should persist

### Automated Testing

Run the test script to verify Firebase integration:

```bash
cd server
node test-prescription.js
```

## Troubleshooting

### Common Issues

1. **Prescription data disappears on reload**

   - Ensure Firebase is properly configured
   - Check that prescriptions are being saved to the database
   - Verify the prescription service is working correctly

2. **Patient selection not working**

   - Ensure patients exist in the database
   - Check that the patient service is loading patients correctly
   - Verify the patient selection modal is properly implemented

3. **Medications not saving**
   - Check that medications are being added to the prescription object
   - Verify the save function is being called
   - Ensure Firebase is receiving the data

### Debug Steps

1. Check browser console for errors
2. Verify Firebase connection
3. Check network requests in browser dev tools
4. Run the test script to verify backend functionality

## Security

### Access Control

- Only doctors can create and edit prescriptions
- Patients can only view their own prescriptions
- All API endpoints require authentication
- Role-based access control is enforced

### Data Validation

- Required fields are validated on both frontend and backend
- Medication data is validated before saving
- Patient selection is required before creating prescriptions

## Future Enhancements

### Planned Features

- Prescription templates
- Medication interaction checking
- Prescription history tracking
- Automated refill reminders
- Integration with pharmacy systems
- Prescription printing functionality
