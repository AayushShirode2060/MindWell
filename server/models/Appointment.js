const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'emergency'],
    default: 'pending'
  },

  // Session Mode
  sessionType: {
    type: String,
    enum: ['chat', 'audio', 'video'],
    default: 'chat'
  },
  jitsiRoomId: { type: String, default: null },

  // Pre-Session Form
  preSession: {
    feeling: { type: String, default: '' },
    issue: {
      type: String,
      enum: ['stress', 'anxiety', 'depression', 'academic', 'relationship', 'grief', 'self-esteem', 'other', ''],
      default: ''
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', ''],
      default: ''
    },
    details: { type: String, maxLength: 500, default: '' }
  },

  // Anonymous Booking
  isAnonymous: { type: Boolean, default: false },
  anonymousName: { type: String, default: '' },

  // Counsellor Notes
  reason: { type: String, maxLength: 500, default: '' },
  notes: { type: String, maxLength: 1000, default: '' },

  // Kanban Task Notes (for student)
  taskNotes: [{
    text: { type: String, required: true },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    createdAt: { type: Date, default: Date.now }
  }],

  // Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, maxLength: 500, default: '' },
    submittedAt: { type: Date, default: null }
  },

  // Emergency flag
  isEmergency: { type: Boolean, default: false }
}, {
  timestamps: true
});

appointmentSchema.index({ student: 1, createdAt: -1 });
appointmentSchema.index({ counsellor: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
