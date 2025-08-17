
const mongoose = require('mongoose');

const sportTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  description: { type: String },
  rules: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SportType = mongoose.model('SportType', sportTypeSchema);
module.exports = SportType;
