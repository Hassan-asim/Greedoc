import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { DoctorLogin } from './pages/DoctorLogin'
import { PatientLogin } from './pages/PatientLogin'
import { DoctorDashboard } from './pages/DoctorDashboard'
import { PatientDashboard } from './pages/PatientDashboard'
import { VirtualDoctor } from './pages/VirtualDoctor'
import { Calendar } from './pages/Calendar'
import { HealthTwin } from './pages/HealthTwin'
import { PrescriptionModule } from './pages/PrescriptionModule'
import { Dashboard } from './pages/Dashboard'
import { HealthRecords } from './pages/HealthRecords'
import { Medications } from './pages/Medications'
import { Appointments } from './pages/Appointments'
import { AIInsights } from './pages/AIInsights'
import { Profile } from './pages/Profile'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/virtual-doctor" element={<VirtualDoctor />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/health-twin" element={<HealthTwin />} />
            <Route path="/prescription" element={<PrescriptionModule />} />
        
        {/* Protected routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="health-records" element={<HealthRecords />} />
          <Route path="medications" element={<Medications />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    )
  }

export default App
