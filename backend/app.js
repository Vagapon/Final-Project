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

// CORS Configuration - support both local and production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',        // Local Vite dev
      'http://localhost:3000',        // Local fallback
      'https://final-project-eight-wheat.vercel.app', // Vercel frontend
      process.env.FRONTEND_URL,       // Production frontend (from env)
    ].filter(Boolean);
    
    // Allow requests without origin (mobile apps, curl, etc) or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('   Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', {
    message: err.message,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
