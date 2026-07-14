const mongoose = require('mongoose');

const volunteerChatMessageSchema = new mongoose.Schema({
  helpRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpRequest', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['student', 'volunteer', 'counsellor'], required: true },
  content: { type: String, required: true, maxLength: 2000 },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

volunteerChatMessageSchema.index({ helpRequest: 1, createdAt: 1 });

module.exports = mongoose.model('VolunteerChatMessage', volunteerChatMessageSchema);
