const CounsellorTask = require('../models/CounsellorTask');

// GET /api/counsellor-tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await CounsellorTask.find({ counsellor: req.user._id }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/counsellor-tasks
exports.createTask = async (req, res) => {
  try {
    const { text, priority } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Task text is required' });
    const count = await CounsellorTask.countDocuments({ counsellor: req.user._id, status: 'todo' });
    const task = await CounsellorTask.create({
      counsellor: req.user._id, text, priority: priority || 'medium', order: count
    });
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/counsellor-tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { text, status, priority, order } = req.body;
    const task = await CounsellorTask.findOne({ _id: req.params.id, counsellor: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (text !== undefined) task.text = text;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (order !== undefined) task.order = order;
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/counsellor-tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    await CounsellorTask.findOneAndDelete({ _id: req.params.id, counsellor: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/counsellor-tasks/reorder — bulk reorder after drag-drop
exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // [{ _id, status, order }]
    if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ success: false, message: 'Tasks array required' });
    const ops = tasks.map(t => ({
      updateOne: {
        filter: { _id: t._id, counsellor: req.user._id },
        update: { status: t.status, order: t.order }
      }
    }));
    await CounsellorTask.bulkWrite(ops);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
