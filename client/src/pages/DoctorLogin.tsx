import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiEye, FiEyeOff, FiHeart, FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface DoctorLoginForm {
  docId: string
  password: string
}

interface DoctorSignupForm {
  docId: string
  name: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

export const DoctorLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<DoctorLoginForm | DoctorSignupForm>()

  const password = watch('password')

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      if (isSignup) {
        // Handle doctor signup
        console.log('Doctor signup:', data)
        toast.success('Doctor account created successfully!')
      } else {
        // Handle doctor login
        console.log('Doctor login:', data)
        toast.success('Login successful!')
        navigate('/doctor/dashboard')
      }
    } catch (error) {
      toast.error('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FiHeart className="h-12 w-12 text-primary-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isSignup ? 'Doctor Signup' : 'Doctor Portal'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignup ? 'Create your doctor account' : 'Sign in to manage your patients'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isSignup ? (
              <>
                {/* Doctor Signup Form */}
                <div>
                  <label htmlFor="docId" className="block text-sm font-medium text-gray-700">
                    Doctor ID
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('docId', { required: 'Doctor ID is required' })}
                      type="text"
                      className="input w-full"
                      placeholder="Enter your Doctor ID"
                    />
                    <FiUser className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.docId && (
                    <p className="mt-1 text-sm text-error-500">{errors.docId.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="input w-full"
                      placeholder="Enter your full name"
                    />
                    <FiUser className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('phoneNumber', { required: 'Phone number is required' })}
                      type="tel"
                      className="input w-full"
                      placeholder="Enter your phone number"
                    />
                    <FiPhone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-error-500">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Doctor Login Form */}
                <div>
                  <label htmlFor="docId" className="block text-sm font-medium text-gray-700">
                    Doctor ID
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('docId', { required: 'Doctor ID is required' })}
                      type="text"
                      className="input w-full"
                      placeholder="Enter your Doctor ID"
                    />
                    <FiUser className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.docId && (
                    <p className="mt-1 text-sm text-error-500">{errors.docId.message}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
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

            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    className="input w-full"
                    placeholder="Confirm your password"
                  />
                  <FiLock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-md w-full"
              >
                {isLoading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                {isSignup ? 'Already have an account? Sign in' : 'New doctor? Create account'}
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
    </div>
  )
}
