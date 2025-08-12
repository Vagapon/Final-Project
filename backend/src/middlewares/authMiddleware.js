const jwt = require("jsonwebtoken");
const User = require("../models/UserModel/User");
const UserRole = require("../models/UserModel/UserRole");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Không có token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

      const userRole = await UserRole.findOne({ user_id: user._id }).populate("role_id");
      const roleName = userRole?.role_id?.name || ""; // e.g. "Admin"
      const roleCode = userRole?.role_id?.code || ""; // e.g. "ADMIN"

      // Normalize allowed roles to array of uppercase strings
      const allowed = Array.isArray(roles) ? roles : [roles];
      const allowedUpper = allowed
        .filter(Boolean)
        .map((r) => r.toString().trim().toUpperCase());

      const userRoleUpperByCode = roleCode.toString().trim().toUpperCase();
      const userRoleUpperByName = roleName.toString().trim().toUpperCase();

      if (
        !allowedUpper.includes(userRoleUpperByCode) &&
        !allowedUpper.includes(userRoleUpperByName)
      ) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  };
};

const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện hành động này" });
  }
  next();
};

module.exports = {
  verifyToken,
  checkRole,
  isAuthenticated
};
