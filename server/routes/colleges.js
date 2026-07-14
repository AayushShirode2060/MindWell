const express = require('express');
const router = express.Router();
const { getColleges, createCollege, updateCollege, deleteCollege } = require('../controllers/collegeController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public — for registration dropdown
router.get('/', getColleges);

// Superadmin only
router.post('/', protect, roleCheck('superadmin'), createCollege);
router.put('/:id', protect, roleCheck('superadmin'), updateCollege);
router.delete('/:id', protect, roleCheck('superadmin'), deleteCollege);

module.exports = router;
