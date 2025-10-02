import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
  FiClock
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

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ahmed Ali',
    cnic: '12345-1234567-1',
    phone: '+92 300 1234567',
    email: 'ahmed@example.com',
    lastVisit: '2024-01-15',
    status: 'active',
    medications: 3,
    appointments: 2
  },
  {
    id: '2',
    name: 'Fatima Khan',
    cnic: '12345-1234567-2',
    phone: '+92 301 2345678',
    email: 'fatima@example.com',
    lastVisit: '2024-01-10',
    status: 'pending',
    medications: 2,
    appointments: 1
  },
  {
    id: '3',
    name: 'Muhammad Hassan',
    cnic: '12345-1234567-3',
    phone: '+92 302 3456789',
    email: 'hassan@example.com',
    lastVisit: '2024-01-05',
    status: 'active',
    medications: 4,
    appointments: 3
  }
]

export const DoctorDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showAddPatient, setShowAddPatient] = useState(false)

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cnic.includes(searchTerm)
  )

  const stats = {
    totalPatients: mockPatients.length,
    activePatients: mockPatients.filter(p => p.status === 'active').length,
    pendingReports: 5,
    todayAppointments: 3
  }

  return (
    <div className="min-h-screen bg-secondary-100">
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
                              <h4 className="font-medium text-gray-900">{patient.name}</h4>
                              <p className="text-sm text-gray-600">{patient.cnic}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiPhone className="h-4 w-4 mr-1" />
                              {patient.phone}
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
                          <span className="font-medium">{selectedPatient.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CNIC:</span>
                          <span className="font-medium">{selectedPatient.cnic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedPatient.phone}</span>
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
                        <button className="btn btn-outline btn-sm w-full justify-start">
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
    </div>
  )
}
