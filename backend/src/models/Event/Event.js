// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sportTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SportType', required: true },
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  maxTeams: { type: Number, default: null, min: 0 },
  startDate: {
    type: Date,
    required: true // Bắt buộc có ngày bắt đầu
  },
  endDate: {
    type: Date,
    required: true // Bắt buộc có ngày kết thúc
  },
  address: { type: String },
  location: { type: String },
  numberOfMatch: { type: Number },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming' // Mặc định upcoming
  },
  avatar: { type: String, default: "" }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index để tối ưu truy vấn
eventSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
eventSchema.index({ sportTypeId: 1, seasonId: 1 });

// Middleware auto update `updatedAt`
eventSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
eventSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;