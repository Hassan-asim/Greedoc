import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary btn-md w-full inline-flex items-center justify-center"
          >
            <FiHome className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline btn-md w-full inline-flex items-center justify-center"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
