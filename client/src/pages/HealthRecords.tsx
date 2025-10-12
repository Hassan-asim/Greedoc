import React, { useState } from 'react'
import { FiPlus, FiFileText, FiCalendar, FiActivity, FiEdit3 } from 'react-icons/fi'
import HealthDataDisplay from '../components/HealthDataDisplay'
import HealthDataForm from '../components/HealthDataForm'
import { HealthData } from '../services/healthDataService'

export const HealthRecords: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingData, setEditingData] = useState<HealthData | null>(null)

  const handleAddRecord = () => {
    setEditingData(null)
    setShowForm(true)
  }

  const handleEditRecord = () => {
    setShowForm(true)
  }

  const handleFormSuccess = (data: HealthData) => {
    setEditingData(data)
    setShowForm(false)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingData(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingData ? 'Edit Health Data' : 'Add Health Data'}
            </h1>
            <p className="text-gray-600">
              {editingData ? 'Update your health metrics' : 'Record your health metrics'}
            </p>
          </div>
        </div>

        <HealthDataForm
          initialData={editingData}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600">Manage your health data and medical records</p>
        </div>
        <button 
          onClick={handleAddRecord}
          className="btn btn-primary btn-md"
        >
          <FiPlus className="h-4 w-4 mr-2" />
          Add Health Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Health Metrics</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FiActivity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-2xl font-bold text-gray-900">Today</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <FiCalendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-2xl font-bold text-gray-900">Active</p>
            </div>
          </div>
        </div>
      </div>

      <HealthDataDisplay
        onEdit={handleEditRecord}
        showEditButton={true}
      />
    </div>
  )
}

