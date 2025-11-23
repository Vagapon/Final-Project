// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const { eventUpload } = require("./src/config/cloudinary");



// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const seasonRoutes = require("./src/routes/seasonRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const teamRoutes = require("./src/routes/teamRoutes");
const memberRoutes = require("./src/routes/memberRoutes");
const eventRegisRoutes = require("./src/routes/eventRegisRoutes");
const fieldRoutes = require("./src/routes/fieldRoutes");
const timeSlotRoutes = require("./src/routes/timeSlotRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const rankingRoutes = require("./src/routes/rankingRoutes");
// const matchScheduleRoutes = require("./src/routes/matchScheduleRoutes");
// const TeamMatch = require("./src/models/Team/TeamMatch");


const app = express();
dotenv.config();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔍 Logging middleware để debug routing
app.use((req, res, next) => {
  // console.log(`📥 ${req.method} ${req.path}`);
  next();
});

require("./src/models/UserModel/User");
require("./src/models/UserModel/Role");
require("./src/models/UserModel/UserRole");
require("./src/models/Event/Season");
require("./src/models/Event/Event");
require("./src/models/Event/EventRegistration");
require("./src/models/Event/SportType")
require("./src/models/Team/Team");
require("./src/models/Team/TeamMatch");
require("./src/models/Team/TeamMember");
require("./src/models/Event/Match");
require("./src/models/Field");
require("./src/models/TimeSlot");
require("./src/models/Booking");
require("./src/models/Notification");
require("./src/models/Blog");
require("./src/models/Event/Ranking");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/season", eventUpload.single('backgroundImage'), seasonRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/sport-types", seasonRoutes)
app.use("/api/team", teamRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/event-registrations", eventRegisRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/timeslots", timeSlotRoutes);
app.use("/api/bookings", bookingRoutes);
// app.use("/api/schedule", matchScheduleRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/rankings", rankingRoutes);

// Alias route cho SePay webhook (không có 's')
app.use("/api/payment", paymentRoutes);

// Route trực tiếp cho SePay (không có /api prefix)
app.use("/payment", paymentRoutes);

console.log('✅ Payment routes registered:');
console.log('   - /api/payments/*');
console.log('   - /api/payment/*');
console.log('   - /payment/* (for SePay webhook)');

module.exports = app;
