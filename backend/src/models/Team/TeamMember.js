
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  avatar: { type: String, default: "" },
  nameMember: { type: String, required: true },
  number: { type: Number, required: true, min: 1, max: 99 },
  isCaptain : { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

teamMemberSchema.index({ teamId: 1, nameMember: 1, number: 1 }, { unique: true });
const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
module.exports = TeamMember;
