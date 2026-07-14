const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const Screening = require('../models/Screening');
const ChatMessage = require('../models/ChatMessage');
const { sendEmail } = require('../services/emailService');
const { bookingConfirmTemplate, jitsiLinkTemplate } = require('../services/emailTemplates');

// GET /api/appointments/counsellors
exports.getCounsellors = async (req, res) => {
  try {
    const counsellors = await User.find({
      role: 'counsellor', isVerified: true, isActive: true
    }).select('name email specialization phone');
    res.json({ success: true, counsellors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/recommend-counsellor — AI-based recommendation
exports.recommendCounsellor = async (req, res) => {
  try {
    // Get student's latest mood
    const latestMood = await MoodEntry.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    // Get latest screening
    const latestScreening = await Screening.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    // Get recent chat moods
    const recentChats = await ChatMessage.find({
      user: req.user._id, detectMood: { $ne: null }
    }).sort({ createdAt: -1 }).limit(5);

    // Determine dominant concern
    const moodCounts = {};
    recentChats.forEach(c => {
      if (c.detectMood) moodCounts[c.detectMood] = (moodCounts[c.detectMood] || 0) + 1;
    });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    // Map mood/screening to specialization keywords
    const specMap = {
      anxiety: 'Anxiety', stress: 'Stress', sadness: 'Depression',
      anger: 'Anger Management', crisis: 'Crisis', insomnia: 'Sleep'
    };
    const suggestedSpec = specMap[dominantMood] || '';

    // Find matching counsellor
    const counsellors = await User.find({ role: 'counsellor', isVerified: true, isActive: true })
      .select('name email specialization');

    let recommended = counsellors.find(c =>
      c.specialization?.toLowerCase().includes(suggestedSpec.toLowerCase())
    );
    if (!recommended && counsellors.length > 0) recommended = counsellors[0];

    res.json({
      success: true,
      analysis: {
        mood: latestMood?.mood || 'unknown',
        screeningSeverity: latestScreening?.severity || 'unknown',
        dominantConcern: dominantMood,
        suggestedSpecialization: suggestedSpec
      },
      recommended
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/appointments — book appointment
exports.createAppointment = async (req, res) => {
  try {
    const { counsellorId, date, timeSlot, sessionType, preSession, isAnonymous, anonymousName, reason, isEmergency } = req.body;

    if (!counsellorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Counsellor, date and time slot are required' });
    }

    // Check slot availability (skip for emergency)
    if (!isEmergency) {
      const existing = await Appointment.findOne({
        counsellor: counsellorId, date: new Date(date), timeSlot,
        status: { $in: ['pending', 'confirmed'] }
      });
      if (existing) return res.status(400).json({ success: false, message: 'This slot is already booked' });
    }

    // Generate Jitsi room for video calls
    let jitsiRoomId = null;
    if (sessionType === 'video') {
      jitsiRoomId = `mindwell-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    const appointment = await Appointment.create({
      student: req.user._id,
      counsellor: counsellorId,
      date: new Date(date),
      timeSlot,
      sessionType: sessionType || 'chat',
      jitsiRoomId,
      preSession: preSession || {},
      isAnonymous: isAnonymous || false,
      anonymousName: isAnonymous ? (anonymousName || 'Anonymous') : '',
      reason: reason || '',
      isEmergency: isEmergency || false,
      status: isEmergency ? 'emergency' : 'pending'
    });

    const populated = await appointment.populate('counsellor', 'name email');

    // Send confirmation email to student
    try {
      await sendEmail(
        req.user.email,
        '📅 MindWell — Appointment Confirmed',
        bookingConfirmTemplate(
          isAnonymous ? (anonymousName || 'Student') : req.user.name,
          populated.counsellor.name,
          new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
          timeSlot,
          sessionType || 'chat',
          jitsiRoomId
        )
      );
    } catch (emailErr) { console.log('Email send failed:', emailErr.message); }

    // Send Jitsi link to counsellor for video
    if (sessionType === 'video' && populated.counsellor?.email) {
      try {
        await sendEmail(
          populated.counsellor.email,
          '🎥 MindWell — Video Session Scheduled',
          jitsiLinkTemplate(populated.counsellor.name, jitsiRoomId, timeSlot, new Date(date).toLocaleDateString('en-IN'))
        );
      } catch (e) { console.log('Counsellor email failed:', e.message); }
    }

    res.status(201).json({ success: true, message: 'Appointment booked!', appointment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/my
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user._id })
      .populate('counsellor', 'name email specialization')
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/counsellor
exports.getCounsellorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ counsellor: req.user._id })
      .populate('student', 'name email')
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();
    res.json({ success: true, message: 'Appointment updated', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/appointments/:id/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    appointment.feedback = { rating, comment: comment || '', submittedAt: new Date() };
    await appointment.save();
    res.json({ success: true, message: 'Feedback submitted!', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/appointments/:id/task — add/update kanban task
exports.updateTask = async (req, res) => {
  try {
    const { taskId, text, status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    if (taskId) {
      // Update existing task
      const task = appointment.taskNotes.id(taskId);
      if (task) { if (text) task.text = text; if (status) task.status = status; }
    } else {
      // Add new task
      appointment.taskNotes.push({ text, status: 'todo' });
    }
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/slots/:counsellorId?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ];

    const booked = await Appointment.find({
      counsellor: counsellorId, date: new Date(date), status: { $in: ['pending', 'confirmed', 'emergency'] }
    });
    const bookedSlots = booked.map(a => a.timeSlot);
    const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

    res.json({ success: true, date, availableSlots, bookedSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/appointments/emergency — priority booking
exports.emergencyBooking = async (req, res) => {
  try {
    // Find first available counsellor
    const counsellor = await User.findOne({ role: 'counsellor', isVerified: true, isActive: true });
    if (!counsellor) return res.status(404).json({ success: false, message: 'No counsellors available' });

    const now = new Date();
    const jitsiRoomId = `mindwell-emergency-${Date.now()}`;

    const appointment = await Appointment.create({
      student: req.user._id,
      counsellor: counsellor._id,
      date: now,
      timeSlot: 'EMERGENCY',
      sessionType: 'video',
      jitsiRoomId,
      isEmergency: true,
      status: 'emergency',
      preSession: { urgency: 'critical', feeling: 'Need immediate help' }
    });

    // Alert counsellor
    try {
      await sendEmail(
        counsellor.email,
        '🚨 EMERGENCY — Student Needs Immediate Help',
        `<h2>🚨 Emergency Session Request</h2>
        <p>A student needs immediate support.</p>
        <p><strong>Join now:</strong> <a href="https://meet.jit.si/${jitsiRoomId}">https://meet.jit.si/${jitsiRoomId}</a></p>`
      );
    } catch (e) { console.log('Emergency email failed:', e.message); }

    res.status(201).json({
      success: true,
      message: 'Emergency session created!',
      appointment,
      jitsiLink: `https://meet.jit.si/${jitsiRoomId}`,
      counsellor: { name: counsellor.name }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/appointments/counsellor/stats — dashboard analytics
exports.getCounsellorStats = async (req, res) => {
  try {
    const counsellorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppts = await Appointment.countDocuments({
      counsellor: counsellorId, date: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed', 'emergency'] }
    });

    // This week
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekAppts = await Appointment.countDocuments({
      counsellor: counsellorId, date: { $gte: weekStart },
      status: { $in: ['pending', 'confirmed', 'completed', 'emergency'] }
    });

    // Totals
    const totalCompleted = await Appointment.countDocuments({ counsellor: counsellorId, status: 'completed' });
    const totalPending = await Appointment.countDocuments({ counsellor: counsellorId, status: 'pending' });
    const totalStudents = await Appointment.distinct('student', { counsellor: counsellorId });
    const totalEmergency = await Appointment.countDocuments({ counsellor: counsellorId, isEmergency: true });

    // Average rating
    const rated = await Appointment.find({
      counsellor: counsellorId, 'feedback.rating': { $ne: null }
    }).select('feedback.rating');
    const avgRating = rated.length > 0
      ? (rated.reduce((sum, a) => sum + a.feedback.rating, 0) / rated.length).toFixed(1)
      : 0;

    // Issue breakdown
    const allAppts = await Appointment.find({ counsellor: counsellorId }).select('preSession.issue');
    const issueCounts = {};
    allAppts.forEach(a => {
      const issue = a.preSession?.issue;
      if (issue) issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });

    // Upcoming today
    const upcomingToday = await Appointment.find({
      counsellor: counsellorId, date: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed', 'emergency'] }
    }).populate('student', 'name email').sort({ timeSlot: 1 });

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = await Appointment.countDocuments({
        counsellor: counsellorId, date: { $gte: d, $lt: next }
      });
      weeklyTrend.push({
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        sessions: count
      });
    }

    // Status distribution
    const confirmed = await Appointment.countDocuments({ counsellor: counsellorId, status: 'confirmed' });
    const cancelled = await Appointment.countDocuments({ counsellor: counsellorId, status: 'cancelled' });
    const statusDistribution = {
      pending: totalPending,
      confirmed,
      completed: totalCompleted,
      cancelled,
      emergency: totalEmergency
    };

    res.json({
      success: true,
      stats: {
        todaySessions: todayAppts,
        thisWeek: thisWeekAppts,
        totalCompleted,
        totalPending,
        totalStudents: totalStudents.length,
        totalEmergency,
        avgRating: parseFloat(avgRating),
        issueCounts,
        upcomingToday,
        weeklyTrend,
        statusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/counsellor/student/:studentId — student history
exports.getStudentHistory = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      counsellor: req.user._id, student: req.params.studentId
    }).sort({ date: -1 });
    const student = await User.findById(req.params.studentId).select('name email');
    res.json({ success: true, student, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
