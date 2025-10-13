const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  startTime: { type: String, required: true }, // "14:00"
  endTime: { type: String, required: true },   // "15:30"
  timeType: { 
    type: String, 
    enum: ['ca_sang', 'ca_chieu', 'ca_toi'],
    required: true 
  },
  multiplier: { type: Number, default: 1.0, min: 0.1, max: 3.0 },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'maintenance'],
    default: 'available' 
  },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

timeSlotSchema.index({ fieldId: 1, startTime: 1 });
timeSlotSchema.index({ status: 1 });

// Virtual để tính giá
timeSlotSchema.virtual('calculatedPrice').get(function() {
  return this.pricePerHour * 1.5 * this.multiplier;
});

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
module.exports = TimeSlot;
