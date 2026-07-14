const mongoose = require('mongoose');

const sessionChatMessageSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['student', 'counsellor'], required: true },
  content: { type: String, required: true, maxLength: 2000 },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

sessionChatMessageSchema.index({ appointment: 1, createdAt: 1 });

module.exports = mongoose.model('SessionChatMessage', sessionChatMessageSchema);
