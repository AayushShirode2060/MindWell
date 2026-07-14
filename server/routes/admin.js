const express = require('express')
const router = express.Router();
const { getAnalytics, getPendingAdmins, verifyAdmin, rejectAdmin } = require("../controllers/adminController");
const protect = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

router.get('/analytics', protect, roleCheck('admin', 'superadmin'), getAnalytics);

// Superadmin only
router.get('/pending-admins', protect, roleCheck('superadmin'), getPendingAdmins);
router.put('/verify-admin/:id', protect, roleCheck('superadmin'), verifyAdmin);
router.put('/reject-admin/:id', protect, roleCheck('superadmin'), rejectAdmin);

module.exports = router;