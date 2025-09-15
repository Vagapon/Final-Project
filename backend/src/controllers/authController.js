const User = require("../models/UserModel/User");
const UserRole = require("../models/UserModel/UserRole");
const Role = require("../models/UserModel/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebase");
const { staffUpload } = require("../config/cloudinary");

const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID token is required" });
    }

    // Verify token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    // Tìm user theo firebaseUid hoặc email
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (user) {
      // Nếu đã có user nhưng chưa gán firebaseUid thì update
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    } else {
      // Tạo mới user từ Firebase
      user = new User({
        firebaseUid: uid,
        email,
        name: name || email.split("@")[0],
        avatar: picture || "",
        provider: "firebase",
      });
      await user.save();

      // Gán role mặc định
      const defaultRole = await Role.findOne({ name: "User" });
      if (defaultRole) {
        await new UserRole({ user_id: user._id, role_id: defaultRole._id }).save();
      }
    }

    // Lấy role
    const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");

    // Tạo JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: userRole?.role_id?.name || "User",
      },
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    res.status(500).json({ message: "Firebase login failed", error: error.message });
  }
};


const register = async (req, res) => {
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
      phone_number,
    });

    await newUser.save();

    const userRole = await Role.findOne({ name: "User" });
    if (!userRole) {
      return res.status(500).json({ message: "Không tìm thấy vai trò người dùng" });
    }

    await new UserRole({ user_id: newUser._id, role_id: userRole._id }).save();

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

const createStaff = async (req, res) => {
  const { name, email, password, phone_number } = req.body;
  try {
    // console.log("Body:", req.body);
    // console.log("File:", req.file);

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone_number,
      avatar: req.file?.path || "",
      address: req.body.address || "",
    });

    await newUser.save();

    // ⚠️ Kiểm tra field Role thực sự trong DB
    const staffRole = await Role.findOne({ name: "Staff" });
    if (!staffRole) {
      return res.status(500).json({ message: "Staff role not found" });
    }

    await new UserRole({ user_id: newUser._id, role_id: staffRole._id }).save();

    res.status(201).json({
      message: "Staff account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        avatar: newUser.avatar || "",
        address: newUser.address || "",
        created_date: newUser.created_date,
        updated_date: newUser.updated_date,
        role: "Staff",
      },
    });
  } catch (err) {
    console.error("CreateStaff error:", err); // 👉 log chi tiết
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Wrong email or password" });

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
        role: role.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");
    if (!userRole) {
      return res.status(404).json({ message: "Không tìm thấy vai trò người dùng" });
    }

    const roleName = userRole.role_id.name.toUpperCase();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      avatar: user.avatar || "",
      address: user.address || "",
      created_date: user.created_date,
      updated_date: user.updated_date,
      role: roleName,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

module.exports = {
  firebaseLogin,
  register,
  createStaff,
  login,
  getMe,
};
