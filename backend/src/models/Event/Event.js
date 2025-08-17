
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sportTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SportType', required: true },
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  address: { type: String },
  location: { type: String },
  numberOfMatch: { type: Number },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
eventSchema.index({ sportTypeId: 1, seasonId: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
