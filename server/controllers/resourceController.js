const Resource = require('../models/Resource');
const UserResourceInteraction = require('../models/UserResourceInteraction');
const MoodEntry = require('../models/MoodEntry');

// GET /api/resources — with search + filter
exports.getAllResources = async (req, res) => {
  try {
    const { category, tag, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    const resources = await Resource.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/resources (admin/counsellor)
exports.createResource = async (req, res) => {
  try {
    const { title, description, category, tags, content, readTime, steps, videoUrl, duration, items, helplineNumber, helplineHours, thumbnailEmoji, featured } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description and category required' });
    }
    const resource = await Resource.create({
      title, description, category, tags: tags || [],
      content, readTime, steps, videoUrl, duration, items,
      helplineNumber, helplineHours, thumbnailEmoji, featured,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/resources/:id/bookmark — toggle bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    let interaction = await UserResourceInteraction.findOne({
      user: req.user._id, resource: req.params.id
    });
    if (interaction) {
      interaction.bookmarked = !interaction.bookmarked;
      await interaction.save();
    } else {
      interaction = await UserResourceInteraction.create({
        user: req.user._id, resource: req.params.id, bookmarked: true
      });
    }
    res.json({ success: true, bookmarked: interaction.bookmarked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/resources/:id/view — mark as viewed
exports.markViewed = async (req, res) => {
  try {
    await UserResourceInteraction.findOneAndUpdate(
      { user: req.user._id, resource: req.params.id },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resources/bookmarks — user's bookmarked resources
exports.getBookmarks = async (req, res) => {
  try {
    const interactions = await UserResourceInteraction.find({
      user: req.user._id, bookmarked: true
    }).populate('resource').sort({ updatedAt: -1 });
    const resources = interactions.map(i => i.resource).filter(Boolean);
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resources/recent — recently viewed
exports.getRecentlyViewed = async (req, res) => {
  try {
    const interactions = await UserResourceInteraction.find({
      user: req.user._id, viewedAt: { $ne: null }
    }).populate('resource').sort({ viewedAt: -1 }).limit(6);
    const resources = interactions.map(i => i.resource).filter(Boolean);
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resources/recommend — mood-based recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const latestMood = await MoodEntry.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const mood = latestMood?.mood || 'neutral';

    const moodTagMap = {
      happy: ['self-care', 'focus'],
      sad: ['depression', 'self-care'],
      anxious: ['anxiety', 'stress'],
      angry: ['stress', 'self-care'],
      stressed: ['stress', 'focus'],
      tired: ['sleep', 'self-care'],
      neutral: ['focus', 'self-care']
    };
    const tags = moodTagMap[mood] || ['self-care'];

    const resources = await Resource.find({ tags: { $in: tags } }).limit(4);
    res.json({ success: true, mood, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resources/stats — progress
exports.getStats = async (req, res) => {
  try {
    const total = await UserResourceInteraction.countDocuments({
      user: req.user._id, viewedAt: { $ne: null }
    });
    const bookmarks = await UserResourceInteraction.countDocuments({
      user: req.user._id, bookmarked: true
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await UserResourceInteraction.countDocuments({
      user: req.user._id, viewedAt: { $gte: today }
    });
    res.json({ success: true, stats: { totalViewed: total, bookmarked: bookmarks, viewedToday: todayCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resources/interactions — get user's bookmark + view status for all resources
exports.getUserInteractions = async (req, res) => {
  try {
    const interactions = await UserResourceInteraction.find({ user: req.user._id });
    const map = {};
    interactions.forEach(i => {
      map[i.resource.toString()] = { bookmarked: i.bookmarked, viewedAt: i.viewedAt };
    });
    res.json({ success: true, interactions: map });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
