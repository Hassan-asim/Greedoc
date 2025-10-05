import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { EmergencyMode } from '../components/EmergencyMode'
import { 
  FiHeart, 
  FiActivity, 
  FiClock, 
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiPackage,
  FiZap,
  FiPlus,
  FiEye,
  FiEdit,
  FiMessageCircle,
} from 'react-icons/fi'
import { medicationAPI } from '../services/api'
import { healthDataService } from '../services/healthDataService'
import toast from 'react-hot-toast'

interface HealthMetric {
  id: string
  type: 'steps' | 'heart_rate' | 'sleep' | 'blood_pressure' | 'weight' | 'temperature'
  value: string
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  timestamp: string
  notes?: string
}

interface RiskAlert {
  id: string
  type: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  timestamp: string
}

interface AIInsight {
  id: string
  title: string
  description: string
  type: 'recommendation' | 'prediction' | 'reminder'
  priority: 'high' | 'medium' | 'low'
}

// Real data will be loaded from the database

export const PatientDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth()
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null)
  const [showEmergencyMode, setShowEmergencyMode] = useState(false)
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([])
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [showMedReminders, setShowMedReminders] = useState(false)
  const [dueMedications, setDueMedications] = useState<any[]>([])
  const [loadingDue, setLoadingDue] = useState(false)

  // Debug authentication state
  useEffect(() => {
    console.log('PatientDashboard auth state:', {
      user: user ? { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } : null,
      authLoading,
      hasToken: !!localStorage.getItem('token')
    })
  }, [user, authLoading])

  useEffect(() => {
    if (user && !authLoading) {
      loadPatientData()
    }
  }, [user, authLoading])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      console.log('Loading patient data for user:', user)
      
      // Load real health data from the database
      const healthDataResponse = await healthDataService.getRecentHealthData(10)
      console.log('Health data response:', healthDataResponse)
      
      // Extract the actual data array from the response
      // The response structure is: { status: 'success', data: { healthData: [...], pagination: {...} } }
      let healthDataArray = []
      
      if (healthDataResponse.data && healthDataResponse.data.healthData) {
        healthDataArray = healthDataResponse.data.healthData
      } else if (Array.isArray(healthDataResponse.data)) {
        healthDataArray = healthDataResponse.data
      } else {
        console.log('Unexpected response structure:', healthDataResponse.data)
        healthDataArray = []
      }
      
      console.log('Health data array:', healthDataArray)
      console.log('Array length:', healthDataArray.length)
      
      // Transform health data to health metrics format
      const realHealthMetrics: HealthMetric[] = Array.isArray(healthDataArray) ? healthDataArray.map((data: any) => ({
        id: data.id,
        type: data.type,
        value: data.value.toString(),
        unit: data.unit,
        trend: 'stable', // TODO: Calculate trend based on historical data
        status: getHealthStatus(data.type, data.value),
        timestamp: formatTimeAgo(data.timestamp),
        notes: data.notes
      })) : []

      console.log('Transformed health metrics:', realHealthMetrics)

      // Generate AI insights based on health data
      const aiInsights: AIInsight[] = generateAIInsights(realHealthMetrics)

      setHealthMetrics(realHealthMetrics)
      setRiskAlerts([])
      setAIInsights(aiInsights)
      
      // Show success message if data was loaded
      if (realHealthMetrics.length > 0) {
        toast.success(`Loaded ${realHealthMetrics.length} health data entries`)
      } else {
        toast('No health data found. Start logging your health metrics!', { icon: 'ℹ️' })
      }
    } catch (error: any) {
      console.error('Error loading patient data:', error)
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        // Redirect to login
        window.location.href = '/patient/login'
        return
      }
      
      // Show error message for other errors
      toast.error('Failed to load health data. Please try again.')
      
      // Set empty data on error
      setHealthMetrics([])
      setRiskAlerts([])
      setAIInsights([])
    } finally {
      setLoading(false)
    }
  }


  const openMedicationReminders = async () => {
    try {
      setShowMedReminders(true)
      setLoadingDue(true)
      const res = await medicationAPI.getDueMedications()
      setDueMedications(res.data.data.medications || [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load reminders')
    } finally {
      setLoadingDue(false)
    }
  }

  const markMedicationTaken = async (medId: string) => {
    try {
      await medicationAPI.markMedicationTaken(medId)
      toast.success('Marked as taken')
      // Refresh list
      const res = await medicationAPI.getDueMedications()
      setDueMedications(res.data.data.medications || [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to mark as taken')
    }
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'steps': return FiActivity
      case 'heart_rate': return FiHeart
      case 'sleep': return FiClock
      case 'blood_pressure': return FiTrendingUp
      default: return FiActivity
    }
  }

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'steps': return 'health-metrics-steps'
      case 'heart_rate': return 'health-metrics-heart'
      case 'sleep': return 'health-metrics-sleep'
      case 'blood_pressure': return 'health-metrics-calories'
      default: return 'primary-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success-600'
      case 'warning': return 'text-warning-600'
      case 'critical': return 'text-error-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'high': return 'border-error-500 bg-error-50'
      case 'medium': return 'border-warning-500 bg-warning-50'
      case 'low': return 'border-success-500 bg-success-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  // Helper function to determine health status based on type and value
  const getHealthStatus = (type: string, value: any): 'good' | 'warning' | 'critical' => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    
    switch (type) {
      case 'heart_rate':
        if (numValue < 60 || numValue > 100) return 'warning'
        return 'good'
      case 'blood_pressure':
        if (typeof value === 'string' && value.includes('/')) {
          const [systolic, diastolic] = value.split('/').map(Number)
          if (systolic > 140 || diastolic > 90) return 'warning'
          if (systolic > 160 || diastolic > 100) return 'critical'
        }
        return 'good'
      case 'steps':
        if (numValue < 5000) return 'warning'
        return 'good'
      case 'sleep':
        if (numValue < 6 || numValue > 9) return 'warning'
        return 'good'
      case 'weight':
        // This would need to be compared against ideal weight range
        return 'good'
      case 'temperature':
        if (numValue < 97 || numValue > 99.5) return 'warning'
        if (numValue < 95 || numValue > 102) return 'critical'
        return 'good'
      default:
        return 'good'
    }
  }

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return time.toLocaleDateString()
  }

  // Helper function to generate AI insights based on health data
  const generateAIInsights = (metrics: HealthMetric[]): AIInsight[] => {
    const insights: AIInsight[] = []
    
    // Check for low activity
    const stepsData = metrics.find(m => m.type === 'steps')
    if (stepsData && parseInt(stepsData.value) < 5000) {
      insights.push({
        id: 'low-activity',
        title: 'Low Activity Alert',
        description: 'Your step count is below the recommended 10,000 steps. Consider taking a walk or doing light exercise.',
        type: 'recommendation',
        priority: 'medium'
      })
    }
    
    // Check for sleep issues
    const sleepData = metrics.find(m => m.type === 'sleep')
    if (sleepData && parseFloat(sleepData.value) < 7) {
      insights.push({
        id: 'sleep-reminder',
        title: 'Sleep Recommendation',
        description: 'You\'re getting less than 7 hours of sleep. Aim for 7-9 hours for optimal health.',
        type: 'recommendation',
        priority: 'high'
      })
    }
    
    // Check for heart rate anomalies
    const heartRateData = metrics.find(m => m.type === 'heart_rate')
    if (heartRateData && (parseInt(heartRateData.value) < 60 || parseInt(heartRateData.value) > 100)) {
      insights.push({
        id: 'heart-rate-alert',
        title: 'Heart Rate Alert',
        description: 'Your heart rate is outside the normal range. Consider consulting with your doctor.',
        type: 'recommendation',
        priority: 'high'
      })
    }
    
    // Add general encouragement if no issues
    if (insights.length === 0) {
      insights.push({
        id: 'general-encouragement',
        title: 'Great Job!',
        description: 'Your health metrics look good. Keep up the healthy lifestyle!',
        type: 'recommendation',
        priority: 'low'
      })
    }
    
    return insights
  }

  // Show loading while authentication is being verified
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
          <Link to="/patient/login" className="btn btn-primary">
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
              <FiHeart className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Health Twin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowEmergencyMode(true)}
                className="btn btn-error btn-md inline-flex items-center"
              >
                <FiAlertCircle className="mr-2 h-4 w-4" />
                Emergency
              </button>
              <button 
                onClick={loadPatientData}
                disabled={loading}
                className="btn btn-outline btn-md inline-flex items-center"
              >
                <FiActivity className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <Link to="/health-twin" className="btn btn-primary btn-md inline-flex items-center">
                <FiPlus className="mr-2 h-4 w-4" />
                Log Health Data
              </Link>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user ? `${user.firstName || 'Patient'}` : 'Patient'}!
          </h2>
          <p className="text-gray-600">Here's your health overview for today</p>
        </div>

        {/* Patient Info Section */}
        {user && (
          <div className="mb-8">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <FiHeart className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Patient ID: {user._id} | Role: {user.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      <p>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'First time'}</p>
                      <p className="text-green-600 font-medium">Status: Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              Loading health metrics...
            </div>
          ) : healthMetrics.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No health data yet</h3>
              <p className="text-gray-600 mb-4">Start logging your health data to see insights here</p>
              <Link to="/health-twin" className="btn btn-primary">
                <FiPlus className="mr-2 h-4 w-4" />
                Log Your First Health Data
              </Link>
            </div>
          ) : (
            healthMetrics.map((metric) => {
            const IconComponent = getMetricIcon(metric.type)
            return (
              <div
                key={metric.id}
                className={`card cursor-pointer transition-all hover:shadow-lg ${
                  selectedMetric?.id === metric.id ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setSelectedMetric(metric)}
              >
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-${getMetricColor(metric.type)}-100`}>
                        <IconComponent className={`h-6 w-6 text-${getMetricColor(metric.type)}-600`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 capitalize">
                          {metric.type.replace('_', ' ')}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metric.value} <span className="text-sm text-gray-500">{metric.unit}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${getStatusColor(metric.status)} flex items-center justify-end`}>
                        {metric.status === 'good' && <FiCheckCircle className="h-4 w-4 mr-1" />}
                        {metric.status === 'warning' && <FiAlertCircle className="h-4 w-4 mr-1" />}
                        {metric.status === 'critical' && <FiAlertCircle className="h-4 w-4 mr-1" />}
                        <span className="capitalize">{metric.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{metric.timestamp}</p>
                      {metric.notes && (
                        <p className="text-xs text-gray-400 mt-1 max-w-20 truncate" title={metric.notes}>
                          {metric.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Insights */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <FiZap className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="card-title">AI Health Insights</h3>
                </div>
              </div>
              <div className="card-content">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading AI insights...</div>
                ) : aiInsights.length === 0 ? (
                  <div className="text-center py-8">
                    <FiZap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No AI insights yet</h3>
                    <p className="text-gray-600">AI insights will appear here as you use the platform</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 border-l-4 ${
                        insight.priority === 'high' ? 'border-error-500 bg-error-50' :
                        insight.priority === 'medium' ? 'border-warning-500 bg-warning-50' :
                        'border-success-500 bg-success-50'
                      } rounded-r-lg`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          <div className="mt-2">
                            <span className={`badge ${
                              insight.priority === 'high' ? 'badge-error' :
                              insight.priority === 'medium' ? 'badge-warning' :
                              'badge-success'
                            }`}>
                              {insight.type}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <FiEye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Risk Alerts */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <FiAlertCircle className="h-5 w-5 text-warning-500 mr-2" />
                  <h3 className="card-title">Risk Alerts</h3>
                </div>
              </div>
              <div className="card-content">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading risk alerts...</div>
                ) : riskAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No immediate risks detected</h3>
                    <p className="text-gray-600">Keep up the good work! Your health is looking great.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {riskAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 border rounded-lg ${getRiskColor(alert.type)}`}
                    >
                      <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{alert.action}</p>
                    </div>
                    ))}
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
                  <button onClick={openMedicationReminders} className="btn btn-outline btn-sm w-full justify-start">
                    <FiPackage className="mr-2 h-4 w-4" />
                    Medication Reminder
                  </button>
                  <Link to="/calendar" className="btn btn-outline btn-sm w-full justify-start">
                    <FiCalendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Link>
                  <Link to="/virtual-doctor" className="btn btn-outline btn-sm w-full justify-start">
                    <FiZap className="mr-2 h-4 w-4" />
                    Chat with AI Doctor
                  </Link>
                  <Link to="/health-twin" className="btn btn-outline btn-sm w-full justify-start">
                    <FiEdit className="mr-2 h-4 w-4" />
                    Log Health Data
                  </Link>
                  <Link to="/patient/chat" className="btn btn-outline btn-sm w-full justify-start">
                    <FiMessageCircle className="mr-2 h-4 w-4" />
                    Chat with Doctor
                  </Link>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <FiCalendar className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="card-title">Today's Schedule</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-primary-50 rounded-lg">
                    <div className="p-2 bg-primary-100 rounded-full">
                      <FiPackage className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Morning Medication</p>
                      <p className="text-xs text-gray-600">8:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-success-50 rounded-lg">
                    <div className="p-2 bg-success-100 rounded-full">
                      <FiActivity className="h-4 w-4 text-success-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Exercise Session</p>
                      <p className="text-xs text-gray-600">6:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-warning-50 rounded-lg">
                    <div className="p-2 bg-warning-100 rounded-full">
                      <FiPackage className="h-4 w-4 text-warning-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Evening Medication</p>
                      <p className="text-xs text-gray-600">8:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Mode */}
      <EmergencyMode 
        isOpen={showEmergencyMode} 
        onClose={() => setShowEmergencyMode(false)} 
      />

      {/* Medication Reminders Modal */}
      {showMedReminders && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Medication Reminders (next 15 min)</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowMedReminders(false)}>Close</button>
            </div>
            <div className="p-4">
              {loadingDue ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : dueMedications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No medications due soon.</div>
              ) : (
                <div className="space-y-3">
                  {dueMedications.map((m: any) => (
                    <div key={m.id || m._id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{m.name}</div>
                        {m.dosage?.value ? (
                          <div className="text-sm text-gray-600">{m.dosage.value}{m.dosage.unit ? ` ${m.dosage.unit}` : ''}</div>
                        ) : null}
                        <div className="text-xs text-gray-500">Schedule: {(m.frequency?.schedule || []).map((s: any) => s.time).join(', ')}</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => markMedicationTaken(m.id || m._id)}>Mark taken</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
