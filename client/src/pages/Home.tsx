import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { 
  FiHeart, 
  FiShield, 
  FiZap, 
  FiTrendingUp, 
  FiUsers, 
  FiSmartphone,
  FiArrowRight,
  FiCheck,
  FiPackage,
  FiCalendar
} from 'react-icons/fi'

export const Home: React.FC = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: FiHeart,
      title: 'Digital Health Twin',
      description: 'Create your AI-powered digital health twin that learns and predicts your health patterns.'
    },
    {
      icon: FiPackage,
      title: 'Smart Medication Management',
      description: 'AI agents automatically manage your medications and send intelligent reminders.'
    },
    {
      icon: FiCalendar,
      title: 'Automated Scheduling',
      description: 'AI agents schedule appointments and manage your health calendar automatically.'
    },
    {
      icon: FiZap,
      title: 'Virtual Doctor Chatbot',
      description: 'Chat with AI-powered virtual doctor for instant medical advice and symptom analysis.'
    },
    {
      icon: FiShield,
      title: 'Proactive Risk Prediction',
      description: 'Predict health risks before they become problems with advanced AI algorithms.'
    },
    {
      icon: FiTrendingUp,
      title: 'Health Analytics',
      description: 'Comprehensive health insights from wearables, lab reports, and manual inputs.'
    }
  ]

  const benefits = [
    'Personalized health recommendations',
    'Medication adherence tracking',
    'AI-powered symptom analysis',
    'Secure health data storage',
    'Comprehensive health reports',
    '24/7 health monitoring'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FiHeart className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Greedoc</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <Link
                  to="/app/dashboard"
                  className="btn btn-primary btn-md"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/doctor/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Doctor Portal
                  </Link>
                  <Link
                    to="/patient/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Patient Portal
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Health Twin App
              <span className="text-primary-500"> - Your Digital Health Twin</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Shift from reactive to proactive healthcare with AI-powered health management. 
              Create your digital health twin, predict risks, and automate health tasks 
              with intelligent AI agents and virtual doctors.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/doctor/login"
                className="btn btn-primary btn-lg inline-flex items-center hover:scale-105 transition-transform"
              >
                Doctor Portal
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/patient/login"
                className="btn btn-outline btn-lg hover:scale-105 transition-transform"
              >
                Patient Portal
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with user-friendly design 
              to help you manage your health effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Greedoc?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of users who have transformed their health management 
                with our AI-powered platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <FiCheck className="h-5 w-5 text-success-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <FiSmartphone className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Available Everywhere
                </h3>
                <p className="text-gray-600 mb-6">
                  Access your health data and insights from any device, anywhere, anytime.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">10K+</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">4.9★</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Access Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Choose your portal to access Greedoc's AI-powered health management platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/doctor/login"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center w-full sm:w-auto"
            >
              <FiUsers className="mr-2 h-5 w-5" />
              Doctor Portal
            </Link>
            <Link
              to="/patient/login"
              className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg inline-flex items-center w-full sm:w-auto"
            >
              <FiHeart className="mr-2 h-5 w-5" />
              Patient Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FiHeart className="h-6 w-6 text-primary-400" />
                <h3 className="ml-2 text-lg font-bold">Greedoc</h3>
              </div>
              <p className="text-gray-400">
                Your AI-powered health companion for better wellness management.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Greedoc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
