const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Role", roleSchema);
// This schema defines a Role model with fields for name, code, and created date.