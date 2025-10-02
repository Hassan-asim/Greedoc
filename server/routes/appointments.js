const express = require('express');
const { body, validationResult } = require('express-validator');
const HealthRecord = require('../models/HealthRecord');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/appointments
 * @desc    Get user's appointments
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, upcoming } = req.query;
    const skip = (page - 1) * limit;

    let query = { 
      userId: req.user._id,
      recordType: 'appointment'
    };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter upcoming appointments
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const appointments = await HealthRecord.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await HealthRecord.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments'
    });
  }
});

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', authenticateToken, [
  body('title').trim().notEmpty().withMessage('Appointment title is required'),
  body('date').isISO8601().withMessage('Please provide a valid appointment date'),
  body('provider.name').trim().notEmpty().withMessage('Provider name is required'),
  body('provider.type').isIn(['doctor', 'nurse', 'specialist', 'pharmacist', 'lab_technician', 'other'])
    .withMessage('Invalid provider type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const appointmentData = {
      userId: req.user._id,
      recordType: 'appointment',
      ...req.body
    };

    const appointment = new HealthRecord(appointmentData);
    await appointment.save();

    res.status(201).json({
      status: 'success',
      message: 'Appointment created successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a specific appointment
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user._id,
      recordType: 'appointment'
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointment'
    });
  }
});

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment
 * @access  Private
 */
router.put('/:id', authenticateToken, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const appointment = await HealthRecord.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.user._id,
        recordType: 'appointment'
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete an appointment
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      recordType: 'appointment'
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete appointment'
    });
  }
});

/**
 * @route   GET /api/appointments/upcoming
 * @desc    Get upcoming appointments
 * @access  Private
 */
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const appointments = await HealthRecord.find({
      userId: req.user._id,
      recordType: 'appointment',
      date: { $gte: new Date() }
    })
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        appointments,
        count: appointments.length
      }
    });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch upcoming appointments'
    });
  }
});

/**
 * @route   GET /api/appointments/calendar/:year/:month
 * @desc    Get appointments for a specific month
 * @access  Private
 */
router.get('/calendar/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const appointments = await HealthRecord.find({
      userId: req.user._id,
      recordType: 'appointment',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Group appointments by date
    const calendarData = {};
    appointments.forEach(appointment => {
      const dateKey = appointment.date.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push(appointment);
    });

    res.json({
      status: 'success',
      data: {
        appointments: calendarData,
        month: parseInt(month),
        year: parseInt(year)
      }
    });
  } catch (error) {
    console.error('Get calendar appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch calendar appointments'
    });
  }
});

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private
 */
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid appointment status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
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

    const updateData = {
      status: req.body.status
    };

    if (req.body.notes) {
      updateData.notes = req.body.notes;
    }

    const appointment = await HealthRecord.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.user._id,
        recordType: 'appointment'
      },
      updateData,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Appointment status updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update appointment status'
    });
  }
});

module.exports = router;
