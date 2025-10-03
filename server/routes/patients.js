const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Generate secure password
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * @route   GET /api/patients
 * @desc    Get all patients for a doctor
 * @access  Private (Doctor only)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Doctor role required.' 
      });
    }

    // Get all patients (users with role 'patient')
    const patients = await User.findByRole('patient');
    
    res.json({ 
      status: 'success', 
      data: patients.map(patient => patient.toJSON()) 
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch patients', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/patients
 * @desc    Create a new patient
 * @access  Private (Doctor only)
 */
router.post('/', authenticateToken, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('cnic').notEmpty().withMessage('CNIC is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Only doctors can create patients
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Doctor role required.' 
      });
    }

    const { firstName, lastName, email, phoneNumber, cnic, dateOfBirth, gender } = req.body;

    // Check if patient already exists
    const existingPatient = await User.findByEmail(email);
    if (existingPatient) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Patient with this email already exists' 
      });
    }

    // Generate secure password
    const generatedPassword = generateSecurePassword();
    
    // Create new patient
    const patient = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      cnic,
      dateOfBirth,
      gender,
      role: 'patient',
      password: generatedPassword,
      isActive: true
    });

    await patient.save();

    res.status(201).json({ 
      status: 'success', 
      message: 'Patient created successfully',
      data: {
        ...patient.toJSON(),
        generatedPassword: generatedPassword // Include password for doctor to share
      }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create patient', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/patients/:id
 * @desc    Get a specific patient by ID
 * @access  Private (Doctor only)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Doctor role required.' 
      });
    }

    const patient = await User.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Patient not found' 
      });
    }

    res.json({ 
      status: 'success', 
      data: patient.toJSON() 
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch patient', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/patients/:id/credentials
 * @desc    Get patient credentials (email and password)
 * @access  Private (Doctor only)
 */
router.get('/:id/credentials', authenticateToken, async (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Doctor role required.' 
      });
    }

    const patient = await User.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Patient not found' 
      });
    }

    res.json({ 
      status: 'success', 
      data: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        cnic: patient.cnic,
        loginUrl: `${process.env.CLIENT_URL}/patient/login`,
        // Note: We don't return the actual password for security
        // The password was shown only during patient creation
        message: 'Patient credentials were generated during account creation. Please check the creation record or reset the password if needed.'
      }
    });
  } catch (error) {
    console.error('Get patient credentials error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch patient credentials', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/patients/:id/reset-password
 * @desc    Reset patient password and generate new one
 * @access  Private (Doctor only)
 */
router.post('/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Doctor role required.' 
      });
    }

    const patient = await User.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Patient not found' 
      });
    }

    // Generate new password
    const newPassword = generateSecurePassword();
    
    // Update patient password
    await User.findByIdAndUpdate(req.params.id, { password: newPassword });

    res.json({ 
      status: 'success', 
      message: 'Patient password reset successfully',
      data: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        newPassword: newPassword,
        loginUrl: `${process.env.CLIENT_URL}/patient/login`
      }
    });
  } catch (error) {
    console.error('Reset patient password error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to reset patient password', 
      error: error.message 
    });
  }
});

module.exports = router;
