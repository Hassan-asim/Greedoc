import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit3 } from 'react-icons/fi'

export const Profile: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <button className="btn btn-primary btn-md">
          <FiEdit3 className="h-4 w-4 mr-2" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-4">
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Personal Information</h3>
            </div>
            <div className="card-content">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline h-4 w-4 mr-2" />
                      First Name
                    </label>
                    <div className="input bg-gray-50">{user?.firstName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline h-4 w-4 mr-2" />
                      Last Name
                    </label>
                    <div className="input bg-gray-50">{user?.lastName}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline h-4 w-4 mr-2" />
                    Email Address
                  </label>
                  <div className="input bg-gray-50">{user?.email}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="inline h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    <div className="input bg-gray-50">
                      {user?.phoneNumber || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiCalendar className="inline h-4 w-4 mr-2" />
                      Date of Birth
                    </label>
                    <div className="input bg-gray-50">
                      {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="input bg-gray-50 capitalize">
                    {user?.gender || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title">Medical Information</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type
                  </label>
                  <div className="input bg-gray-50">
                    {user?.medicalInfo?.bloodType || 'Not specified'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <div className="input bg-gray-50">
                    {user?.medicalInfo?.allergies?.length ? 
                      user.medicalInfo.allergies.join(', ') : 
                      'None reported'
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chronic Conditions
                  </label>
                  <div className="input bg-gray-50">
                    {user?.medicalInfo?.chronicConditions?.length ? 
                      user.medicalInfo.chronicConditions.join(', ') : 
                      'None reported'
                    }
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height
                    </label>
                    <div className="input bg-gray-50">
                      {user?.medicalInfo?.height ? `${user.medicalInfo.height} cm` : 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <div className="input bg-gray-50">
                      {user?.medicalInfo?.weight ? `${user.medicalInfo.weight} kg` : 'Not specified'}
                    </div>
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
