const jwt = require("jsonwebtoken");
const User = require("../models/UserModel/User");
const UserRole = require("../models/UserModel/UserRole");
const Role = require("../models/UserModel/Role");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Không có token" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ... }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

exports.checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

      const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");
      const roleName = userRole?.role_id?.name;

      if (!roles.includes(roleName)) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };
};
exports.isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện hành động này" });
  }
  next();
};