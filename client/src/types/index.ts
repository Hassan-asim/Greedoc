export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phoneNumber?: string;
  cnic?: string;
  dateOfBirth?: string;
  gender?: string;
  status?: 'active' | 'pending' | 'inactive';
  lastVisit?: string;
  medications?: number;
  appointments?: number;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cnic: string;
  dateOfBirth: string;
  gender: string;
  status: 'active' | 'pending' | 'inactive';
  lastVisit: string;
  medications: number;
  appointments: number;
}

export interface PatientCredentials {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cnic: string;
  generatedPassword?: string;
  newPassword?: string;
  loginUrl?: string;
  message?: string;
}

export interface PatientData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cnic: string;
  dateOfBirth: string;
  gender: string;
}
