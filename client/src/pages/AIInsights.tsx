import React from 'react'
import { FiZap, FiTrendingUp, FiHeart, FiShield } from 'react-icons/fi'

export const AIInsights: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Health Insights</h1>
          <p className="text-gray-600">Get personalized health recommendations powered by AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <FiZap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Health Analysis</h3>
              <p className="text-sm text-gray-600">AI-powered health insights</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            Get comprehensive analysis of your health data with personalized recommendations.
          </p>
          <button className="btn btn-primary btn-sm">Get Analysis</button>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <FiTrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
              <p className="text-sm text-gray-600">Track your health patterns</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            Identify trends in your health data and get insights on your progress.
          </p>
          <button className="btn btn-primary btn-sm">View Trends</button>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <FiHeart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Symptom Checker</h3>
              <p className="text-sm text-gray-600">AI symptom analysis</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            Describe your symptoms and get AI-powered analysis and recommendations.
          </p>
          <button className="btn btn-primary btn-sm">Check Symptoms</button>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-red-100">
              <FiShield className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Medication Safety</h3>
              <p className="text-sm text-gray-600">Drug interaction analysis</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            Check for potential drug interactions and get safety recommendations.
          </p>
          <button className="btn btn-primary btn-sm">Check Safety</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent AI Insights</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-12">
            <FiZap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-500 mb-4">Start by getting your first AI health analysis</p>
            <button className="btn btn-primary btn-md">
              <FiZap className="h-4 w-4 mr-2" />
              Get AI Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
