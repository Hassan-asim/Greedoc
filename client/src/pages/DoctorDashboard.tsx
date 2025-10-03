import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReportUpload from '../components/ReportUpload'
import patientService from '../services/patientService'
import toast from 'react-hot-toast'
import { 
  FiPlus, 
  FiSearch, 
  FiUsers, 
  FiFileText, 
  FiCalendar, 
  FiTrendingUp,
  FiUser,
  FiPhone,
  FiMail,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPackage,
  FiClock,
  FiMessageCircle
} from 'react-icons/fi'

interface Patient {
  id: string
  name: string
  cnic: string
  phone: string
  email: string
  lastVisit: string
  status: 'active' | 'pending' | 'inactive'
  medications: number
  appointments: number
}

// Real patients will be loaded from the database

export const DoctorDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showUploadReport, setShowUploadReport] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    cnic: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'male'
  })
  const [showCredentials, setShowCredentials] = useState(false)
  const [patientCredentials, setPatientCredentials] = useState<any>(null)

  // Load patients from database
  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const patientsData = await patientService.getPatients()
      setPatients(patientsData)
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleShowCredentials = async (patientId: string) => {
    try {
      const response = await patientService.getPatientCredentials(patientId)
      setPatientCredentials(response)
      setShowCredentials(true)
    } catch (error) {
      console.error('Error fetching credentials:', error)
      toast.error('Failed to fetch patient credentials')
    }
  }

  const handleResetPassword = async (patientId: string) => {
    try {
      const response = await patientService.resetPatientPassword(patientId)
      setPatientCredentials(response)
      toast.success('Password reset successfully!')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Failed to reset password')
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const patientData = {
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        email: newPatient.email,
        phoneNumber: newPatient.phone,
        cnic: newPatient.cnic,
        dateOfBirth: newPatient.dateOfBirth,
        gender: newPatient.gender
      }
      
      const response = await patientService.createPatient(patientData)
      toast.success('Patient created successfully!')
      
      // Show credentials modal
      setPatientCredentials(response)
      setShowCredentials(true)
      
      // Reset form
      setNewPatient({
        firstName: '',
        lastName: '',
        cnic: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        gender: 'male'
      })
      setShowAddPatient(false)
      // Reload patients
      loadPatients()
    } catch (error) {
      console.error('Error adding patient:', error)
      toast.error('Failed to create patient')
    }
  }

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cnic?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === 'active').length,
    pendingReports: 5,
    todayAppointments: 3
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FiUsers className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Doctor Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddPatient(true)}
                className="btn btn-primary btn-md inline-flex items-center"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Patient
              </button>
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiUsers className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activePatients}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <FiFileText className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Patient List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">Patients</h3>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="card-content">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading patients...</div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first patient</p>
                    <button
                      onClick={() => setShowAddPatient(true)}
                      className="btn btn-primary"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Add First Patient
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary-100 rounded-full">
                              <FiUser className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</h4>
                              <p className="text-sm text-gray-600">{patient.cnic || 'No CNIC'}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiPhone className="h-4 w-4 mr-1" />
                              {patient.phoneNumber || 'No phone'}
                            </div>
                            <div className="flex items-center">
                              <FiMail className="h-4 w-4 mr-1" />
                              {patient.email}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            <span className={`badge ${
                              patient.status === 'active' ? 'badge-success' : 
                              patient.status === 'pending' ? 'badge-warning' : 'badge-secondary'
                            }`}>
                              {patient.status}
                            </span>
                            <span className="text-gray-500">Last visit: {patient.lastVisit}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="lg:col-span-1">
            {selectedPatient ? (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Patient Details</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-6">
                    {/* Patient Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CNIC:</span>
                          <span className="font-medium">{selectedPatient.cnic || 'No CNIC'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedPatient.phoneNumber || 'No phone'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedPatient.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`badge ${
                            selectedPatient.status === 'active' ? 'badge-success' : 
                            selectedPatient.status === 'pending' ? 'badge-warning' : 'badge-secondary'
                          }`}>
                            {selectedPatient.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <Link to="/prescription" className="btn btn-outline btn-sm w-full justify-start">
                          <FiPackage className="mr-2 h-4 w-4" />
                          Manage Medications
                        </Link>
                        <button 
                          onClick={() => setShowUploadReport(true)}
                          className="btn btn-outline btn-sm w-full justify-start"
                        >
                          <FiFileText className="mr-2 h-4 w-4" />
                          Upload Report
                        </button>
                        <button className="btn btn-outline btn-sm w-full justify-start">
                          <FiCalendar className="mr-2 h-4 w-4" />
                          Schedule Appointment
                        </button>
                        <button className="btn btn-outline btn-sm w-full justify-start">
                          <FiEye className="mr-2 h-4 w-4" />
                          View Health Records
                        </button>
                        <button 
                          onClick={() => handleShowCredentials(selectedPatient.id)}
                          className="btn btn-outline btn-sm w-full justify-start"
                        >
                          <FiEdit className="mr-2 h-4 w-4" />
                          View Credentials
                        </button>
                        <Link to="/chat" className="btn btn-outline btn-sm w-full justify-start">
                          <FiMessageCircle className="mr-2 h-4 w-4" />
                          Chat with Patients
                        </Link>
                      </div>
                    </div>

                    {/* Health Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Health Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Medications:</span>
                          <span className="font-medium">{selectedPatient.medications}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Upcoming Appointments:</span>
                          <span className="font-medium">{selectedPatient.appointments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Visit:</span>
                          <span className="font-medium">{selectedPatient.lastVisit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-content text-center py-12">
                  <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-gray-600">Choose a patient from the list to view their details and manage their care.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Patient</h3>
            
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                    className="input w-full"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                    className="input w-full"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNIC
                </label>
                <input
                  type="text"
                  required
                  value={newPatient.cnic}
                  onChange={(e) => setNewPatient({...newPatient, cnic: e.target.value})}
                  className="input w-full"
                  placeholder="12345-1234567-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                  className="input w-full"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                  className="input w-full"
                  placeholder="patient@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    className="input w-full"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Medical Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient
                </label>
                <select className="input w-full">
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select className="input w-full">
                  <option value="">Select report type</option>
                  <option value="lab">Lab Report</option>
                  <option value="imaging">Imaging Report</option>
                  <option value="pathology">Pathology Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report File
                </label>
                <ReportUpload
                  onUpload={setUploadedFile}
                  onRemove={() => setUploadedFile(null)}
                  uploadedFile={uploadedFile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="input w-full h-20"
                  placeholder="Add any additional notes about this report..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowUploadReport(false)
                  setUploadedFile(null)
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Handle report upload
                  console.log('Uploading report...')
                  setShowUploadReport(false)
                  setUploadedFile(null)
                }}
                disabled={!uploadedFile}
                className="btn btn-primary disabled:opacity-50"
              >
                Upload Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Credentials Modal */}
      {showCredentials && patientCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Credentials</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Login Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{patientCredentials.firstName} {patientCredentials.lastName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{patientCredentials.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">CNIC:</span>
                    <span className="ml-2 font-medium">{patientCredentials.cnic}</span>
                  </div>
                  {patientCredentials.generatedPassword && (
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <span className="text-gray-600">Generated Password:</span>
                      <div className="mt-1 font-mono text-lg font-bold text-yellow-800 bg-yellow-100 p-2 rounded">
                        {patientCredentials.generatedPassword}
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Please share this password with the patient securely
                      </p>
                    </div>
                  )}
                  {patientCredentials.newPassword && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <span className="text-gray-600">New Password:</span>
                      <div className="mt-1 font-mono text-lg font-bold text-green-800 bg-green-100 p-2 rounded">
                        {patientCredentials.newPassword}
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Password has been reset successfully
                      </p>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="text-gray-600">Login URL:</span>
                    <div className="mt-1 text-blue-600 break-all">
                      {patientCredentials.loginUrl || 'http://localhost:3000/patient/login'}
                    </div>
                  </div>
                </div>
              </div>

              {patientCredentials.message && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">{patientCredentials.message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCredentials(false)
                  setPatientCredentials(null)
                }}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleResetPassword(patientCredentials.id)}
                className="btn btn-primary"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
