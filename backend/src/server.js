// backend/server.js
require('dotenv').config();
// console.log(process.env.FIREBASE_PRIVATE_KEY ? "✅ Firebase key loaded" : "❌ Missing Firebase key");

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('../app'); // import app từ app.js
const Role = require('./models/UserModel/Role');
const SportType = require('./models/Event/SportType');
dotenv.config();

const PORT = process.env.PORT || 5000;

// Function tự động tạo roles
const initializeRoles = async () => {
  try {
    const roles = [
      { name: "Admin", code: "ADMIN" },
      { name: "Staff", code: "STAFF" },
      { name: "User", code: "USER" },
    ];

    for (const role of roles) {
      const exists = await Role.findOne({ code: role.code });
      if (!exists) {
        await Role.create(role);
        // console.log(`✅ Created role: ${role.code}`);
      } else {
        // console.log(`ℹ️ Role already exists: ${role.code}`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing roles:', error.message);
  }
};

const initializeSportTypes = async () => {
  try {
    const sportTypes = [
      { name: "Football 5 people ", code: "F5", description: "Football with 5 players per team" },
      { name: "Football 7 people", code: "F7", description: "Football with 7 players per team" },
      { name: "Football 11 people", code: "F11", description: "Football with 11 players per team" },
    ];
    for (const sportType of sportTypes) {
      const exists = await SportType.findOne({ code: sportType.code });
      if (!exists) {
        await SportType.create(sportType);
        // console.log(`✅ Created sport type: ${sportType.code}`);
      } else {
        // console.log(`ℹ️ Sport type already exists: ${sportType.code}`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing sport types:', error.message);
  }
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Tự động tạo roles khi khởi động
    await initializeRoles();
    await initializeSportTypes();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to the database', error);
  }
})();
