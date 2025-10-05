import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiEye, FiEyeOff, FiHeart, FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

interface DoctorLoginForm {
  email: string
  password: string
}

interface DoctorSignupForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  specialization?: string
  licenseNumber?: string
}

export const DoctorLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login, registerDoctor } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<DoctorLoginForm & DoctorSignupForm>()

  const password = watch('password')

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setLoginError(null) // Clear previous errors
    
    try {
      if (isSignup) {
        // Handle doctor signup - remove confirmPassword from data
        const { confirmPassword, ...doctorData } = data
        await registerDoctor(doctorData)
        navigate('/doctor/dashboard')
      } else {
        // Handle doctor login
        await login(data.email, data.password)
        navigate('/doctor/dashboard')
      }
    } catch (error: any) {
      // Handle specific error messages
      if (error.response?.status === 401) {
        setLoginError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.response?.status === 403) {
        setLoginError('Your account has been deactivated. Please contact support.')
      } else if (error.response?.status === 400) {
        if (isSignup) {
          // Handle registration validation errors
          const errorMessage = error.response?.data?.message || 'Please check your registration details.'
          setLoginError(errorMessage)
        } else {
          setLoginError('Please check your email and password format.')
        }
      } else if (error.response?.data?.message) {
        setLoginError(error.response.data.message)
      } else {
        const errorMessage = isSignup ? 'Registration failed. Please try again.' : 'Login failed. Please try again.'
        setLoginError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error when switching between login/signup
  const handleModeSwitch = () => {
    setLoginError(null)
    setIsSignup(!isSignup)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            {/* Error Message Display */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{loginError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isSignup ? (
              <>
                {/* Doctor Signup Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
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
                      <p className="mt-1 text-sm text-error-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
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
                      <p className="mt-1 text-sm text-error-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
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
                      placeholder="Enter your email"
                    />
                    <FiMail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('phoneNumber', { 
                        required: 'Phone number is required',
                        minLength: { value: 10, message: 'Phone number must be at least 10 characters' },
                        maxLength: { value: 15, message: 'Phone number must be at most 15 characters' }
                      })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <div className="mt-1 relative">
                      <input
                        {...register('dateOfBirth', { required: 'Date of birth is required' })}
                        type="date"
                        className="input w-full"
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-error-500">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
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
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-error-500">{errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                    Medical Specialization (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('specialization')}
                      type="text"
                      className="input w-full"
                      placeholder="e.g., Cardiology, Neurology"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    Medical License Number (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('licenseNumber')}
                      type="text"
                      className="input w-full"
                      placeholder="Enter your license number"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Doctor Login Form */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
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
                      placeholder="Enter your email"
                    />
                    <FiMail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-500">{errors.email.message}</p>
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
                className="btn btn-primary btn-md w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleModeSwitch}
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
