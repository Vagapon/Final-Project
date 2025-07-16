// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Models (rất quan trọng để tạo collection)
require("./src/models/UserModel/User");
require("./src/models/UserModel/Role");
require("./src/models/UserModel/UserRole");

// Routes
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

module.exports = app;
