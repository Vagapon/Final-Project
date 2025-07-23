const User = require("../models/UserModel/User");
const UserRole = require("../models/UserModel/UserRole");
const Role = require("../models/UserModel/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, phone_number } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone_number
    });

    await newUser.save();
    const userRole = await Role.findOne({ name: "User" });
    if (!userRole) {
      return res.status(500).json({ message: "Không tìm thấy vai trò người dùng" });
      newUser.roles.push(userRole._id);
      await newUser.save();
    }
   await new UserRole({
      user_id: newUser._id, role_id: userRole._id
    }).save();
    res.status(201).json({
      message: "Đăng ký thành công"});
  }
    catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");
    const role = await Role.findById(userRole.role_id);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone_number,
        role: role.name // Lấy tên vai trò
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    // Lấy role từ UserRole
    const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");

    if (!userRole) {
      return res.status(404).json({ message: "Không tìm thấy vai trò người dùng" });
    }

    const roleName = userRole.role_id.name.toUpperCase(); // ví dụ: "ADMIN"

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      avatar: user.avatar || "",
      created_date: user.created_date,
      updated_date: user.updated_date,
      role: roleName, // ✅ thêm role ở đây
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

