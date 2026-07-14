const GameSession = require('../models/GameSession');
const MoodEntry = require('../models/MoodEntry');

// POST /api/games/session — save a game session
exports.saveSession = async (req, res) => {
  try {
    const { game, duration, feedback } = req.body;
    const session = await GameSession.create({
      user: req.user._id, game, duration, feedback
    });
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/games/stats — get streak + session count
exports.getStats = async (req, res) => {
  try {
    const totalSessions = await GameSession.countDocuments({ user: req.user._id });

    // Calculate streak (consecutive days with at least 1 session)
    const sessions = await GameSession.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .select('completedAt');

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 30; i++) {
      const dayStart = new Date(currentDate);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasSession = sessions.some(s =>
        s.completedAt >= dayStart && s.completedAt < dayEnd
      );

      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break; // streak broken
      }
    }

    // Feedback distribution
    const feedbackStats = await GameSession.aggregate([
      { $match: { user: req.user._id, feedback: { $ne: null } } },
      { $group: { _id: '$feedback', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, totalSessions, streak, feedbackStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/games/recommend — AI mood-based recommendation
exports.getRecommendation = async (req, res) => {
  try {
    // Get latest mood entry
    const latestMood = await MoodEntry.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });

    const mood = latestMood?.mood || 'okay';

    const recommendations = {
      terrible: { game: 'breathing-bubble', reason: "You've been feeling down. Try a calming breathing exercise.", emoji: '🫧' },
      low: { game: 'zen-drawing', reason: 'Creative expression can help when feeling low.', emoji: '🎨' },
      okay: { game: 'gratitude-growth', reason: 'Plant seeds of positivity with gratitude journaling.', emoji: '🌱' },
      good: { game: 'memory-tiles', reason: 'Keep your mind sharp with a focus game!', emoji: '🧩' },
      great: { game: 'bubble-pop', reason: "You're feeling great! Celebrate with some fun.", emoji: '💫' }
    };

    res.json({ success: true, mood, recommendation: recommendations[mood] || recommendations.okay });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
