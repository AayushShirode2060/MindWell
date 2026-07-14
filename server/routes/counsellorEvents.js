const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/counsellorEventController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('counsellor'), getEvents);
router.post('/', protect, roleCheck('counsellor'), createEvent);
router.put('/:id', protect, roleCheck('counsellor'), updateEvent);
router.delete('/:id', protect, roleCheck('counsellor'), deleteEvent);

module.exports = router;
