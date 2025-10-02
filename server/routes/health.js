const express = require('express');
const { body, validationResult } = require('express-validator');
const HealthRecord = require('../models/HealthRecord');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/health/records
 * @desc    Get user's health records
 * @access  Private
 */
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, startDate, endDate } = req.query;

    let query = { userId: req.user._id };

    // Filter by record type
    if (type) {
      query.recordType = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await HealthRecord.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await HealthRecord.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        records,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch health records'
    });
  }
});

/**
 * @route   POST /api/health/records
 * @desc    Create a new health record
 * @access  Private
 */
router.post('/records', authenticateToken, [
  body('recordType').isIn([
    'vital_signs', 'lab_results', 'imaging', 'medication', 
    'symptom', 'appointment', 'vaccination', 'allergy', 
    'chronic_condition', 'emergency_contact', 'insurance', 'other'
  ]).withMessage('Invalid record type'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Please provide a valid date')
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

    const recordData = {
      ...req.body,
      userId: req.user._id
    };

    const record = new HealthRecord(recordData);
    await record.save();

    res.status(201).json({
      status: 'success',
      message: 'Health record created successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create health record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/health/records/:id
 * @desc    Get a specific health record
 * @access  Private
 */
router.get('/records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Health record not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch health record'
    });
  }
});

/**
 * @route   PUT /api/health/records/:id
 * @desc    Update a health record
 * @access  Private
 */
router.put('/records/:id', authenticateToken, [
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

    const record = await HealthRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Health record not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Health record updated successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update health record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/health/records/:id
 * @desc    Delete a health record
 * @access  Private
 */
router.delete('/records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'Health record not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete health record'
    });
  }
});

/**
 * @route   GET /api/health/vitals
 * @desc    Get user's vital signs
 * @access  Private
 */
router.get('/vitals', authenticateToken, async (req, res) => {
  try {
    const { days = 30, limit = 50 } = req.query;
    
    const records = await HealthRecord.getRecent(
      req.user._id, 
      parseInt(days), 
      parseInt(limit)
    ).where('recordType', 'vital_signs');

    res.json({
      status: 'success',
      data: {
        records
      }
    });
  } catch (error) {
    console.error('Get vital signs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vital signs'
    });
  }
});

/**
 * @route   POST /api/health/vitals
 * @desc    Record vital signs
 * @access  Private
 */
router.post('/vitals', authenticateToken, [
  body('vitalSigns').isObject().withMessage('Vital signs data is required'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date')
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

    const recordData = {
      userId: req.user._id,
      recordType: 'vital_signs',
      title: 'Vital Signs Reading',
      date: req.body.date || new Date(),
      vitalSigns: req.body.vitalSigns,
      provider: req.body.provider,
      notes: req.body.notes
    };

    const record = new HealthRecord(recordData);
    await record.save();

    res.status(201).json({
      status: 'success',
      message: 'Vital signs recorded successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('Record vital signs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record vital signs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/health/summary
 * @desc    Get health summary
 * @access  Private
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get recent records
    const recentRecords = await HealthRecord.getRecent(userId, 30, 10);
    
    // Get latest vital signs
    const latestVitals = await HealthRecord.findOne({
      userId,
      recordType: 'vital_signs'
    }).sort({ date: -1 });

    // Get upcoming appointments
    const upcomingAppointments = await HealthRecord.find({
      userId,
      recordType: 'appointment',
      date: { $gte: new Date() }
    }).sort({ date: 1 }).limit(5);

    // Get active medications count
    const activeMedications = await HealthRecord.find({
      userId,
      recordType: 'medication',
      'medications.endDate': { $gte: new Date() }
    });

    res.json({
      status: 'success',
      data: {
        summary: {
          recentRecords: recentRecords.length,
          latestVitals,
          upcomingAppointments: upcomingAppointments.length,
          activeMedications: activeMedications.length
        },
        upcomingAppointments,
        latestVitals
      }
    });
  } catch (error) {
    console.error('Get health summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch health summary'
    });
  }
});

module.exports = router;
