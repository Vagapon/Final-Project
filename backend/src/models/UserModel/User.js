const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // tên đầy đủ
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // sẽ hash
  phone_number: String,
  avatar: { type: String, default: "" },
  address: String,
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
