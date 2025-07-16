require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../src/models/UserModel/Role"); // 👈 đường dẫn đúng với bạn

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const roles = [
      { name: "Admin", code: "ADMIN" },
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

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error creating roles:", err.message);
  }
})();
