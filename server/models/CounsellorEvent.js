const mongoose = require('mongoose');

const counsellorEventSchema = new mongoose.Schema({
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxLength: 100 },
  date: { type: Date, required: true },
  time: { type: String, default: '' },
  color: { type: String, default: 'blue' }, // blue, emerald, amber, red, purple
  notes: { type: String, maxLength: 300, default: '' }
}, {
  timestamps: true
});

counsellorEventSchema.index({ counsellor: 1, date: 1 });

module.exports = mongoose.model('CounsellorEvent', counsellorEventSchema);
