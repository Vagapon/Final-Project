
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiveId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: { 
    type: String, 
    enum: ['event_registration', 'booking', 'event_approved', 'booking_confirmed', 'match_scheduled', 'other'],
    default: 'other'
  },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
