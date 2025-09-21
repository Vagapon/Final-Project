// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");



// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const seasonRoutes = require("./src/routes/seasonRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const teamRoutes = require("./src/routes/teamRoutes");
const memberRoutes = require("./src/routes/memberRoutes");
const eventRegisRoutes = require("./src/routes/eventRegisRoutes");
const fieldRoutes = require("./src/routes/fieldRoutes");
// const matchScheduleRoutes = require("./src/routes/matchScheduleRoutes");
// const TeamMatch = require("./src/models/Team/TeamMatch");


const app = express();
dotenv.config();


// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/season", seasonRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/sport-types", seasonRoutes)
app.use("/api/team", teamRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/event-registrations", eventRegisRoutes);
app.use("/api/fields", fieldRoutes);
// app.use("/api/schedule", matchScheduleRoutes);

module.exports = app;
