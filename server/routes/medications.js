const express = require('express');
const { body, validationResult } = require('express-validator');
const Medication = require('../models/Medication');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/medications
 * @desc    Get user's medications
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const medications = await Medication.find(query)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Medication.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        medications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch medications'
    });
  }
});

/**
 * @route   POST /api/medications
 * @desc    Add a new medication
 * @access  Private
 */
router.post('/', authenticateToken, [
  body('name').trim().notEmpty().withMessage('Medication name is required'),
  body('dosage.value').isNumeric().withMessage('Dosage value must be a number'),
  body('dosage.unit').isIn(['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'sprays', 'patches', 'units'])
    .withMessage('Invalid dosage unit'),
  body('frequency.timesPerDay').isInt({ min: 1, max: 10 })
    .withMessage('Times per day must be between 1 and 10'),
  body('startDate').isISO8601().withMessage('Please provide a valid start date')
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

    const medicationData = {
      ...req.body,
      userId: req.user._id
    };

    const medication = new Medication(medicationData);
    await medication.save();

    res.status(201).json({
      status: 'success',
      message: 'Medication added successfully',
      data: {
        medication
      }
    });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/medications/:id
 * @desc    Get a specific medication
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medication) {
      return res.status(404).json({
        status: 'error',
        message: 'Medication not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        medication
      }
    });
  } catch (error) {
    console.error('Get medication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch medication'
    });
  }
});

/**
 * @route   PUT /api/medications/:id
 * @desc    Update a medication
 * @access  Private
 */
router.put('/:id', authenticateToken, [
  body('name').optional().trim().notEmpty().withMessage('Medication name cannot be empty'),
  body('dosage.value').optional().isNumeric().withMessage('Dosage value must be a number'),
  body('frequency.timesPerDay').optional().isInt({ min: 1, max: 10 })
    .withMessage('Times per day must be between 1 and 10')
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

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!medication) {
      return res.status(404).json({
        status: 'error',
        message: 'Medication not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Medication updated successfully',
      data: {
        medication
      }
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/medications/:id
 * @desc    Delete a medication
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medication) {
      return res.status(404).json({
        status: 'error',
        message: 'Medication not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete medication'
    });
  }
});

/**
 * @route   PUT /api/medications/:id/status
 * @desc    Update medication status (active/inactive)
 * @access  Private
 */
router.put('/:id/status', authenticateToken, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('discontinuedReason').optional().trim().notEmpty().withMessage('Discontinued reason cannot be empty')
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
      isActive: req.body.isActive
    };

    if (!req.body.isActive) {
      updateData.discontinuedDate = new Date();
      updateData.discontinuedReason = req.body.discontinuedReason;
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({
        status: 'error',
        message: 'Medication not found'
      });
    }

    res.json({
      status: 'success',
      message: `Medication ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        medication
      }
    });
  } catch (error) {
    console.error('Update medication status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update medication status'
    });
  }
});

/**
 * @route   GET /api/medications/reminders/due
 * @desc    Get medications due for reminder
 * @access  Private
 */
router.get('/reminders/due', authenticateToken, async (req, res) => {
  try {
    const dueMedications = await Medication.getDueForReminder(req.user._id);

    res.json({
      status: 'success',
      data: {
        medications: dueMedications,
        count: dueMedications.length
      }
    });
  } catch (error) {
    console.error('Get due medications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch due medications'
    });
  }
});

/**
 * @route   POST /api/medications/:id/taken
 * @desc    Mark medication as taken
 * @access  Private
 */
router.post('/:id/taken', authenticateToken, [
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
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

    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medication) {
      return res.status(404).json({
        status: 'error',
        message: 'Medication not found'
      });
    }

    // Mark dose as taken
    await medication.markDoseTaken(req.body.date);

    res.json({
      status: 'success',
      message: 'Medication marked as taken',
      data: {
        medication
      }
    });
  } catch (error) {
    console.error('Mark medication taken error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark medication as taken'
    });
  }
});

/**
 * @route   GET /api/medications/adherence/summary
 * @desc    Get medication adherence summary
 * @access  Private
 */
router.get('/adherence/summary', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const medications = await Medication.find({
      userId: req.user._id,
      isActive: true,
      'adherence.trackingEnabled': true
    });

    const summary = medications.map(med => ({
      id: med._id,
      name: med.name,
      adherenceRate: med.adherence.adherenceRate,
      missedDoses: med.adherence.missedDoses.length,
      status: med.status
    }));

    const overallAdherence = medications.length > 0 
      ? medications.reduce((sum, med) => sum + med.adherence.adherenceRate, 0) / medications.length
      : 100;

    res.json({
      status: 'success',
      data: {
        summary,
        overallAdherence: Math.round(overallAdherence),
        totalMedications: medications.length
      }
    });
  } catch (error) {
    console.error('Get adherence summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch adherence summary'
    });
  }
});

module.exports = router;
