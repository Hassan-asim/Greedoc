import React from 'react'
import { FiPlus, FiPackage, FiClock, FiCheckCircle } from 'react-icons/fi'

export const Medications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600">Manage your medications and track adherence</p>
        </div>
        <button className="btn btn-primary btn-md">
          <FiPlus className="h-4 w-4 mr-2" />
          Add Medication
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <FiPackage className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Adherence Rate</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <FiClock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <FiPackage className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Missed Doses</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Medications</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-12">
            <FiPackage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications added yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your medications to track adherence</p>
            <button className="btn btn-primary btn-md">
              <FiPlus className="h-4 w-4 mr-2" />
              Add Your First Medication
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
