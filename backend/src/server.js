// backend/server.js
require('dotenv').config();
// console.log(process.env.FIREBASE_PRIVATE_KEY ? "✅ Firebase key loaded" : "❌ Missing Firebase key");

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('../app'); // import app từ app.js
const Role = require('./models/UserModel/Role');

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
        console.log(`✅ Created role: ${role.code}`);
      } else {
        console.log(`ℹ️ Role already exists: ${role.code}`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing roles:', error.message);
  }
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Tự động tạo roles khi khởi động
    await initializeRoles();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to the database', error);
  }
})();
