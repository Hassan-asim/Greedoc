import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiEye, FiEyeOff, FiHeart, FiLock, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface PatientLoginForm {
  cnic: string
  password: string
}

export const PatientLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PatientLoginForm>()

  const onSubmit = async (data: PatientLoginForm) => {
    setIsLoading(true)
    try {
      // Handle patient login
      console.log('Patient login:', data)
      toast.success('Login successful!')
      navigate('/patient/dashboard')
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FiHeart className="h-12 w-12 text-primary-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Patient Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your health twin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">
                CNIC
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('cnic', { 
                    required: 'CNIC is required',
                    pattern: {
                      value: /^\d{5}-\d{7}-\d{1}$/,
                      message: 'Please enter CNIC in format: 12345-1234567-1'
                    }
                  })}
                  type="text"
                  className="input w-full"
                  placeholder="12345-1234567-1"
                />
                <FiUser className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {errors.cnic && (
                <p className="mt-1 text-sm text-error-500">{errors.cnic.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pr-10"
                  placeholder="Enter your password"
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
                <p className="mt-1 text-sm text-error-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </button>
                <p className="text-gray-500 text-xs mt-1">
                  Contact your doctor for password reset
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-md w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-500 text-sm"
              >
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiHeart className="h-5 w-5 text-primary-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">
                New Patient?
              </h3>
              <div className="mt-2 text-sm text-primary-700">
                <p>
                  Your doctor will create your account and provide you with login credentials.
                  Contact your healthcare provider to get started.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
