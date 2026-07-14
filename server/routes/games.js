const express = require('express');
const router = express.Router();
const { saveSession, getStats, getRecommendation } = require('../controllers/gameController');
const protect = require('../middleware/auth');

router.post('/session', protect, saveSession);
router.get('/stats', protect, getStats);
router.get('/recommend', protect, getRecommendation);

module.exports = router;
