const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, deleteNotification, markRead, getAdminNotifications } = require('../controllers/notificationController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', protect, getNotifications);
router.get('/admin', protect, roleCheck('admin', 'superadmin'), getAdminNotifications);
router.post('/', protect, roleCheck('admin', 'superadmin'), createNotification);
router.delete('/:id', protect, roleCheck('admin', 'superadmin'), deleteNotification);
router.put('/:id/read', protect, markRead);

module.exports = router;
