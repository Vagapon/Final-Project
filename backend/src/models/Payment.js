const mongoose = require('mongoose');

/**
 * Model Payment - Lưu chi tiết giao dịch thanh toán
 * (Optional: Nếu muốn tracking riêng lịch sử thanh toán)
 */
const paymentSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Thông tin thanh toán
  amount: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['sepay_qr', 'cash', 'momo', 'vnpay', 'bank_transfer'],
    default: 'sepay_qr'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // SePay specific
  transactionId: { type: String }, // ID từ SePay webhook
  paymentId: { type: String }, // Mã DH + shortId
  bankCode: { type: String }, // SEPAY_BANK
  accountNumber: { type: String }, // SEPAY_VA
  
  // Webhook data
  webhookData: { type: mongoose.Schema.Types.Mixed }, // Lưu toàn bộ data từ webhook
  
  // Timestamps
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index để tìm kiếm nhanh
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;

