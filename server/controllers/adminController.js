const Appointment = require("../models/Appointment");
const ForumPost = require("../models/ForumPost");
const MoodEntry = require("../models/MoodEntry");
const Referral = require("../models/Referral");
const Screening = require("../models/Screening");
const User = require("../models/User");
const College = require("../models/College");
const Resource = require("../models/Resource");

//GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
    try {
        const isSuper = req.user.role === 'superadmin';
        const collegeFilter = !isSuper && req.user.college ? { college: req.user.college } : {};

        let studentFilter = { role: 'student', ...collegeFilter };
        let counsellorFilter = { role: 'counsellor', ...collegeFilter };

        const totalStudents = await User.countDocuments(studentFilter);
        const totalCounsellors = await User.countDocuments(counsellorFilter);
        const totalVolunteers = await User.countDocuments({ role: 'volunteer', ...collegeFilter });

        const totalAdmins = isSuper ? await User.countDocuments({ role: 'admin' }) : 0;
        const pendingAdmins = isSuper ? await User.countDocuments({ role: 'admin', adminVerified: false }) : 0;
        const totalColleges = isSuper ? await College.countDocuments() : 0;

        const scopedStudentIds = !isSuper && req.user.college
            ? await User.distinct('_id', studentFilter)
            : null;
        const apptFilter = scopedStudentIds ? { student: { $in: scopedStudentIds } } : {};

        // Mood stats
        const moodFilter = scopedStudentIds ? { user: { $in: scopedStudentIds } } : {};
        const moodEntries = await MoodEntry.countDocuments(moodFilter);
        const moodDistribution = await MoodEntry.aggregate([
            ...(scopedStudentIds ? [{ $match: { user: { $in: scopedStudentIds } } }] : []),
            { $group: { _id: '$mood', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Screening stats
        const screenFilter = scopedStudentIds ? { user: { $in: scopedStudentIds } } : {};
        const totalScreenings = await Screening.countDocuments(screenFilter);

        // Referral stats
        const totalReferrals = await Referral.countDocuments(apptFilter);
        const unresolvedReferrals = await Referral.countDocuments({ status: 'unresolved', ...apptFilter });

        // Appointment stats
        const totalAppointments = await Appointment.countDocuments(apptFilter);
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending', ...apptFilter });

        // Forum stats
        const totalPosts = await ForumPost.countDocuments();
        const flaggedPosts = await ForumPost.countDocuments({ isFlagged: true });

        // Resource stats
        const totalResources = await Resource.countDocuments();
        const resourceByCategory = await Resource.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // ── GRAPH DATA ──

        // User growth — last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, ...collegeFilter } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Issue distribution from appointments
        const issueDistribution = await Appointment.aggregate([
            ...(scopedStudentIds ? [{ $match: { student: { $in: scopedStudentIds } } }] : []),
            { $match: { issueType: { $exists: true, $ne: '' } } },
            { $group: { _id: '$issueType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        // App usage — appointments per week (last 8 weeks)
        const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
        const weeklyUsage = await Appointment.aggregate([
            { $match: { createdAt: { $gte: eightWeeksAgo }, ...apptFilter } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%U', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            analytics: {
                users: { totalStudents, totalCounsellors, totalVolunteers, totalAdmins, pendingAdmins, totalColleges },
                mood: { totalEntries: moodEntries, distribution: moodDistribution },
                screenings: { total: totalScreenings },
                referrals: { total: totalReferrals, unresolved: unresolvedReferrals },
                appointments: { total: totalAppointments, pending: pendingAppointments },
                forum: { totalPosts, flaggedPosts },
                resources: { total: totalResources, byCategory: resourceByCategory },
                graphs: { userGrowth, issueDistribution, weeklyUsage }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/pending-admins — superadmin only
exports.getPendingAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin', adminVerified: false })
            .populate('college', 'name')
            .select('-password -otp -otpExpires')
            .sort({ createdAt: -1 });
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/verify-admin/:id — superadmin only
exports.verifyAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        admin.adminVerified = true;
        admin.isApproved = true;

        // Assign admin to the college
        if (admin.college) {
            await College.findByIdAndUpdate(admin.college, { admin: admin._id });
        }

        await admin.save();
        res.json({ success: true, message: `${admin.name} verified as college admin`, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/reject-admin/:id — superadmin only
exports.rejectAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        admin.isActive = false;
        admin.adminVerified = false;
        admin.isApproved = false;
        await admin.save();
        res.json({ success: true, message: `${admin.name} rejected` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};