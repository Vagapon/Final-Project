
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortName: { type: String },
  description: { type: String },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true   },
  avatar: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

teamSchema.index({ name: 1 }, { unique: true, });
const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
