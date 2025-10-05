import React, { useState, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
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
import { prescriptionService, Prescription, Medication } from '../services/prescriptionService'
import { followupService, CreateFollowUpData } from '../services/followupService'
import { useAuth } from '../contexts/AuthContext'
import patientService from '../services/patientService'


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
  const { id: prescriptionId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const location = useLocation()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showPatientSelection, setShowPatientSelection] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([])
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false)
  const [patientFollowUps, setPatientFollowUps] = useState<any[]>([])
  const [loadingFollowUps, setLoadingFollowUps] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showUploadReport, setShowUploadReport] = useState(false)
  const [showScheduleFollowup, setShowScheduleFollowup] = useState(false)
  const [followUpData, setFollowUpData] = useState<CreateFollowUpData>({
    patientId: '',
    patientName: '',
    prescriptionId: '',
    followUpDate: '',
    followUpTime: '',
    purpose: '',
    notes: '',
    priority: 'medium'
  })
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false)
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    startDate: '',
    endDate: ''
  })

  // Get patient from navigation state
  const patientFromState = (location.state as any)?.patient

  // Auto-select patient from navigation state
  useEffect(() => {
    if (patientFromState) {
      console.log('Patient passed from Doctor Dashboard:', patientFromState)
      setSelectedPatient(patientFromState)
      // Auto-populate prescription with patient info
      setPrescription(prev => prev ? ({
        ...prev,
        patientId: patientFromState.id,
        patientName: `${patientFromState.firstName} ${patientFromState.lastName}`
      }) : prev)
      // Load patient's existing prescriptions and follow-ups
      loadPatientPrescriptions(patientFromState.id)
      loadPatientFollowUps(patientFromState.id)
    }
  }, [patientFromState])

  // Load prescription data
  useEffect(() => {
    if (prescriptionId) {
      loadPrescription()
    } else {
      // Create new prescription
      const initialPrescription: Prescription = {
        id: '',
        patientId: patientFromState?.id || '',
        doctorId: user?._id || '',
        patientName: patientFromState ? `${patientFromState.firstName} ${patientFromState.lastName}` : '',
        doctorName: user ? `${user.firstName} ${user.lastName}` : '',
        medications: [],
        notes: '',
        status: 'draft' as const,
        prescriptionDate: new Date().toISOString(),
        allergies: [],
        contraindications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        isExpired: false,
        needsFollowUp: false
      }
      setPrescription(initialPrescription)
      loadPatients()
      setIsLoading(false)
    }
  }, [prescriptionId, user])

  const loadPatients = async () => {
    try {
      const patientsData = await patientService.getPatients()
      setPatients(Array.isArray(patientsData) ? patientsData : [])
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error('Failed to load patients')
    }
  }

  const loadPatientPrescriptions = async (patientId: string) => {
    try {
      setLoadingPrescriptions(true)
      const response = await prescriptionService.getPrescriptions({ patientId })
      setPatientPrescriptions(response.data.prescriptions || [])
      console.log('Loaded patient prescriptions:', response.data.prescriptions)
    } catch (error) {
      console.error('Error loading patient prescriptions:', error)
      toast.error('Failed to load patient prescriptions')
      setPatientPrescriptions([])
    } finally {
      setLoadingPrescriptions(false)
    }
  }

  const loadPatientFollowUps = async (patientId: string) => {
    try {
      setLoadingFollowUps(true)
      const response = await followupService.getPatientFollowUps(patientId)
      setPatientFollowUps(response.data.followUps || [])
      console.log('Loaded patient follow-ups:', response.data.followUps)
    } catch (error) {
      console.error('Error loading patient follow-ups:', error)
      toast.error('Failed to load patient follow-ups')
      setPatientFollowUps([])
    } finally {
      setLoadingFollowUps(false)
    }
  }

  const loadPrescription = async () => {
    try {
      setIsLoading(true)
      const response = await prescriptionService.getPrescription(prescriptionId!)
      setPrescription(response.data.prescription)
      
      // Load full patient data if patient is selected
      if (response.data.prescription.patientId) {
        try {
          const patientData = await patientService.getPatient(response.data.prescription.patientId)
          setSelectedPatient(patientData)
        } catch (error) {
          console.error('Error loading patient data:', error)
          // Don't show error to user as prescription can still be viewed
        }
      }
    } catch (error) {
      console.error('Error loading prescription:', error)
      toast.error('Failed to load prescription')
    } finally {
      setIsLoading(false)
    }
  }

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

    setPrescription(prev => prev ? ({
      ...prev,
      medications: [...prev.medications, medication]
    }) : null)

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
    setPrescription(prev => prev ? ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== medicationId)
    }) : null)
    toast.success('Medication removed')
  }

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient)
    setPrescription(prev => prev ? ({
      ...prev,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`
    }) : null)
    setShowPatientSelection(false)
    loadPatientPrescriptions(patient.id)
    loadPatientFollowUps(patient.id)
    toast.success(`Selected patient: ${patient.firstName} ${patient.lastName}`)
  }

  const handleSavePrescription = async () => {
    if (!prescription) return

    // Validate required fields
    if (!prescription.patientId || !prescription.patientName) {
      toast.error('Please select a patient first')
      setShowPatientSelection(true)
      return
    }

    if (prescription.medications.length === 0) {
      toast.error('Please add at least one medication')
      return
    }

    setIsSaving(true)
    try {
      console.log('=== FRONTEND PRESCRIPTION SAVE ===')
      console.log('Current prescription state:', prescription)
      
      if (prescription.id) {
        // Update existing prescription
        const updateData = {
          patientName: prescription.patientName,
          medications: prescription.medications,
          notes: prescription.notes,
          prescriptionDate: prescription.prescriptionDate ? new Date(prescription.prescriptionDate).toISOString() : undefined,
          validUntil: prescription.validUntil ? new Date(prescription.validUntil).toISOString() : undefined,
          followUpDate: prescription.followUpDate ? new Date(prescription.followUpDate).toISOString() : undefined,
          diagnosis: prescription.diagnosis,
          allergies: prescription.allergies,
          contraindications: prescription.contraindications
        }
        
        console.log('Update data being sent:', updateData)
        const response = await prescriptionService.updatePrescription(prescription.id, updateData)
        console.log('Update response received:', response)
        setPrescription(response.data.prescription)
        toast.success('Prescription updated successfully!')
      } else {
        // Create new prescription
        const createData = {
          patientId: prescription.patientId,
          patientName: prescription.patientName,
          medications: prescription.medications,
          notes: prescription.notes,
          prescriptionDate: prescription.prescriptionDate ? new Date(prescription.prescriptionDate).toISOString() : new Date().toISOString(),
          validUntil: prescription.validUntil ? new Date(prescription.validUntil).toISOString() : undefined,
          followUpDate: prescription.followUpDate ? new Date(prescription.followUpDate).toISOString() : undefined,
          diagnosis: prescription.diagnosis,
          allergies: prescription.allergies,
          contraindications: prescription.contraindications
        }
        
        console.log('Create data being sent:', createData)
        const response = await prescriptionService.createPrescription(createData)
        console.log('Create response received:', response)
        setPrescription(response.data.prescription)
        toast.success('Prescription created and saved to database!')
      }
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error saving prescription:', error)
      console.error('Error response:', error?.response)
      console.error('Error data:', error?.response?.data)
      toast.error(`Failed to save prescription: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadReport = () => {
    // Simulate file upload
    toast.success('Report uploaded successfully!')
    setShowUploadReport(false)
  }

  const handleViewHealthRecords = () => {
    // Navigate to health records page or show modal
    toast('Health records feature coming soon!', { icon: 'ℹ️' })
  }

  const handleScheduleFollowup = async () => {
    if (!followUpData.patientId || !followUpData.followUpDate || !followUpData.followUpTime || !followUpData.purpose) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSavingFollowUp(true)
    try {
      const response = await followupService.createFollowUp(followUpData)
      console.log('Follow-up created successfully:', response)
      toast.success('Follow-up scheduled successfully!')
      setShowScheduleFollowup(false)
      
      // Refresh follow-ups list
      if (selectedPatient) {
        loadPatientFollowUps(selectedPatient.id)
      }
      
      // Reset form
      setFollowUpData({
        patientId: '',
        patientName: '',
        prescriptionId: '',
        followUpDate: '',
        followUpTime: '',
        purpose: '',
        notes: '',
        priority: 'medium'
      })
    } catch (error: any) {
      console.error('Error creating follow-up:', error)
      toast.error(`Failed to schedule follow-up: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    } finally {
      setIsSavingFollowUp(false)
    }
  }

  const handleUpdateFollowUpStatus = async (followUpId: string, newStatus: string) => {
    try {
      await followupService.updateFollowUpStatus(followUpId, newStatus as any)
      toast.success(`Follow-up status updated to ${newStatus}`)
      
      // Refresh follow-ups list
      if (selectedPatient) {
        loadPatientFollowUps(selectedPatient.id)
      }
    } catch (error: any) {
      console.error('Error updating follow-up status:', error)
      toast.error(`Failed to update follow-up status: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    }
  }

  const handleDeletePrescription = async () => {
    if (!prescriptionToDelete) return

    setIsDeleting(true)
    try {
      await prescriptionService.deletePrescription(prescriptionToDelete)
      toast.success('Prescription deleted successfully!')
      
      // If we're deleting the current prescription, navigate back to dashboard
      if (prescription?.id === prescriptionToDelete) {
        window.location.href = '/doctor/dashboard'
      } else {
        // Otherwise, just refresh the prescription list
        if (selectedPatient) {
          loadPatientPrescriptions(selectedPatient.id)
        }
      }
      
      setShowDeleteConfirm(false)
      setPrescriptionToDelete(null)
    } catch (error: any) {
      console.error('Error deleting prescription:', error)
      toast.error(`Failed to delete prescription: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDeletePrescription = (prescriptionId: string) => {
    setPrescriptionToDelete(prescriptionId)
    setShowDeleteConfirm(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescription Not Found</h2>
          <p className="text-gray-600 mb-4">The prescription you're looking for doesn't exist.</p>
          <Link to="/doctor/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
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
                <p className="text-sm text-gray-600">
                  Patient: {prescription.patientName || 'No patient selected'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!prescription.patientId && (
                <button
                  onClick={() => setShowPatientSelection(true)}
                  className="btn btn-outline btn-md"
                >
                  <FiUser className="mr-2 h-4 w-4" />
                  Select Patient
                </button>
              )}
              {prescription.id && (
                <button
                  onClick={() => confirmDeletePrescription(prescription.id)}
                  className="btn btn-outline btn-md text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete
                </button>
              )}
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
                  disabled={!prescription.patientId}
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
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <FiPackage className="h-5 w-5 text-primary-500 mr-2" />
                            <h4 className="font-medium text-gray-900">{medication.name}</h4>
                            <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                              {medication.dosage}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
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
                            <div className="mt-2 text-sm text-gray-700">
                              <strong>Instructions:</strong> {medication.instructions}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-600">
                            <span>Start: {medication.startDate}</span>
                            {medication.endDate && <span className="ml-4">End: {medication.endDate}</span>}
                          </div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveMedication(medication.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                    onChange={(e) => setPrescription(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                    rows={4}
                    className="input w-full resize-none"
                    placeholder="Add any additional notes or instructions..."
                  />
                ) : (
                  <p className="text-gray-700">{prescription.notes || 'No notes added'}</p>
                )}
              </div>
            </div>

            {/* Patient Prescription History */}
            {selectedPatient && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="card-title">Patient Prescription History</h3>
                </div>
                <div className="card-content">
                  {loadingPrescriptions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading prescriptions...</p>
                    </div>
                  ) : patientPrescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No previous prescriptions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patientPrescriptions.map((presc) => (
                        <div
                          key={presc.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow relative group"
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              // Navigate to this prescription
                              window.location.href = `/prescription/${presc.id}`
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Prescription #{presc.id.slice(-6)}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(presc.prescriptionDate).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`badge ${
                                presc.status === 'active' ? 'badge-success' :
                                presc.status === 'draft' ? 'badge-warning' :
                                presc.status === 'completed' ? 'badge-secondary' : 'badge-error'
                              }`}>
                                {presc.status}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-700 mb-2">
                              <strong>Doctor:</strong> {presc.doctorName}
                            </div>
                            
                            <div className="text-sm text-gray-700">
                              <strong>Medications:</strong> {presc.medications.length} item(s)
                              <div className="ml-4 mt-1">
                                {presc.medications.slice(0, 3).map((med, idx) => (
                                  <div key={idx} className="text-gray-600">
                                    • {med.name} - {med.dosage}
                                  </div>
                                ))}
                                {presc.medications.length > 3 && (
                                  <div className="text-gray-500 text-xs mt-1">
                                    +{presc.medications.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {presc.diagnosis && (
                              <div className="text-sm text-gray-700 mt-2">
                                <strong>Diagnosis:</strong> {presc.diagnosis}
                              </div>
                            )}
                          </div>
                          
                          {/* Delete button - appears on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              confirmDeletePrescription(presc.id)
                            }}
                            className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete prescription"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient Follow-ups */}
            {selectedPatient && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="card-title">Scheduled Follow-ups</h3>
                </div>
                <div className="card-content">
                  {loadingFollowUps ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading follow-ups...</p>
                    </div>
                  ) : patientFollowUps.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No scheduled follow-ups found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patientFollowUps.map((followUp) => (
                        <div
                          key={followUp.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {followUp.purpose.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(followUp.followUpDate).toLocaleDateString()} at {followUp.followUpTime}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`badge ${
                                followUp.priority === 'urgent' ? 'badge-error' :
                                followUp.priority === 'high' ? 'badge-warning' :
                                followUp.priority === 'medium' ? 'badge-primary' : 'badge-secondary'
                              }`}>
                                {followUp.priority}
                              </span>
                              <span className={`badge ${
                                followUp.status === 'scheduled' ? 'badge-success' :
                                followUp.status === 'completed' ? 'badge-secondary' :
                                followUp.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                              }`}>
                                {followUp.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Doctor:</strong> {followUp.doctorName}
                          </div>
                          
                          {followUp.notes && (
                            <div className="text-sm text-gray-700 mb-2">
                              <strong>Notes:</strong> {followUp.notes}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>
                              Created: {new Date(followUp.createdAt).toLocaleDateString()}
                            </span>
                            {followUp.isToday && (
                              <span className="text-orange-600 font-medium">Today</span>
                            )}
                            {followUp.isUpcoming && !followUp.isToday && (
                              <span className="text-blue-600 font-medium">Upcoming</span>
                            )}
                            {followUp.isOverdue && (
                              <span className="text-red-600 font-medium">Overdue</span>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          {followUp.status === 'scheduled' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateFollowUpStatus(followUp.id, 'completed')}
                                className="btn btn-sm btn-success"
                              >
                                <FiCheck className="mr-1 h-3 w-3" />
                                Mark Complete
                              </button>
                              <button
                                onClick={() => handleUpdateFollowUpStatus(followUp.id, 'cancelled')}
                                className="btn btn-sm btn-outline"
                              >
                                <FiX className="mr-1 h-3 w-3" />
                                Cancel
                              </button>
                            </div>
                          )}
                          
                          {followUp.status === 'completed' && (
                            <div className="text-sm text-green-600 font-medium">
                              ✓ Completed
                            </div>
                          )}
                          
                          {followUp.status === 'cancelled' && (
                            <div className="text-sm text-red-600 font-medium">
                              ✗ Cancelled
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Patient Information</h3>
              </div>
              <div className="card-content">
                {prescription.patientId ? (
                  <>
                    <div className="flex items-center mb-4">
                      <FiUser className="h-5 w-5 text-primary-500 mr-2" />
                      <div>
                        <span className="font-medium text-gray-900">{prescription.patientName}</span>
                        {selectedPatient && (
                          <div className="text-xs text-gray-600 mt-1">
                            {selectedPatient.gender === 'male' ? '♂' : '♀'} {selectedPatient.gender?.charAt(0).toUpperCase() + selectedPatient.gender?.slice(1)}
                            {selectedPatient.dateOfBirth && (
                              <span className="ml-2">
                                Age: {Math.floor((new Date().getTime() - new Date(selectedPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">CNIC:</span>
                          <div className="font-medium text-gray-900">
                            {selectedPatient?.cnic || 'Not provided'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <div className="font-medium text-gray-900">
                            {selectedPatient?.phoneNumber || 'Not provided'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <div className="font-medium text-gray-900">
                          {selectedPatient?.email || 'Not provided'}
                        </div>
                      </div>
                      
                      {selectedPatient && (
                        <>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Date of Birth:</span>
                              <div className="font-medium text-gray-900">
                                {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <div className="font-medium">
                                <span className={`badge ${
                                  selectedPatient.status === 'active' ? 'badge-success' :
                                  selectedPatient.status === 'pending' ? 'badge-warning' : 'badge-secondary'
                                }`}>
                                  {selectedPatient.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {selectedPatient.lastVisit && (
                            <div>
                              <span className="text-gray-600">Last Visit:</span>
                              <div className="font-medium text-gray-900">
                                {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Medications:</span>
                              <div className="font-medium text-gray-900">
                                {selectedPatient.medications || 0}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Appointments:</span>
                              <div className="font-medium text-gray-900">
                                {selectedPatient.appointments || 0}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
                    <p className="text-gray-600 mb-4">Please select a patient to create a prescription</p>
                    <button
                      onClick={() => setShowPatientSelection(true)}
                      className="btn btn-primary"
                    >
                      Select Patient
                    </button>
                  </div>
                )}
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
                  <button 
                    onClick={() => {
                      if (selectedPatient) {
                        setFollowUpData(prev => ({
                          ...prev,
                          patientId: selectedPatient.id,
                          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
                          prescriptionId: prescription?.id || ''
                        }))
                      }
                      setShowScheduleFollowup(true)
                    }} 
                    className="btn btn-outline btn-sm w-full justify-start"
                  >
                    <FiCalendar className="mr-2 h-4 w-4" />
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            </div>

            {/* Prescription Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Prescription Details</h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`badge ${
                      prescription.status === 'active' ? 'badge-success' :
                      prescription.status === 'draft' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prescription Date:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(prescription.prescriptionDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {prescription.validUntil && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valid Until:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(prescription.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {prescription.followUpDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Follow-up:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(prescription.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Medications:</span>
                    <span className="text-sm text-gray-900">
                      {prescription.medications.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Doctor Information</h3>
              </div>
              <div className="card-content">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary-100 rounded-full">
                    <FiUser className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      {prescription.doctorName || 'Dr. Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Prescribing Doctor
                    </div>
                  </div>
                </div>
                
                {prescription.diagnosis && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">Diagnosis:</span>
                    <div className="text-sm text-gray-900 mt-1">
                      {prescription.diagnosis}
                    </div>
                  </div>
                )}
                
                {prescription.allergies && prescription.allergies.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">Allergies:</span>
                    <div className="text-sm text-gray-900 mt-1">
                      {prescription.allergies.join(', ')}
                    </div>
                  </div>
                )}
                
                {prescription.contraindications && prescription.contraindications.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">Contraindications:</span>
                    <div className="text-sm text-gray-900 mt-1">
                      {prescription.contraindications.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Medication</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Prescription</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete this prescription? All associated medications and notes will be permanently removed.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setPrescriptionToDelete(null)
                }}
                disabled={isDeleting}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePrescription}
                disabled={isDeleting}
                className="btn bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete Prescription
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Lab Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select className="input w-full">
                  <option value="">Select report type</option>
                  <option value="blood">Blood Test</option>
                  <option value="urine">Urine Test</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI</option>
                  <option value="ct">CT Scan</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, PNG, JPG up to 10MB</p>
                </div>
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

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadReport(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadReport}
                className="btn btn-primary"
              >
                <FiUpload className="mr-2 h-4 w-4" />
                Upload Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showScheduleFollowup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Follow-up</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={followUpData.patientName}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date *
                </label>
                <input
                  type="date"
                  className="input w-full"
                  min={new Date().toISOString().split('T')[0]}
                  value={followUpData.followUpDate}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Time *
                </label>
                <input
                  type="time"
                  className="input w-full"
                  value={followUpData.followUpTime}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, followUpTime: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose *
                </label>
                <select 
                  className="input w-full"
                  value={followUpData.purpose}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, purpose: e.target.value }))}
                >
                  <option value="">Select purpose</option>
                  <option value="medication_review">Medication Review</option>
                  <option value="symptom_check">Symptom Check</option>
                  <option value="test_results">Test Results Review</option>
                  <option value="general_followup">General Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select 
                  className="input w-full"
                  value={followUpData.priority}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  className="input w-full h-20"
                  placeholder="Additional notes for the follow-up appointment..."
                  value={followUpData.notes}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowScheduleFollowup(false)
                  setFollowUpData({
                    patientId: '',
                    patientName: '',
                    prescriptionId: '',
                    followUpDate: '',
                    followUpTime: '',
                    purpose: '',
                    notes: '',
                    priority: 'medium'
                  })
                }}
                disabled={isSavingFollowUp}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleFollowup}
                disabled={isSavingFollowUp}
                className="btn btn-primary"
              >
                {isSavingFollowUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <FiCalendar className="mr-2 h-4 w-4" />
                    Schedule Follow-up
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Selection Modal */}
      {showPatientSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Patient</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {patients.length === 0 ? (
                <div className="text-center py-8">
                  <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                  <p className="text-gray-600 mb-4">You need to add patients first</p>
                  <Link to="/doctor/dashboard" className="btn btn-primary">
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex items-start">
                      <div className="p-2 bg-primary-100 rounded-full">
                        <FiUser className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          <span className={`badge text-xs ${
                            patient.status === 'active' ? 'badge-success' :
                            patient.status === 'pending' ? 'badge-warning' : 'badge-secondary'
                          }`}>
                            {patient.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{patient.email}</p>
                          <p>CNIC: {patient.cnic || 'Not provided'}</p>
                          <p>Phone: {patient.phoneNumber || 'Not provided'}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>
                            {patient.gender === 'male' ? '♂' : '♀'} {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1)}
                            {patient.dateOfBirth && (
                              <span className="ml-2">
                                Age: {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                              </span>
                            )}
                          </span>
                          <div className="flex space-x-3">
                            <span>Med: {patient.medications || 0}</span>
                            <span>App: {patient.appointments || 0}</span>
                          </div>
                        </div>
                        
                        {patient.lastVisit && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPatientSelection(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
