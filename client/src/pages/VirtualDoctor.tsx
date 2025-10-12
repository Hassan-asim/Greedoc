import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSend, FiZap, FiUser, FiMessageCircle, FiArrowLeft, FiHeart } from 'react-icons/fi'
import aiService from '../services/aiService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  sender: 'user' | 'doctor'
  timestamp: Date
  type?: 'text' | 'quick_reply'
}

interface QuickReply {
  id: string
  text: string
  action: string
}

const quickReplies: QuickReply[] = [
  { id: '1', text: 'Explain my lab results', action: 'lab_results' },
  { id: '2', text: 'Medication side effects', action: 'medication_side_effects' },
  { id: '3', text: 'Exercise recommendations', action: 'exercise_recommendations' },
  { id: '4', text: 'Diet advice', action: 'diet_advice' },
  { id: '5', text: 'Symptom analysis', action: 'symptom_analysis' },
  { id: '6', text: 'Emergency help', action: 'emergency_help' }
]

const mockDoctorResponses = {
  lab_results: "Based on your recent lab results, your cholesterol levels are within normal range. Your blood sugar is slightly elevated - I recommend reducing refined sugar intake and increasing fiber consumption.",
  medication_side_effects: "The medication you're taking may cause mild dizziness, especially when standing up quickly. Make sure to stay hydrated and avoid sudden movements. If symptoms persist, contact your doctor.",
  exercise_recommendations: "For your current health condition, I recommend 30 minutes of moderate exercise daily. Walking, swimming, or cycling are excellent options. Start slowly and gradually increase intensity.",
  diet_advice: "Focus on a balanced diet with plenty of vegetables, lean proteins, and whole grains. Limit processed foods and maintain regular meal times. Stay hydrated with 8 glasses of water daily.",
  symptom_analysis: "Please describe your symptoms in detail: when they started, their severity, any triggers, and how they affect your daily activities. This will help me provide better guidance.",
  emergency_help: "If you're experiencing severe symptoms like chest pain, difficulty breathing, or loss of consciousness, please call emergency services immediately (911) or go to the nearest emergency room."
}

export const VirtualDoctor: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI-powered virtual doctor. How can I help you today?',
      sender: 'doctor',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateTyping = (responseText: string, callback: () => void) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      callback()
    }, 1500)
  }

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await aiService.getVirtualDoctorHistory(user?._id)
        if (history && Array.isArray(history) && history.length > 0) {
          const converted = history.map((h: any, idx: number) => ({
            id: h.id || `${idx}`,
            text: h.message,
            sender: h.sender === 'assistant' ? 'doctor' : 'user',
            timestamp: new Date(h.createdAt)
          }))
          setMessages(prev => {
            // Avoid duplicating initial welcome if history exists
            return converted
          })
        }
      } catch (e) {
        // ignore history errors
      }
    }
    loadHistory()
  }, [user?._id])

  const sendMessage = async (text: string, action?: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    try {
      // Get AI response from the backend
      const response = await aiService.chatWithVirtualDoctor(text, { action }, user?._id)
      
      const doctorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'doctor',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, doctorMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      toast.error('Failed to get AI response. Please try again.')
      
      // Fallback response
      const doctorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again or consult with a healthcare professional for immediate concerns.",
        sender: 'doctor',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, doctorMessage])
    }
  }

  const handleQuickReply = (quickReply: QuickReply) => {
    sendMessage(quickReply.text, quickReply.action)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link to="/patient/dashboard" className="mr-4 p-2 text-gray-600 hover:text-gray-900">
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-full">
                <FiMessageCircle className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Virtual Doctor</h1>
                <p className="text-sm text-gray-600">AI-powered health assistant</p>
              </div>
            </div>
            <div className="ml-auto">
              <div className="flex items-center text-sm text-success-600">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                Online
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3 h-[80dvh]">
            <div className="card ">
              <div className="card-content p-0">
                {/* Messages */}
                <div className="h-[80dvh] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`p-2 rounded-full ${
                          message.sender === 'user' 
                            ? 'bg-primary-500 text-white ml-2 h-[34px]' 
                            : 'bg-gray-100 text-gray-600 mr-2 h-[34px]'
                        }`}>
                          {message.sender === 'user' ? <FiUser className="h-4 w-4" /> : <FiMessageCircle className="h-4 w-4" />}
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary-500 text-white '
                            : 'bg-gray-100 text-gray-900 '
                        }`}>
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex max-w-xs lg:max-w-md">
                        <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-2">
                          <FiMessageCircle className="h-4 w-4" />
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask your health question..."
                      className="input flex-1"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !inputText.trim()}
                      className="btn btn-primary btn-md"
                    >
                      <FiSend className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Replies & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Replies */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Replies</h3>
              </div>
              <div className="card-content">
                <div className="space-y-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply)}
                      className="btn btn-outline btn-sm w-full justify-start text-left"
                      disabled={isTyping}
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Doctor Info */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <FiZap className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="card-title">AI Doctor</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <FiHeart className="h-4 w-4 text-primary-500 mr-2" />
                    <span className="text-gray-600">Powered by GLM API</span>
                  </div>
                  <p className="text-gray-600">
                    Your AI doctor can help with:
                  </p>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Symptom analysis</li>
                    <li>• Medication advice</li>
                    <li>• Health recommendations</li>
                    <li>• Lab result explanations</li>
                  </ul>
                  <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <p className="text-xs text-warning-800">
                      <strong>Disclaimer:</strong> This AI assistant provides general health information only. 
                      Always consult with your healthcare provider for medical advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Emergency</h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <button className="btn btn-error btn-sm w-full">
                    Emergency Help
                  </button>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Emergency Services:</p>
                    <p>Call 911 for immediate medical assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
