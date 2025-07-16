require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/UserModel/User");
const Role = require("../src/models/UserModel/Role");
const UserRole = require("../src/models/UserModel/UserRole");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@gmail.com";
    const password = "admin1505"; // bạn có thể đổi
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: "Admin",
        email,
        password: hashedPassword,
        phone_number: "0123456789",
      });
      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️ Admin user already exists");
    }

    const adminRole = await Role.findOne({ code: "ADMIN" });
    if (!adminRole) {
      throw new Error("❌ ADMIN role not found");
    }

    const hasRole = await UserRole.findOne({ user_id: user._id, role_id: adminRole._id });
    if (!hasRole) {
      await UserRole.create({ user_id: user._id, role_id: adminRole._id });
      console.log("✅ ADMIN role assigned to user");
    } else {
      console.log("ℹ️ User already has ADMIN role");
    }

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  }
})();
