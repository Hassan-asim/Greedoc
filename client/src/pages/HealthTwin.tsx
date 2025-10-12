import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiArrowLeft,
  FiActivity,
  FiHeart,
  FiClock,
  FiTrendingUp,
  FiSave,
  FiPlus,
  FiMinus,
  FiCalendar,
  FiZap,
  FiTrash2,
  FiEdit
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { healthDataService, HealthData, CreateHealthDataData } from '../services/healthDataService'
import { useAuth } from '../contexts/AuthContext'

// HealthData interface is now imported from healthDataService

interface HealthMetric {
  type: 'steps' | 'heart_rate' | 'sleep' | 'blood_pressure' | 'weight' | 'temperature'
  label: string
  icon: React.ComponentType<any>
  unit: string
  min: number
  max: number
  step: number
  color: string
}

const healthMetrics: HealthMetric[] = [
  {
    type: 'steps',
    label: 'Steps',
    icon: FiActivity,
    unit: 'steps',
    min: 0,
    max: 50000,
    step: 100,
    color: 'text-blue-600'
  },
  {
    type: 'heart_rate',
    label: 'Heart Rate',
    icon: FiHeart,
    unit: 'bpm',
    min: 40,
    max: 200,
    step: 1,
    color: 'text-red-600'
  },
  {
    type: 'sleep',
    label: 'Sleep Duration',
    icon: FiClock,
    unit: 'hours',
    min: 0,
    max: 24,
    step: 0.5,
    color: 'text-purple-600'
  },
  {
    type: 'blood_pressure',
    label: 'Blood Pressure',
    icon: FiTrendingUp,
    unit: 'mmHg',
    min: 80,
    max: 200,
    step: 1,
    color: 'text-green-600'
  },
  {
    type: 'weight',
    label: 'Weight',
    icon: FiActivity,
    unit: 'kg',
    min: 30,
    max: 200,
    step: 0.1,
    color: 'text-orange-600'
  },
  {
    type: 'temperature',
    label: 'Body Temperature',
    icon: FiTrendingUp,
    unit: '°C',
    min: 35,
    max: 42,
    step: 0.1,
    color: 'text-yellow-600'
  }
]

// Mock data removed - now using real API data

