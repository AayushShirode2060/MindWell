const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// POST /api/help-requests (Student creates a request)
exports.createHelpRequest = async (req, res) => {
  try {
    const { issueType, urgency } = req.body;
    
    // Ensure student doesn't have an already active help request
    const existing = await HelpRequest.findOne({ 
      student: req.user._id, 
      status: { $in: ['pending', 'active', 'escalated', 'counsellor-active'] } 
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active help request.' });
    }

    const helpRequest = await HelpRequest.create({
      student: req.user._id,
      issueType,
      urgency
    });

    res.status(201).json({ success: true, helpRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/help-requests/pending (Volunteers view queue)
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({ status: 'pending' })
      .populate('student', '_id name') // The frontend will mask the name, we just need ID for uniqueness if needed
      .sort({ urgency: -1, createdAt: -1 }); // High urgency first, then oldest

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/help-requests/:id/accept (Volunteer accepts)
exports.acceptHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);
    
    if (!helpRequest) return res.status(404).json({ success: false, message: 'Request not found' });
    if (helpRequest.status !== 'pending') return res.status(400).json({ success: false, message: 'Request is already taken or closed' });

    helpRequest.status = 'active';
    helpRequest.assignedVolunteer = req.user._id;
    await helpRequest.save();

    res.json({ success: true, helpRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/help-requests/:id/escalate (Volunteer escalates)
exports.escalateHelpRequest = async (req, res) => {
  try {
    const { counsellorId } = req.body;
    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) return res.status(404).json({ success: false, message: 'Request not found' });

    helpRequest.status = 'escalated';
    
    // Target a specific counsellor if provided
    if (counsellorId) {
       helpRequest.escalatedTo = counsellorId;
    }

    await helpRequest.save();

    // Award 5 gamification points for identifying crisis and escalating properly
    const volunteer = await User.findById(req.user._id);
    if (volunteer) {
        volunteer.gamificationPoints = (volunteer.gamificationPoints || 0) + 5;
        await volunteer.save();
    }

    res.json({ success: true, message: 'Request escalated successfully to the selected counsellor', helpRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/help-requests/:id/complete (Volunteer completes & summarizes)
exports.completeHelpRequest = async (req, res) => {
  try {
    const { issueDiscussed, actionsTaken } = req.body;
    const helpRequest = await HelpRequest.findById(req.params.id);
    
    if (!helpRequest) return res.status(404).json({ success: false, message: 'Request not found' });
    
    helpRequest.status = 'completed';
    helpRequest.summary = { issueDiscussed, actionsTaken };
    await helpRequest.save();

    // Gamification reward
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'gamification.points': 10 }
    });

    res.json({ success: true, helpRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/help-requests/active (Get current active request for user - student or volunteer)
exports.getActiveRequest = async (req, res) => {
  try {
    const filter = req.user.role === 'student' 
       ? { student: req.user._id, status: { $in: ['pending', 'active', 'escalated', 'counsellor-active'] } }
       : req.user.role === 'counsellor'
         ? { escalatedTo: req.user._id, status: 'counsellor-active' }
         : { assignedVolunteer: req.user._id, status: 'active' };

    const helpRequest = await HelpRequest.findOne(filter)
      .populate('student', '_id name')
      .populate('assignedVolunteer', '_id name')
      .populate('escalatedTo', '_id name');

    res.json({ success: true, helpRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
