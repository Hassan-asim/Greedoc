import React from 'react'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { healthAPI, medicationAPI, appointmentAPI } from '../services/api'
import { 
  FiHeart, 
  FiPackage, 
  FiCalendar, 
  FiTrendingUp, 
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()

  // Fetch health summary
  const { data: healthSummary, isLoading: healthLoading } = useQuery(
    'health-summary',
    () => healthAPI.getSummary(),
    {
      select: (response) => response.data.data
    }
  )

  // Fetch upcoming appointments
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useQuery(
    'upcoming-appointments',
    () => appointmentAPI.getUpcomingAppointments(5),
    {
      select: (response) => response.data.data.appointments
    }
  )

  // Fetch due medications
  const { data: dueMedications, isLoading: medicationsLoading } = useQuery(
    'due-medications',
    () => medicationAPI.getDueMedications(),
    {
      select: (response) => response.data.data.medications
    }
  )

  const stats = [
    {
      name: 'Health Records',
      value: healthSummary?.summary?.recentRecords || 0,
      icon: FiHeart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Medications',
      value: healthSummary?.summary?.activeMedications || 0,
      icon: FiPackage,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Upcoming Appointments',
      value: healthSummary?.summary?.upcomingAppointments || 0,
      icon: FiCalendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Health Score',
      value: '85%',
      icon: FiTrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-primary-100">
          Here's your health overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Upcoming Appointments</h3>
              <a href="/app/appointments" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </a>
            </div>
          </div>
          <div className="card-content">
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : upcomingAppointments?.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: any, index: number) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <FiCalendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} at{' '}
                        {new Date(appointment.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="badge badge-secondary">
                        {appointment.provider?.name || 'No provider'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
                <a href="/app/appointments" className="text-primary-600 hover:text-primary-500 text-sm">
                  Schedule an appointment
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Medication Reminders */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Medication Reminders</h3>
              <a href="/app/medications" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </a>
            </div>
          </div>
          <div className="card-content">
            {medicationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : dueMedications?.length > 0 ? (
              <div className="space-y-4">
                {dueMedications.map((medication: any, index: number) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <FiPackage className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{medication.name}</p>
                      <p className="text-sm text-gray-500">
                        {medication.dosage.value} {medication.dosage.unit}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="badge badge-warning">
                        Due now
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No medications due</p>
                <a href="/app/medications" className="text-primary-600 hover:text-primary-500 text-sm">
                  Add medications
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/app/health-records"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <FiActivity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Record Vitals</p>
                <p className="text-sm text-gray-500">Add new health data</p>
              </div>
            </a>

            <a
              href="/app/ai-insights"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <FiTrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">AI Insights</p>
                <p className="text-sm text-gray-500">Get health recommendations</p>
              </div>
            </a>

            <a
              href="/app/appointments"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Schedule Appointment</p>
                <p className="text-sm text-gray-500">Book with your doctor</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-content">
          {healthLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Blood pressure recorded</p>
                  <p className="text-sm text-gray-500">120/80 mmHg - 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <FiPackage className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Medication taken</p>
                  <p className="text-sm text-gray-500">Lisinopril 10mg - 4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <FiCalendar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Appointment scheduled</p>
                  <p className="text-sm text-gray-500">Annual checkup - Yesterday</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
