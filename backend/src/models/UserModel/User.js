const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // tên đầy đủ
  email: { type: String, required: true, unique: true },
  password: {
  type: String,
  required: function () {
    // Chỉ bắt buộc password nếu user này không phải từ Firebase
    return !this.firebaseUid;
  }
},
  firebaseUid: { type: String },
  provider: { type: String, default: "local" },

  phone_number: {
    type: String, 
    unique: true, 
    required: function () {
      // Chỉ bắt buộc phone_number nếu user này không phải từ Firebase
      return !this.firebaseUid;
    }
  }, 
  avatar: { type: String, default: "" },
  address: { type: String, default: "" },
  passwordResetOTP: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
