const College = require('../models/College');

// GET /api/colleges — public, for dropdown
exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true }).select('name domain').sort({ name: 1 });
    res.json({ success: true, colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/colleges — superadmin only
exports.createCollege = async (req, res) => {
  try {
    const { name, domain, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'College name is required' });
    const exists = await College.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'College already exists' });
    const college = await College.create({ name, domain, address });
    res.status(201).json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/colleges/:id — superadmin only
exports.updateCollege = async (req, res) => {
  try {
    const { name, domain, address, isActive } = req.body;
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { name, domain, address, isActive },
      { new: true, runValidators: true }
    );
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/colleges/:id — superadmin only
exports.deleteCollege = async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'College deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
