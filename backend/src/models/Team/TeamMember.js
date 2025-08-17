
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
module.exports = TeamMember;
