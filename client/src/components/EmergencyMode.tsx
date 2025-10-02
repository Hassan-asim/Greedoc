import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiPhone, FiX, FiHeart } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface EmergencyModeProps {
  isOpen: boolean
  onClose: () => void
}

export const EmergencyMode: React.FC<EmergencyModeProps> = ({ isOpen, onClose }) => {
  const [isCalling, setIsCalling] = useState(false)

  const handleEmergencyCall = async (type: 'doctor' | 'ambulance') => {
    setIsCalling(true)
    
    try {
      // Simulate emergency call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (type === 'doctor') {
        toast.success('Emergency alert sent to your doctor!')
        console.log('Emergency call to doctor initiated')
      } else {
        toast.success('Emergency services contacted!')
        console.log('Emergency call to ambulance initiated')
      }
    } catch (error) {
      toast.error('Emergency call failed. Please try again or call manually.')
    } finally {
      setIsCalling(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg max-w-md w-full p-6 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mb-6"
            >
              <FiAlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Emergency Mode
            </h2>
            
            <p className="text-gray-600 mb-6">
              Are you experiencing a medical emergency? Choose your emergency contact:
            </p>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmergencyCall('doctor')}
                disabled={isCalling}
                className="w-full btn btn-error btn-lg flex items-center justify-center"
              >
                {isCalling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Calling...
                  </>
                ) : (
                  <>
                    <FiHeart className="mr-2 h-5 w-5" />
                    Contact My Doctor
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmergencyCall('ambulance')}
                disabled={isCalling}
                className="w-full btn btn-outline btn-lg flex items-center justify-center border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <FiPhone className="mr-2 h-5 w-5" />
                Call Emergency Services
              </motion.button>
              
              <button
                onClick={onClose}
                disabled={isCalling}
                className="w-full btn btn-ghost btn-md flex items-center justify-center"
              >
                <FiX className="mr-2 h-4 w-4" />
                Cancel
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This is a simulation. In a real emergency, 
                call your local emergency number (911) immediately.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
