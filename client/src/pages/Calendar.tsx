import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus,
  FiPackage,
  FiClock,
  FiHeart,
  FiActivity,
  FiArrowLeft
} from 'react-icons/fi'

interface CalendarEvent {
  id: string
  title: string
  type: 'medication' | 'appointment' | 'exercise' | 'reminder'
  time: string
  date: string
  description?: string
  completed?: boolean
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Morning Medication',
    type: 'medication',
    time: '08:00',
    date: '2024-01-15',
    description: 'Blood pressure medication',
    completed: true
  },
  {
    id: '2',
    title: 'Doctor Appointment',
    type: 'appointment',
    time: '10:30',
    date: '2024-01-15',
    description: 'Follow-up consultation',
    completed: false
  },
  {
    id: '3',
    title: 'Evening Medication',
    type: 'medication',
    time: '20:00',
    date: '2024-01-15',
    description: 'Diabetes medication',
    completed: false
  },
  {
    id: '4',
    title: 'Exercise Session',
    type: 'exercise',
    time: '18:00',
    date: '2024-01-16',
    description: '30 minutes walking',
    completed: false
  }
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getEventsForDate = (date: string) => {
    return mockEvents.filter(event => event.date === date)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'medication': return FiPackage
      case 'appointment': return FiCalendar
      case 'exercise': return FiActivity
      case 'reminder': return FiClock
      default: return FiClock
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'medication': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'appointment': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'exercise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'reminder': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dateStr === selectedDate
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const todayEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/patient/dashboard" className="mr-4 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <FiCalendar className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Health Calendar</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn btn-primary btn-md inline-flex items-center">
                <FiPlus className="mr-2 h-4 w-4" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === viewType
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Header */}
        <div className="card mb-6">
          <div className="card-content">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-content p-0">
                {/* Days of week header */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="p-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {daysInMonth.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="p-4"></div>
                    }

                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const dayEvents = getEventsForDate(dateStr)

                    return (
                      <div
                        key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}-${index}`}
                        className={`p-2 min-h-24 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          isToday(day) ? 'bg-primary-50 dark:bg-primary-900' : ''
                        } ${isSelected(day) ? 'ring-2 ring-primary-500' : ''}`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => {
                            const IconComponent = getEventIcon(event.type)
                            return (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1 rounded ${getEventColor(event.type)} flex items-center`}
                              >
                                <IconComponent className="h-3 w-3 mr-1" />
                                <span className="truncate">{event.title}</span>
                              </div>
                            )
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  {selectedDate ? `Events for ${selectedDate}` : 'Select a date'}
                </h3>
              </div>
              <div className="card-content">
                {selectedDate ? (
                  <div className="space-y-3">
                    {todayEvents.length > 0 ? (
                      todayEvents.map((event) => {
                        const IconComponent = getEventIcon(event.type)
                        return (
                          <div
                            key={event.id}
                            className={`p-3 rounded-lg border ${getEventColor(event.type)} ${
                              event.completed ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <IconComponent className="h-4 w-4 mr-2" />
                                <div>
                                  <h4 className="font-medium text-sm">{event.title}</h4>
                                  <p className="text-xs opacity-75">{event.time}</p>
                                </div>
                              </div>
                              {event.completed && (
                                <div className="text-xs opacity-75">✓ Done</div>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-xs mt-2 opacity-75">{event.description}</p>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FiCalendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No events scheduled for this date</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiCalendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click on a date to view events</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
