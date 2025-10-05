import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSave,
  FiUpload,
  FiPackage,
  FiClock,
  FiCalendar,
  FiUser,
  FiFileText,
  FiCheck,
  FiX
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { appointmentAPI, healthAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  startDate: string
  endDate: string
}

interface Prescription {
  id: string
  patientId: string
  patientName: string
  medications: Medication[]
  notes: string
  createdAt: string
  status: 'draft' | 'active' | 'completed'
}

const mockPrescription: Prescription = {
  id: '1',
  patientId: '1',
  patientName: 'Ahmed Ali',
  medications: [
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '30 days',
      instructions: 'Take with food',
      startDate: '2024-01-15',
      endDate: '2024-02-14'
    }
  ],
  notes: 'Monitor blood sugar levels regularly',
  createdAt: '2024-01-15T10:00:00Z',
  status: 'active'
}

const dosageSuggestions = [
  '250mg', '500mg', '750mg', '1000mg', '5mg', '10mg', '20mg', '50mg'
]

const frequencyOptions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'As needed'
]

const durationOptions = [
  '7 days',
  '14 days',
  '30 days',
  '60 days',
  '90 days',
  '6 months',
  '1 year',
  'Ongoing'
]

export const PrescriptionModule: React.FC = () => {
  const { user } = useAuth()
  const [prescription, setPrescription] = useState<Prescription>(mockPrescription)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showUploadReport, setShowUploadReport] = useState(false)
  const [showHealthRecords, setShowHealthRecords] = useState(false)
  const [showScheduleFollowup, setShowScheduleFollowup] = useState(false)
  const [healthRecords, setHealthRecords] = useState<any[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [reportType, setReportType] = useState('')
  const [reportNotes, setReportNotes] = useState('')
  const [followupData, setFollowupData] = useState({
    title: 'Follow-up Appointment',
    date: '',
    time: '',
    notes: ''
  })
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    startDate: '',
    endDate: ''
  })

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) {
      toast.error('Please fill in all required fields')
      return
    }

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      duration: newMedication.duration || '30 days',
      instructions: newMedication.instructions || '',
      startDate: newMedication.startDate || new Date().toISOString().split('T')[0],
      endDate: newMedication.endDate || ''
    }

    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, medication]
    }))

    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      startDate: '',
      endDate: ''
    })
    setShowAddMedication(false)
    toast.success('Medication added successfully')
  }

  const handleRemoveMedication = (medicationId: string) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== medicationId)
    }))
    toast.success('Medication removed')
  }

  const handleSavePrescription = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving prescription:', prescription)
      toast.success('Prescription saved successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to save prescription')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadReport = async () => {
    if (!uploadFile) {
      toast.error('Please select a file')
      return
    }
    try {
      // In production, upload file to server
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Report uploaded successfully!')
      setShowUploadReport(false)
      setUploadFile(null)
      setReportType('')
      setReportNotes('')
    } catch (error) {
      toast.error('Failed to upload report')
    }
  }

  const handleViewHealthRecords = async () => {
    try {
      setShowHealthRecords(true)
      setLoadingRecords(true)
      const res = await healthAPI.getRecords({ userId: prescription.patientId })
      setHealthRecords(res.data.data.records || [])
    } catch (e: any) {
      toast.error('Failed to load health records')
    } finally {
      setLoadingRecords(false)
    }
  }

  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dateTime = `${followupData.date}T${followupData.time}:00`
      await appointmentAPI.createAppointment({
        title: followupData.title,
        date: dateTime,
        provider: {
          name: user?.firstName + ' ' + user?.lastName || 'Dr.',
          type: 'doctor'
        },
        notes: followupData.notes,
        userId: prescription.patientId
      })
      toast.success('Follow-up appointment scheduled!')
      setShowScheduleFollowup(false)
      setFollowupData({ title: 'Follow-up Appointment', date: '', time: '', notes: '' })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to schedule follow-up')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/doctor/dashboard" className="mr-4 p-2 text-gray-600 hover:text-gray-900">
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <FiPackage className="h-8 w-8 text-primary-500" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Prescription Module</h1>
                <p className="text-sm text-gray-600">Patient: {prescription.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline btn-md"
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePrescription}
                    disabled={isSaving}
                    className="btn btn-primary btn-md"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-4 w-4" />
                        Save Prescription
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary btn-md"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Edit Prescription
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Medications List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">Medications</h3>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddMedication(true)}
                      className="btn btn-outline btn-sm"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Add Medication
                    </button>
                  )}
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {prescription.medications.map((medication) => (
                    <div
                      key={medication.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <FiPackage className="h-5 w-5 text-primary-500 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{medication.name}</h4>
                            <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full dark:bg-primary-900 dark:text-primary-200">
                              {medication.dosage}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <FiClock className="h-4 w-4 mr-2" />
                              {medication.frequency}
                            </div>
                            <div className="flex items-center">
                              <FiCalendar className="h-4 w-4 mr-2" />
                              {medication.duration}
                            </div>
                          </div>
                          {medication.instructions && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <strong>Instructions:</strong> {medication.instructions}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            <span>Start: {medication.startDate}</span>
                            {medication.endDate && <span className="ml-4">End: {medication.endDate}</span>}
                          </div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveMedication(medication.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="card mt-6">
              <div className="card-header">
                <h3 className="card-title">Prescription Notes</h3>
              </div>
              <div className="card-content">
                {isEditing ? (
                  <textarea
                    value={prescription.notes}
                    onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="input w-full resize-none"
                    placeholder="Add any additional notes or instructions..."
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">{prescription.notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Patient Information</h3>
              </div>
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <FiUser className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{prescription.patientName}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>CNIC: 12345-1234567-1</div>
                  <div>Phone: +92 300 1234567</div>
                  <div>Email: ahmed@example.com</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <button
                    onClick={() => setShowUploadReport(true)}
                    className="btn btn-outline btn-sm w-full justify-start"
                  >
                    <FiUpload className="mr-2 h-4 w-4" />
                    Upload Lab Report
                  </button>
                  <button onClick={handleViewHealthRecords} className="btn btn-outline btn-sm w-full justify-start">
                    <FiFileText className="mr-2 h-4 w-4" />
                    View Health Records
                  </button>
                  <button onClick={() => setShowScheduleFollowup(true)} className="btn btn-outline btn-sm w-full justify-start">
                    <FiCalendar className="mr-2 h-4 w-4" />
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            </div>

            {/* Prescription Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Prescription Status</h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`badge ${
                      prescription.status === 'active' ? 'badge-success' :
                      prescription.status === 'draft' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Medications:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {prescription.medications.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Lab Report Modal */}
      {showUploadReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Lab Report for {prescription.patientName}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Report Type</label>
                <select className="input w-full" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="">Select type</option>
                  <option value="lab">Lab Report</option>
                  <option value="imaging">Imaging Report</option>
                  <option value="pathology">Pathology Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Report File</label>
                <input type="file" className="input w-full" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Notes</label>
                <textarea className="input w-full" rows={3} value={reportNotes} onChange={e => setReportNotes(e.target.value)} placeholder="Additional notes..." />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button className="btn btn-outline" onClick={() => setShowUploadReport(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUploadReport}>Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Health Records Modal */}
      {showHealthRecords && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Health Records for {prescription.patientName}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowHealthRecords(false)}>Close</button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {loadingRecords ? (
                <div className="text-center py-8 text-gray-500">Loading records...</div>
              ) : healthRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No health records found.</div>
              ) : (
                <div className="space-y-3">
                  {healthRecords.map((record: any) => (
                    <div key={record.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{record.title || 'Untitled'}</div>
                          <div className="text-sm text-gray-600">{record.recordType || 'general'}</div>
                          {record.description && <div className="text-sm text-gray-500 mt-1">{record.description}</div>}
                          <div className="text-xs text-gray-400 mt-1">{new Date(record.date).toLocaleDateString()}</div>
                        </div>
                        <span className={`badge ${record.recordType === 'appointment' ? 'badge-primary' : record.recordType === 'lab' ? 'badge-warning' : 'badge-secondary'}`}>
                          {record.recordType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showScheduleFollowup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Follow-up for {prescription.patientName}</h3>
            <form onSubmit={handleScheduleFollowup} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Appointment Title</label>
                <input required className="input w-full" value={followupData.title} onChange={e => setFollowupData({...followupData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Date</label>
                  <input required type="date" className="input w-full" value={followupData.date} onChange={e => setFollowupData({...followupData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Time</label>
                  <input required type="time" className="input w-full" value={followupData.time} onChange={e => setFollowupData({...followupData, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Notes</label>
                <textarea className="input w-full" rows={3} value={followupData.notes} onChange={e => setFollowupData({...followupData, notes: e.target.value})} placeholder="Follow-up details..." />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowScheduleFollowup(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Add Medication</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter medication name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dosage *
                </label>
                <select
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select dosage</option>
                  {dosageSuggestions.map(dosage => (
                    <option key={dosage} value={dosage}>{dosage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency *
                </label>
                <select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <select
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select duration</option>
                  {durationOptions.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instructions
                </label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                  className="input w-full resize-none"
                  placeholder="Special instructions..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddMedication(false)}
                className="btn btn-outline btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedication}
                className="btn btn-primary btn-md"
              >
                <FiCheck className="mr-2 h-4 w-4" />
                Add Medication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
