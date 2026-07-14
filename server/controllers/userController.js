const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
    try {
        const isSuper = req.user.role === 'superadmin';
        const filter = !isSuper && req.user.college
            ? { college: req.user.college }
            : {};

        const users = await User.find(filter)
            .select('-password -otp -otpExpires')
            .populate('college', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Put /api/users/:id/approve
exports.approvedUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        ).select('-password');

        res.json({ success: true, message: `${user.name} approved`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//PUT /api/users/:id/deactivate
exports.deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');

        res.json({ success: true, message: `${user.name} deactivated`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/users/:id/activate
exports.activateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        ).select('-password');

        res.json({ success: true, message: `${user.name} activated`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/users/upload-proof — Cloudinary upload
exports.uploadProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        res.json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};