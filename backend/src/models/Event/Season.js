
const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Season = mongoose.model('Season', seasonSchema);
module.exports = Season;
