
const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  win: { type: Number },
  loss: { type: Number },
  draw: { type: Number },
  gf: { type: Number },
  ga: { type: Number },
  gd: { type: Number, default: function() { return this.gf - this.ga; } },
  point: { type: Number },
  updatedAt: { type: Date, default: Date.now }
});

const Ranking = mongoose.model('Ranking', rankingSchema);
module.exports = Ranking;
