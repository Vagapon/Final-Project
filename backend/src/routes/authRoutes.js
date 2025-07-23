const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // thêm dòng này
const authMiddleware = require("../middlewares/authMiddleware"); // thêm dòng này
const { register, login } = require("../controllers/authController");
const { verifyToken, checkRole, isAuthenticated } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/admin", verifyToken, isAuthenticated,checkRole(["Admin"]),  (req, res) => {
  res.json({ message: "Welcome Admin" });
  });               
router.get("/me", verifyToken, authController.getMe);
module.exports = router;
