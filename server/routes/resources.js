const express = require('express');
const router = express.Router();
const {
  getAllResources, createResource, toggleBookmark, markViewed,
  getBookmarks, getRecentlyViewed, getRecommendations, getStats, getUserInteractions
} = require('../controllers/resourceController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', protect, getAllResources);
router.post('/', protect, roleCheck('counsellor', 'admin', 'superadmin'), createResource);
router.get('/bookmarks', protect, getBookmarks);
router.get('/recent', protect, getRecentlyViewed);
router.get('/recommend', protect, getRecommendations);
router.get('/stats', protect, getStats);
router.get('/interactions', protect, getUserInteractions);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/view', protect, markViewed);

module.exports = router;
