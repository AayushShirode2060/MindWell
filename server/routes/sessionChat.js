const express = require('express');
const router = express.Router();
const SessionChatMessage = require('../models/SessionChatMessage');
const protect = require('../middleware/auth');

// GET /api/session-chat/:appointmentId — get chat history
router.get('/:appointmentId', protect, async (req, res) => {
  try {
    const messages = await SessionChatMessage.find({ appointment: req.params.appointmentId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
