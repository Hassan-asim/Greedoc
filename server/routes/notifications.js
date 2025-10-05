const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/firebase');

const router = express.Router();

// Get current user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    res.json({ status: 'success', data: items });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
  }
});

// Mark one notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const ref = db.collection('notifications').doc(req.params.id);
    await ref.update({ isRead: true, readAt: new Date() });
    res.json({ status: 'success' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Failed to update notification' });
  }
});

module.exports = router;


