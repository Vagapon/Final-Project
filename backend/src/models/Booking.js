
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String },
  paymentId: { type: String },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
bookingSchema.index({ fieldId: 1, startTime: 1, endTime: 1 });

// Pre-save hook để tính duration và totalPrice
bookingSchema.pre('save', async function(next) {
  if (this.startTime && this.endTime) {
    this.duration = (this.endTime - this.startTime) / (1000 * 60 * 60); // Tính giờ
    const field = await mongoose.model('Field').findById(this.fieldId);
    if (field) {
      this.totalPrice = this.duration * field.pricePerHour;
    }
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
