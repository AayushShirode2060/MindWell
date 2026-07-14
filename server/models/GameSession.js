const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game: {
    type: String,
    enum: ['breathing-bubble', 'bubble-pop', 'memory-tiles', 'zen-drawing', 'gratitude-growth',
        'color-match', 'wave-touch', 'thought-catcher', 'rhythm-tap', 'sliding-puzzle',
        'grow-tree', 'focus-dot', 'thought-release', 'pattern-tracing', 'loop-relaxer'
    ],

    required: true
  },
  duration: { type: Number, required: true }, // seconds played
  feedback: { type: String, enum: ['better', 'same', 'worse', null], default: null },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

gameSessionSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);
