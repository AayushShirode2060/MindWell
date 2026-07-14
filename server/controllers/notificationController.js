const Notification = require('../models/Notification');

// GET /api/notifications — get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const filter = { isActive: true };
    // Scope by audience
    const roleMap = { student: 'students', counsellor: 'counsellors', volunteer: 'volunteers' };
    const audienceFilter = {
      $or: [
        { audience: 'all' },
        { audience: roleMap[req.user.role] || 'all' }
      ]
    };
    // Scope by college if user has one
    const collegeFilter = req.user.college
      ? { $or: [{ college: null }, { college: req.user.college }] }
      : {};

    const notifications = await Notification.find({ ...filter, ...audienceFilter, ...collegeFilter })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications — admin/superadmin create
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, priority, audience } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });

    const notification = await Notification.create({
      title, message, type, priority, audience,
      college: req.user.role === 'admin' ? req.user.college : null,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/:id/read — mark as read
exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notifications/admin — get all notifications created by admin
exports.getAdminNotifications = async (req, res) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { college: req.user.college };
    const notifications = await Notification.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
