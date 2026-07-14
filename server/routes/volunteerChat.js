const express = require('express');
const router = express.Router();
const VolunteerChatMessage = require('../models/VolunteerChatMessage');
const protect = require('../middleware/auth');

// GET /api/volunteer-chat/:helpRequestId — get chat history
router.get('/:helpRequestId', protect, async (req, res) => {
  try {
    const messages = await VolunteerChatMessage.find({ helpRequest: req.params.helpRequestId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
