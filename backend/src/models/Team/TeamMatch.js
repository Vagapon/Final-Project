
const mongoose = require('mongoose');

const teamMatchSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
});
teamMatchSchema.index({ matchId: 1, teamId: 1 });

const TeamMatch = mongoose.model('TeamMatch', teamMatchSchema);
module.exports = TeamMatch;
