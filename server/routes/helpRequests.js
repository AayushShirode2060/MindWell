const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createHelpRequest,
  getPendingRequests,
  acceptHelpRequest,
  escalateHelpRequest,
  completeHelpRequest,
  getActiveRequest
} = require('../controllers/helpRequestController');

// Student routes
router.post('/', protect, roleCheck('student'), createHelpRequest);

// Volunteer routes
router.get('/pending', protect, roleCheck('volunteer'), getPendingRequests);
router.post('/:id/accept', protect, roleCheck('volunteer'), acceptHelpRequest);
router.post('/:id/escalate', protect, roleCheck('volunteer'), escalateHelpRequest);
router.post('/:id/complete', protect, roleCheck('volunteer'), completeHelpRequest);

// Shared
router.get('/active', protect, getActiveRequest);

// Volunteer stats
router.get('/stats', protect, roleCheck('volunteer'), async (req, res) => {
  try {
    const HelpRequest = require('../models/HelpRequest');
    
    const [completedCount, uniqueStudents] = await Promise.all([
      HelpRequest.countDocuments({ assignedVolunteer: req.user._id, status: { $in: ['completed', 'escalated'] } }),
      HelpRequest.distinct('student', { assignedVolunteer: req.user._id, status: { $in: ['completed', 'escalated'] } })
    ]);

    res.json({ 
      success: true, 
      stats: { 
        sessionsCompleted: completedCount, 
        helpedStudents: uniqueStudents.length 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
