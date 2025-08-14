const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); 
const authMiddleware = require("../middlewares/authMiddleware"); 
const {
  firebaseLogin,
  register,
  login,
  createStaff,
  getMe,
  // checkGoogleOAuthStatus
} = require("../controllers/authController");
const { verifyToken, checkRole, isAuthenticated } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/firebase-login", firebaseLogin);
// router.get("/google-status", checkGoogleOAuthStatus); // Route kiểm tra trạng thái Google OAuth
router.post("/create-staff", verifyToken, isAuthenticated, checkRole(["Admin"]), createStaff);
router.get("/admin", verifyToken, isAuthenticated,checkRole(["Admin"]),  (req, res) => {
  res.json({ message: "Welcome Admin" });
  });               
router.get("/staff", verifyToken, isAuthenticated, checkRole(["Admin", "Staff"]), (req, res) => {
  res.json({ message: "Welcome Staff" });
});
router.get("/me", verifyToken, getMe);
module.exports = router;
