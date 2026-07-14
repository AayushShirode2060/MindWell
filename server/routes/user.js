const express = require('express')
const router = express.Router();
const { getAllUsers, approvedUser, deactivateUser, activateUser, uploadProof } = require("../controllers/userController");
const protect = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { upload } = require('../config/cloudinary');

router.get('/', protect, roleCheck('admin', 'superadmin'), getAllUsers);
router.put('/:id/approve', protect, roleCheck('admin', 'superadmin'), approvedUser);
router.put('/:id/deactivate', protect, roleCheck('admin', 'superadmin'), deactivateUser);
router.put('/:id/activate', protect, roleCheck('admin', 'superadmin'), activateUser);

// Upload proof — public (used during registration before auth)
router.post('/upload-proof', upload.single('proof'), uploadProof);

module.exports = router;