require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/UserModel/User");
const Role = require("../src/models/UserModel/Role");
const UserRole = require("../src/models/UserModel/UserRole");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Tạo users mẫu
    const sampleUsers = [
      {
        name: "Nguyễn Văn A",
        email: "user1@gmail.com",
        password: "123456",
        phone_number: "0123456789"
      },
      {
        name: "Trần Thị B",
        email: "user2@gmail.com", 
        password: "123456",
        phone_number: "0123456790"
      },
      {
        name: "Lê Văn C",
        email: "user3@gmail.com",
        password: "123456", 
        phone_number: "0123456791"
      },
      {
        name: "Phạm Thị D",
        email: "user4@gmail.com",
        password: "123456",
        phone_number: "0123456792"
      },
      {
        name: "Hoàng Văn E",
        email: "user5@gmail.com",
        password: "123456",
        phone_number: "0123456793"
      }
    ];

    // Lấy role User
    const userRole = await Role.findOne({ name: "User" });
    if (!userRole) {
      throw new Error("❌ USER role not found");
    }

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          phone_number: userData.phone_number,
          isActive: true
        });

        // Gán role User
        await UserRole.create({ 
          user_id: user._id, 
          role_id: userRole._id 
        });

        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }

    console.log("✅ Sample users creation completed");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error creating sample users:", error.message);
    mongoose.disconnect();
  }
})();
