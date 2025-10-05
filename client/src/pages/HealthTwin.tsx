import React, { useState } from 'react'
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
  FiZap
} from 'react-icons/fi'
import toast from 'react-hot-toast'

interface HealthData {
  id: string
  type: 'steps' | 'heart_rate' | 'sleep' | 'blood_pressure' | 'weight' | 'temperature'
  value: number | string
  unit: string
  timestamp: string
  notes?: string
}

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

const mockRecentData: HealthData[] = [
  {
    id: '1',
    type: 'steps',
    value: 8542,
    unit: 'steps',
    timestamp: '2024-01-15T08:00:00Z',
    notes: 'Morning walk'
  },
  {
    id: '2',
    type: 'heart_rate',
    value: 72,
    unit: 'bpm',
    timestamp: '2024-01-15T08:30:00Z'
  },
  {
    id: '3',
    type: 'sleep',
    value: 7.5,
    unit: 'hours',
    timestamp: '2024-01-15T07:00:00Z',
    notes: 'Good sleep quality'
  }
]

export const HealthTwin: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null)
  const [inputValue, setInputValue] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newData: HealthData = {
        id: Date.now().toString(),
        type: selectedMetric.type,
        value: selectedMetric.type === 'blood_pressure' ? inputValue : parseFloat(inputValue),
        unit: selectedMetric.unit,
        timestamp: new Date().toISOString(),
        notes: notes || undefined
      }

      console.log('Saving health data:', newData)
      toast.success('Health data saved successfully!')
      
      // Reset form
      setSelectedMetric(null)
      setInputValue('')
      setNotes('')
    } catch (error) {
      toast.error('Failed to save health data')
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/patient/dashboard" className="mr-4 p-2 text-gray-600 hover:text-gray-900">
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <FiZap className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Health Twin</h1>
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
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <IconComponent className={`h-6 w-6 ${metric.color} mr-3`} />
                          <div>
                            <h4 className="font-medium text-gray-900">{metric.label}</h4>
                            <p className="text-sm text-gray-600">{metric.unit}</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value ({selectedMetric.unit})
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={decrementValue}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
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
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Range: {selectedMetric.min} - {selectedMetric.max} {selectedMetric.unit}
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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

                    {/* Save Button */}
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !inputValue}
                      className="btn btn-primary btn-md w-full"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2 h-4 w-4" />
                          Save Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-content text-center py-12">
                  <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Metric</h3>
                  <p className="text-gray-600">Choose a health metric from the left to start logging your data.</p>
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
                <div className="space-y-3">
                  {mockRecentData.map((data) => {
                    const IconComponent = getMetricIcon(data.type)
                    return (
                      <div
                        key={data.id}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <IconComponent className={`h-5 w-5 ${getMetricColor(data.type)} mr-3`} />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {data.value} {data.unit}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(data.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(data.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {data.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{data.notes}"
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
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
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiTrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">7-Day Trend</h4>
                  <p className="text-sm text-gray-600">Chart will be displayed here</p>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">30-Day Trend</h4>
                  <p className="text-sm text-gray-600">Chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
