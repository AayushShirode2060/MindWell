const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['article', 'guide', 'video', 'toolkit', 'helpline'],
    required: true
  },
  tags: [String], // ['stress', 'anxiety', 'sleep', 'focus', 'depression', 'self-care']

  // Article fields
  content: { type: String, default: '' }, // full article body (markdown-ish)
  readTime: { type: Number, default: 3 }, // minutes

  // Guide fields (step-by-step)
  steps: [{
    step: Number,
    title: String,
    description: String
  }],

  // Video fields
  videoUrl: { type: String, default: '' }, // YouTube embed URL
  duration: { type: String, default: '' }, // "3 min"

  // Toolkit fields
  items: [{
    title: String,
    description: String,
    icon: String // emoji
  }],

  // Helpline fields
  helplineNumber: { type: String, default: '' },
  helplineHours: { type: String, default: '24/7' },

  // Common
  thumbnailEmoji: { type: String, default: '📄' },
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

resourceSchema.index({ category: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
