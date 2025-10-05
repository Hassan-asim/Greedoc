const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/firebase');

const router = express.Router();

/**
 * @route   GET /api/events/calendar/:year/:month
 * @desc    Get patient-created events for a specific month
 * @access  Private
 */
router.get('/calendar/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const snap = await db.collection('calendarEvents')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    const byDate = {};
    snap.forEach(doc => {
      const d = doc.data();
      const dateKey = (d.date?.toDate ? d.date.toDate() : d.date).toISOString().split('T')[0];
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push({ id: doc.id, ...d });
    });

    res.json({ status: 'success', data: { events: byDate, month: parseInt(month), year: parseInt(year) } });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch calendar events' });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new patient event
 * @access  Private
 */
router.post('/', authenticateToken, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['medication','appointment','exercise','reminder']).withMessage('Invalid type'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').optional().isString(),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const userId = req.user.id;
    const { title, type, date, time, description } = req.body;
    const eventDoc = {
      userId,
      title,
      type,
      date: new Date(date),
      time: time || null,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const ref = await db.collection('calendarEvents').add(eventDoc);
    res.status(201).json({ status: 'success', data: { id: ref.id, ...eventDoc } });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create event' });
  }
});

module.exports = router;


