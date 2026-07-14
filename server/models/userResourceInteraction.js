const mongoose = require('mongoose');

const userResourceInteractionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  bookmarked: { type: Boolean, default: false },
  viewedAt: { type: Date, default: null },
  completedGuide: { type: Boolean, default: false }
}, {
  timestamps: true
});

userResourceInteractionSchema.index({ user: 1, resource: 1 }, { unique: true });
userResourceInteractionSchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model('UserResourceInteraction', userResourceInteractionSchema);
