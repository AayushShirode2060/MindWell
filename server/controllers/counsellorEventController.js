const CounsellorEvent = require('../models/CounsellorEvent');

// GET /api/counsellor-events
exports.getEvents = async (req, res) => {
  try {
    const events = await CounsellorEvent.find({ counsellor: req.user._id }).sort({ date: 1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/counsellor-events
exports.createEvent = async (req, res) => {
  try {
    const { title, date, time, color, notes } = req.body;
    if (!title || !date) return res.status(400).json({ success: false, message: 'Title and date are required' });
    const event = await CounsellorEvent.create({
      counsellor: req.user._id, title, date: new Date(date), time, color: color || 'blue', notes
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/counsellor-events/:id
exports.updateEvent = async (req, res) => {
  try {
    const { title, date, time, color, notes } = req.body;
    const event = await CounsellorEvent.findOne({ _id: req.params.id, counsellor: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (title) event.title = title;
    if (date) event.date = new Date(date);
    if (time !== undefined) event.time = time;
    if (color) event.color = color;
    if (notes !== undefined) event.notes = notes;
    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/counsellor-events/:id
exports.deleteEvent = async (req, res) => {
  try {
    await CounsellorEvent.findOneAndDelete({ _id: req.params.id, counsellor: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
