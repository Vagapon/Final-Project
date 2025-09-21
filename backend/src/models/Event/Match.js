
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  // Thông tin đội thi đấu
  team1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  team2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  
  // Thông tin sân thi đấu
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  
  // Thông tin thời gian
  matchDate: { type: Date, required: true }, // Ngày thi đấu
  matchTime: { type: String }, // Giờ bắt đầu (VD: "14:00")
  duration: { type: Number, default: 90 }, // Thời gian thi đấu (phút)
  
  // Thông tin vòng đấu
  round: { type: String, required: true }, // VD: "Round 1", "Round 2"
  matchNumber: { type: Number, required: true }, // Số thứ tự trận đấu
  
  // Thông tin địa điểm
  address: { type: String },
  location: { type: String },
  
  // Thông tin trạng thái và kết quả
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  score: {
    team1: { type: Number, default: 0 },
    team2: { type: Number, default: 0 }
  },
  
  // Liên kết với Event
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// Index để tối ưu truy vấn
matchSchema.index({ eventId: 1, matchDate: 1 });
matchSchema.index({ team1Id: 1, team2Id: 1 });
matchSchema.index({ fieldId: 1, matchDate: 1 });
matchSchema.index({ status: 1 });

// Middleware auto update `updatedAt`
matchSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
matchSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
