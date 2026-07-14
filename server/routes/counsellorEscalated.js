const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const HelpRequest = require('../models/HelpRequest');

// GET /api/counsellor-escalated - get escalated + active counsellor help requests
router.get('/', protect, roleCheck('counsellor', 'superadmin', 'admin'), async (req, res) => {
  try {
    let filter;
    
    if (req.user.role === 'counsellor') {
      // Show: escalated requests targeted to this counsellor (or unassigned) + active chats owned by this counsellor
      filter = {
        $or: [
          { 
            status: 'escalated',
            $or: [
              { escalatedTo: req.user._id },
              { escalatedTo: { $exists: false } },
              { escalatedTo: null }
            ]
          },
          { status: 'counsellor-active', escalatedTo: req.user._id }
        ]
      };
    } else {
      // Admin sees all escalated
      filter = { status: { $in: ['escalated', 'counsellor-active'] } };
    }

    const requests = await HelpRequest.find(filter)
      .populate('student', '_id name')
      .populate('assignedVolunteer', '_id name')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/counsellor-escalated/:id/accept - Counsellor accepts escalation
router.put('/:id/accept', protect, roleCheck('counsellor'), async (req, res) => {
  try {
    const request = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'counsellor-active', escalatedTo: req.user._id },
      { new: true }
    );

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const Appointment = require('../models/Appointment');
    
    // Create an emergency appointment 5 mins from now
    const now = new Date();
    const future = new Date(now.getTime() + 5 * 60000);
    const date = future.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const hours = future.getHours().toString().padStart(2, '0');
    const mins = future.getMinutes().toString().padStart(2, '0');
    const timeSlot = `${hours}:${mins}`;

    const appointment = await Appointment.create({
      student: request.student,
      counsellor: req.user._id,
      date: date,
      timeSlot: timeSlot,
      status: 'confirmed',
      sessionType: 'video', // Provide both chat and video options natively, default to video
      preSession: {
        issue: 'other',
        urgency: request.urgency || 'critical',
        details: `Escalated Help Request. Original Issue: ${request.issueType}`
      },
      reason: `Emergency Escalation`
    });

    // Emit event to student so they know counsellor accepted
    const io = req.app.get('io');
    if (io) {
      io.to(request._id.toString()).emit('escalation-accepted', { 
        counsellorName: req.user.name,
        helpRequestId: request._id.toString(),
        appointmentId: appointment._id,
        timeSlot
      });
    }

    res.json({ success: true, request, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/counsellor-escalated/:id/complete - Counsellor completes an escalated session
router.post('/:id/complete', protect, roleCheck('counsellor'), async (req, res) => {
  try {
    const { issueDiscussed, actionsTaken } = req.body;
    const request = await HelpRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'counsellor-active') {
      return res.status(400).json({ success: false, message: 'Request is not in counsellor-active state' });
    }

    request.status = 'completed';
    request.summary = { issueDiscussed, actionsTaken };
    await request.save();

    // Notify the student via socket
    const io = req.app.get('io');
    if (io) {
      io.to(request._id.toString()).emit('session-completed', {
        message: 'The counsellor has completed this session.'
      });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
