const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  issueType: {
    type: String,
    required: true,
    enum: ['Anxiety', 'Stress', 'Depression', 'Academic Pressure', 'Loneliness', 'Other']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'escalated', 'counsellor-active', 'rejected'],
    default: 'pending'
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // A counsellor
    default: null
  },
  summary: {
    issueDiscussed: { type: String, default: '' },
    actionsTaken: { type: String, default: '' }
  },
  studentFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
