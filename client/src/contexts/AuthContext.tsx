import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: string
  phoneNumber?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  emergencyContact?: {
    name?: string
    relationship?: string
    phoneNumber?: string
    email?: string
  }
  medicalInfo?: {
    bloodType?: string
    allergies?: string[]
    chronicConditions?: string[]
    medications?: string[]
    height?: number
    weight?: number
    bmi?: number
  }
  preferences?: {
    language: string
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    privacy: {
      shareData: boolean
      anonymousUsage: boolean
    }
  }
  avatar?: string
  isEmailVerified: boolean
  lastLogin?: string
  isActive: boolean
  role: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  registerDoctor: (userData: DoctorRegisterData) => Promise<void>
  createPatient: (userData: PatientCreateData) => Promise<{ patient: any; loginCredentials: any }>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  refreshToken: () => Promise<void>
}

interface DoctorRegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  dateOfBirth: string
  gender: string
  phoneNumber?: string
  specialization?: string
  licenseNumber?: string
}

interface PatientCreateData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  gender: string
  password?: string
  medicalInfo?: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedRefreshToken = localStorage.getItem('refreshToken')
        
        console.log('Auth initialization:', {
          hasToken: !!storedToken,
          hasRefreshToken: !!storedRefreshToken,
          tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : 'No token'
        })
        
        if (storedToken) {
          setToken(storedToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          
          // Verify token and get user data
          try {
            console.log('Verifying token with /auth/me...')
            const response = await api.get('/auth/me')
            console.log('Token verification successful:', response.data)
            setUser(response.data.data.user)
          } catch (error: any) {
            console.error('Token verification failed:', error)
            // If token is invalid, try to refresh
            if (storedRefreshToken) {
              try {
                console.log('Attempting token refresh...')
                await refreshToken()
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
                // Clear invalid tokens
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                setToken(null)
                setUser(null)
              }
            } else {
              // No refresh token, clear everything
              localStorage.removeItem('token')
              setToken(null)
              setUser(null)
            }
          }
        } else if (storedRefreshToken) {
          // Try to refresh token
          try {
            console.log('Attempting token refresh with stored refresh token...')
            await refreshToken()
          } catch (error) {
            console.error('Token refresh failed:', error)
            localStorage.removeItem('refreshToken')
          }
        } else {
          console.log('No tokens found in localStorage')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid tokens
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Clear any existing tokens before login
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      api.defaults.headers.common['Authorization'] = undefined
      
      console.log('Attempting login for:', email)
      const response = await api.post('/auth/login', { email, password })
      
      const { user: userData, token: authToken, refreshToken } = response.data.data
      
      console.log('Login successful:', {
        user: userData,
        hasToken: !!authToken,
        hasRefreshToken: !!refreshToken,
        tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : 'No token'
      })
      
      // Store tokens
      localStorage.setItem('token', authToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      // Update state
      setUser(userData)
      setToken(authToken)
      
      toast.success('Login successful!')
    } catch (error: any) {
      console.error('Login failed:', error)
      // Don't show toast for login errors - let components handle them
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const registerDoctor = async (userData: DoctorRegisterData) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/register', userData)
      
      const { doctor: newDoctor, token: authToken, refreshToken } = response.data.data
      
      // Store tokens
      localStorage.setItem('token', authToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      // Update state
      setUser(newDoctor)
      setToken(authToken)
      
      toast.success('Doctor registration successful!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Doctor registration failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const createPatient = async (userData: PatientCreateData) => {
    try {
      setIsLoading(true)
      const response = await api.post('/patients', userData)
      
      const { patient, loginCredentials } = response.data.data
      
      toast.success('Patient created successfully!')
      return { patient, loginCredentials }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Patient creation failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    
    // Clear auth header
    delete api.defaults.headers.common['Authorization']
    
    // Clear state
    setUser(null)
    setToken(null)
    
    toast.success('Logged out successfully')
  }

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', userData)
      setUser(response.data.data.user)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      throw error
    }
  }

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken')
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: storedRefreshToken
      })
      
      const { token: newToken, refreshToken: newRefreshToken } = response.data.data
      
      // Store new tokens
      localStorage.setItem('token', newToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      // Update state
      setToken(newToken)
      
      return newToken
    } catch (error) {
      // Refresh failed, logout user
      logout()
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    registerDoctor,
    createPatient,
    logout,
    updateProfile,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
