import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiUser, FiMail, FiPhone, FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface PatientFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  gender: string
  password?: string
  medicalInfo?: {
    bloodType?: string
    allergies?: string[]
    chronicConditions?: string[]
    medications?: string[]
  }
}

interface PatientCreationFormProps {
  onPatientCreated?: (patient: any, credentials: any) => void
  onClose?: () => void
}

export const PatientCreationForm: React.FC<PatientCreationFormProps> = ({
  onPatientCreated,
  onClose
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<any>(null)
  const { createPatient } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PatientFormData>()

  const password = watch('password')

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true)
    try {
      const result = await createPatient(data)
      setCreatedCredentials(result.loginCredentials)
      setShowCredentials(true)
      onPatientCreated?.(result.patient, result.loginCredentials)
      toast.success('Patient created successfully!')
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsLoading(false)
    }
  }

  if (showCredentials && createdCredentials) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Patient Account Created</h3>
          <p className="text-sm text-gray-600 mt-2">
            Share these credentials with the patient
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Login Credentials:</h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <p className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                {createdCredentials.email}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Password:</span>
              <p className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                {createdCredentials.password}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Login URL:</span>
              <p className="text-sm text-blue-600 break-all">
                {createdCredentials.loginUrl}
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nLogin URL: ${createdCredentials.loginUrl}`
              )
              toast.success('Credentials copied to clipboard!')
            }}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Copy Credentials
          </button>
          <button
            onClick={() => {
              setShowCredentials(false)
              setCreatedCredentials(null)
              onClose?.()
            }}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Create New Patient</h3>
        <p className="text-sm text-gray-600 mt-2">
          Create a patient account and provide them with login credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <div className="mt-1 relative">
              <input
                {...register('firstName', { required: 'First name is required' })}
                type="text"
                className="input w-full"
                placeholder="First name"
              />
              <FiUser className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <div className="mt-1 relative">
              <input
                {...register('lastName', { required: 'Last name is required' })}
                type="text"
                className="input w-full"
                placeholder="Last name"
              />
              <FiUser className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <div className="mt-1 relative">
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="input w-full"
              placeholder="patient@example.com"
            />
            <FiMail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <div className="mt-1 relative">
            <input
              {...register('phoneNumber', { required: 'Phone number is required' })}
              type="tel"
              className="input w-full"
              placeholder="+1-555-0123"
            />
            <FiPhone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth *
            </label>
            <div className="mt-1 relative">
              <input
                {...register('dateOfBirth', { required: 'Date of birth is required' })}
                type="date"
                className="input w-full"
              />
              <FiCalendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender *
            </label>
            <div className="mt-1 relative">
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="input w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password (Optional)
          </label>
          <div className="mt-1 relative">
            <input
              {...register('password', {
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              type={showPassword ? 'text' : 'password'}
              className="input w-full pr-10"
              placeholder="Leave empty for auto-generated password"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            If left empty, a secure password will be auto-generated
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Patient'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
