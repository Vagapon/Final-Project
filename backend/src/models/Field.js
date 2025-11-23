
const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên địa điểm (VD: "Sân bóng đá phủi ABC")
  fieldNumber: { type: String, required: true }, // Số sân (VD: "Sân 1", "Sân 2")
  address: { type: String, required: true }, // Địa chỉ cụ thể
  location: { type: String }, // Khu vực (VD: "Quận 1", "Quận 7")
  
  // Mục đích sử dụng sân
  purpose: {
    type: String,
    enum: ['event', 'rental'], // event: cho giải đấu, rental: cho thuê
    required: true
  },
  
  // Giá thuê theo giờ (chỉ áp dụng cho rental)
  pricePerHour: { type: Number, min: 0 }, // Không required vì sân event miễn phí
  
  // Giờ hoạt động
  openingHours: {
    start: { type: String, required: true }, // VD: "06:00"
    end: { type: String, required: true } // VD: "22:00"
  },
  
  // Trạng thái sân
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  
  // Thông tin quản lý - Admin/Staff tạo sân
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Hình ảnh sân
  images: [{ type: String, default: " " }], // Array các URL ảnh sân
  
  // Mô tả ngắn gọn
  description: { type: String, default: '' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index để tối ưu truy vấn
fieldSchema.index({ name: 'text', address: 'text', fieldNumber: 'text' });
fieldSchema.index({ purpose: 1, status: 1 });
fieldSchema.index({ managedBy: 1 });

// Middleware tự động cập nhật `updatedAt`
fieldSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

fieldSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Virtual để lấy thông tin mục đích sân
fieldSchema.virtual('purposeInfo').get(function() {
  const purposeMap = {
    'event': { name: 'Sân giải đấu', description: 'Dành cho các giải đấu chính thức', color: 'blue' },
    'rental': { name: 'Sân thuê', description: 'Dành cho thuê sân đá phủi', color: 'green' }
  };
  return purposeMap[this.purpose] || { name: 'Không xác định', description: '', color: 'gray' };
});

const Field = mongoose.model('Field', fieldSchema);
module.exports = Field;
