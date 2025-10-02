import React from 'react'
import { FiPlus, FiFileText, FiCalendar, FiActivity } from 'react-icons/fi'

export const HealthRecords: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600">Manage your health data and medical records</p>
        </div>
        <button className="btn btn-primary btn-md">
          <FiPlus className="h-4 w-4 mr-2" />
          Add Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FiActivity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <FiCalendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-2xl font-bold text-gray-900">2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Records</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-12">
            <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first health record</p>
            <button className="btn btn-primary btn-md">
              <FiPlus className="h-4 w-4 mr-2" />
              Add Your First Record
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
