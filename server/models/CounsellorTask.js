const mongoose = require('mongoose');

const counsellorTaskSchema = new mongoose.Schema({
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxLength: 300 },
  status: {
    type: String,
    enum: ['todo', 'ongoing', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

counsellorTaskSchema.index({ counsellor: 1, status: 1 });

module.exports = mongoose.model('CounsellorTask', counsellorTaskSchema);