export const HealthTwin: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth()
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null)
  const [inputValue, setInputValue] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [recentData, setRecentData] = useState<HealthData[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [editingData, setEditingData] = useState<HealthData | null>(null)

  // Load recent health data on component mount
  useEffect(() => {
    if (user && !authLoading) {
      loadRecentData()
    }
  }, [user, authLoading])

  const loadRecentData = async () => {
    try {
      setLoadingData(true)
      
      // Check if user is authenticated
      if (!user) {
        console.error('User not authenticated')
        toast.error('Please log in to view health data')
        return
      }
      
      console.log('Loading recent health data for user:', user._id)
      const response = await healthDataService.getRecentHealthData(10)
      console.log('Health data response:', response)
      console.log('Health data entries:', response.data.healthData)
      
      // Debug timestamp handling
      if (response.data.healthData && response.data.healthData.length > 0) {
        console.log('Timestamp debugging:')
        response.data.healthData.forEach((entry, index) => {
          console.log(`Entry ${index + 1}:`, {
            type: entry.type,
            value: entry.value,
            timestamp: entry.timestamp,
            timestampType: typeof entry.timestamp,
            isDate: entry.timestamp instanceof Date,
            dateString: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : new Date(entry.timestamp).toISOString()
          })
        })
      }
      
      setRecentData(response.data.healthData || [])
    } catch (error: any) {
      console.error('Error loading recent health data:', error)
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        // Redirect to login
        window.location.href = '/login'
      } else {
        toast.error('Failed to load recent health data')
      }
    } finally {
      setLoadingData(false)
    }
  }

  const handleMetricSelect = (metric: HealthMetric) => {
    setSelectedMetric(metric)
    setInputValue('')
    setNotes('')
  }

  const handleValueChange = (value: string) => {
    setInputValue(value)
  }

  const incrementValue = () => {
    if (selectedMetric && inputValue) {
      const currentValue = parseFloat(inputValue)
      const newValue = currentValue + selectedMetric.step
      if (newValue <= selectedMetric.max) {
        setInputValue(newValue.toString())
      }
    }
  }

  const decrementValue = () => {
    if (selectedMetric && inputValue) {
      const currentValue = parseFloat(inputValue)
      const newValue = currentValue - selectedMetric.step
      if (newValue >= selectedMetric.min) {
        setInputValue(newValue.toString())
      }
    }
  }

  const handleSave = async () => {
    if (!selectedMetric || !inputValue) {
      toast.error('Please select a metric and enter a value')
      return
    }

    setIsSaving(true)
    try {
      const now = new Date();
      const healthData: CreateHealthDataData = {
        type: selectedMetric.type,
        value: selectedMetric.type === 'blood_pressure' ? inputValue : parseFloat(inputValue),
        unit: selectedMetric.unit,
        timestamp: now.toISOString(),
        notes: notes || undefined
      }
      
      console.log('Saving health data with timestamp:', {
        timestamp: healthData.timestamp,
        timestampType: typeof healthData.timestamp,
        now: now.toISOString()
      })

      console.log('User info:', {
        id: user._id,
        role: user.role,
        email: user.email
      })

      if (editingData) {
        // Update existing data
        console.log('Updating existing health data:', editingData.id)
        await healthDataService.updateHealthData(editingData.id, healthData)
        toast.success('Health data updated successfully!')
      } else {
        // Create new data
        console.log('Creating new health data:', healthData)
        const response = await healthDataService.createHealthData(healthData)
        console.log('Health data creation response:', response)
        toast.success('Health data saved successfully!')
      }
      
      // Reset form and reload data
      setSelectedMetric(null)
      setInputValue('')
      setNotes('')
      setEditingData(null)
      console.log('Reloading data after save...')
      await loadRecentData()
    } catch (error: any) {
      console.error('Error saving health data:', error)
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      })
      toast.error(`Failed to save health data: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const getMetricIcon = (type: string) => {
    const metric = healthMetrics.find(m => m.type === type)
    return metric ? metric.icon : FiActivity
  }

  const getMetricColor = (type: string) => {
    const metric = healthMetrics.find(m => m.type === type)
    return metric ? metric.color : 'text-gray-600'
  }

  const handleEditData = (data: HealthData) => {
    const metric = healthMetrics.find(m => m.type === data.type)
    if (metric) {
      setSelectedMetric(metric)
      setInputValue(data.value.toString())
      setNotes(data.notes || '')
      setEditingData(data)
    }
  }

  const handleDeleteData = async (data: HealthData) => {
    if (!confirm('Are you sure you want to delete this health data entry?')) {
      return
    }

    try {
      await healthDataService.deleteHealthData(data.id)
      toast.success('Health data deleted successfully!')
      await loadRecentData()
    } catch (error: any) {
      console.error('Error deleting health data:', error)
      toast.error(`Failed to delete health data: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    }
  }

  const handleCancelEdit = () => {
    setSelectedMetric(null)
    setInputValue('')
    setNotes('')
    setEditingData(null)
  }

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FiZap className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Authentication Required</h1>
          <p className="text-black mb-4">Please log in to access your health data.</p>
          <Link to="/login" className="btn btn-primary btn-md">
            Go to Login
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
              <Link to="/patient/dashboard" className="mr-4 p-2 text-black hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <FiZap className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-2xl font-bold text-black dark:text-white">Health Twin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/virtual-doctor" className="btn btn-outline btn-md">
                Ask AI Doctor
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Metrics Selection */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Log Health Data</h3>
                <p className="card-description">Select a metric to log your health data</p>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {healthMetrics.map((metric) => {
                    const IconComponent = metric.icon
                    return (
                      <button
                        key={metric.type}
                        onClick={() => handleMetricSelect(metric)}
                        className={`w-full p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                          selectedMetric?.type === metric.type
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <IconComponent className={`h-6 w-6 ${metric.color} mr-3`} />
                          <div>
                            <h4 className="font-medium text-black dark:text-white">{metric.label}</h4>
                            <p className="text-sm text-black dark:text-gray-300">{metric.unit}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Data Entry Form */}
          <div className="lg:col-span-1">
            {selectedMetric ? (
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center">
                    <selectedMetric.icon className={`h-6 w-6 ${selectedMetric.color} mr-3`} />
                    <div>
                      <h3 className="card-title">{selectedMetric.label}</h3>
                      <p className="card-description">Enter your {selectedMetric.label.toLowerCase()} data</p>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <div className="space-y-6">
                    {/* Value Input */}
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray-200 mb-2">
                        Value ({selectedMetric.unit})
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={decrementValue}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <FiMinus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={inputValue}
                          onChange={(e) => handleValueChange(e.target.value)}
                          min={selectedMetric.min}
                          max={selectedMetric.max}
                          step={selectedMetric.step}
                          className="input flex-1 text-center"
                          placeholder={`${selectedMetric.min} - ${selectedMetric.max}`}
                        />
                        <button
                          onClick={incrementValue}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-black dark:text-gray-300 mt-1">
                        Range: {selectedMetric.min} - {selectedMetric.max} {selectedMetric.unit}
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray-200 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="Add any additional notes..."
                      />
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !inputValue}
                        className="btn btn-primary btn-md flex-1"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {editingData ? 'Updating...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <FiSave className="mr-2 h-4 w-4" />
                            {editingData ? 'Update Data' : 'Save Data'}
                          </>
                        )}
                      </button>
                      {editingData && (
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="btn btn-outline btn-md"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-content text-center py-12">
                  <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">Select a Metric</h3>
                  <p className="text-black dark:text-gray-300">Choose a health metric from the left to start logging your data.</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Data */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Data</h3>
                <p className="card-description">Your latest health entries</p>
              </div>
              <div className="card-content">
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-black mt-2">Loading health data...</p>
                  </div>
                ) : recentData.length === 0 ? (
                  <div className="text-center py-8">
                    <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-black dark:text-white mb-2">No Health Data Yet</h3>
                    <p className="text-black dark:text-gray-300">Start logging your health data to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentData.map((data) => {
                      const IconComponent = getMetricIcon(data.type)
                      return (
                        <div
                          key={data.id}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <IconComponent className={`h-5 w-5 ${getMetricColor(data.type)} mr-3`} />
                              <div>
                                <h4 className="font-medium text-black dark:text-white">
                                  {data.value} {data.unit}
                                </h4>
                                <p className="text-sm text-gray-800 dark:text-gray-300">
                                  {data.timestamp instanceof Date 
                                    ? data.timestamp.toLocaleDateString() 
                                    : new Date(data.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <p className="text-xs text-gray-800 dark:text-gray-300">
                                  {data.timestamp instanceof Date 
                                    ? data.timestamp.toLocaleTimeString() 
                                    : new Date(data.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEditData(data)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Edit"
                                >
                                  <FiEdit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteData(data)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          {data.notes && (
                            <p className="text-sm text-gray-800 dark:text-gray-300 mt-2 italic">
                              "{data.notes}"
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trend Charts Placeholder */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Health Trends</h3>
              <p className="card-description">7-day and 30-day views of your health data</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiTrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-black dark:text-white mb-2">7-Day Trend</h4>
                  <p className="text-sm text-gray-800 dark:text-gray-300">Chart will be displayed here</p>
                </div>
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-black dark:text-white mb-2">30-Day Trend</h4>
                  <p className="text-sm text-gray-800 dark:text-gray-300">Chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
