
const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // year: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active' // Mặc định active
  },
  backgroundImage: { type: String, default: "" }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure unique name (case-insensitive)
seasonSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const Season = mongoose.model('Season', seasonSchema);
module.exports = Season;
