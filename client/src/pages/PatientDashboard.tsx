import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
  FiEdit
} from 'react-icons/fi'

interface HealthMetric {
  id: string
  type: 'steps' | 'heart_rate' | 'sleep' | 'blood_pressure'
  value: string
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  timestamp: string
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

const mockHealthMetrics: HealthMetric[] = [
  {
    id: '1',
    type: 'steps',
    value: '8,542',
    unit: 'steps',
    trend: 'up',
    status: 'good',
    timestamp: 'Today'
  },
  {
    id: '2',
    type: 'heart_rate',
    value: '72',
    unit: 'bpm',
    trend: 'stable',
    status: 'good',
    timestamp: '2 min ago'
  },
  {
    id: '3',
    type: 'sleep',
    value: '7.5',
    unit: 'hours',
    trend: 'down',
    status: 'warning',
    timestamp: 'Last night'
  },
  {
    id: '4',
    type: 'blood_pressure',
    value: '120/80',
    unit: 'mmHg',
    trend: 'stable',
    status: 'good',
    timestamp: '1 hour ago'
  }
]

const mockRiskAlerts: RiskAlert[] = [
  {
    id: '1',
    type: 'medium',
    title: 'Sleep Quality Alert',
    description: 'Your sleep duration has decreased by 15% this week',
    action: 'Consider adjusting bedtime routine',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    type: 'low',
    title: 'Exercise Reminder',
    description: 'You\'re 500 steps away from your daily goal',
    action: 'Take a short walk',
    timestamp: '1 hour ago'
  }
]

const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Medication Optimization',
    description: 'Based on your recent blood pressure readings, consider taking your medication 30 minutes earlier.',
    type: 'recommendation',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Exercise Recommendation',
    description: 'Your heart rate variability suggests you\'re ready for moderate intensity exercise today.',
    type: 'recommendation',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Sleep Pattern Analysis',
    description: 'Your sleep efficiency has improved by 12% this month. Keep maintaining your current routine.',
    type: 'prediction',
    priority: 'low'
  }
]

export const PatientDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null)
  const [showEmergencyMode, setShowEmergencyMode] = useState(false)

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

  return (
    <div className="min-h-screen bg-secondary-100">
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
              <button className="btn btn-primary btn-md inline-flex items-center">
                <FiPlus className="mr-2 h-4 w-4" />
                Log Health Data
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Ahmed!</h2>
          <p className="text-gray-600">Here's your health overview for today</p>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockHealthMetrics.map((metric) => {
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
                      <div className={`text-sm ${getStatusColor(metric.status)}`}>
                        {metric.status === 'good' && <FiCheckCircle className="h-4 w-4" />}
                        {metric.status === 'warning' && <FiAlertCircle className="h-4 w-4" />}
                        {metric.status === 'critical' && <FiAlertCircle className="h-4 w-4" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{metric.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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
                <div className="space-y-4">
                  {mockAIInsights.map((insight) => (
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
                <div className="space-y-3">
                  {mockRiskAlerts.map((alert) => (
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
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <button className="btn btn-outline btn-sm w-full justify-start">
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
    </div>
  )
}
