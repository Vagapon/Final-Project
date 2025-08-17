
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  address: { type: String },
  location: { type: String },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'] },
  result: { type: String, enum: ['win', 'loss', 'draw'] },
  score: [{ type: Number }], // [scoreTeam1, scoreTeam2]
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  // fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' }, // Liên kết với sân
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
matchSchema.index({ startDate: 1, endDate: 1});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
