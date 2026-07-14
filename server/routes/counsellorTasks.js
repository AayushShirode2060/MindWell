const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, reorderTasks } = require('../controllers/counsellorTaskController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('counsellor'), getTasks);
router.post('/', protect, roleCheck('counsellor'), createTask);
router.put('/reorder', protect, roleCheck('counsellor'), reorderTasks);
router.put('/:id', protect, roleCheck('counsellor'), updateTask);
router.delete('/:id', protect, roleCheck('counsellor'), deleteTask);

module.exports = router;
