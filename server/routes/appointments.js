const express = require('express');
const router = express.Router();
const {
  getCounsellors, recommendCounsellor, createAppointment, getMyAppointments,
  getCounsellorAppointments, updateAppointment, getAvailableSlots,
  submitFeedback, updateTask, emergencyBooking,
  getCounsellorStats, getStudentHistory
} = require('../controllers/appointmentController');

const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/counsellors', protect, getCounsellors);
router.get('/recommend-counsellor', protect, roleCheck('student'), recommendCounsellor);
router.post('/', protect, roleCheck('student'), createAppointment);
router.post('/emergency', protect, roleCheck('student'), emergencyBooking);
router.get('/my', protect, getMyAppointments);
router.get('/counsellor', protect, roleCheck('counsellor'), getCounsellorAppointments);
router.get('/counsellor/stats', protect, roleCheck('counsellor'), getCounsellorStats);
router.get('/counsellor/student/:studentId', protect, roleCheck('counsellor'), getStudentHistory);


router.put('/:id', protect, updateAppointment);
router.post('/:id/feedback', protect, submitFeedback);
router.put('/:id/task', protect, updateTask);
router.get('/slots/:counsellorId', protect, getAvailableSlots);

module.exports = router;
