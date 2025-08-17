
const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  location: { type: String },
  pricePerHour: { type: Number, required: true },
  openingHours: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  available: { type: Boolean, default: true },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
fieldSchema.index({ name: 'text', address: 'text' });

const Field = mongoose.model('Field', fieldSchema);
module.exports = Field;
