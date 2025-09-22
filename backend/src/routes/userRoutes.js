const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const { verifyToken, checkRole, isAuthenticated } = require('../middlewares/authMiddleware');
const { userUpload } = require('../config/cloudinary');
// Middleware arrays for different permission levels
const adminAuth = [verifyToken, isAuthenticated, checkRole('ADMIN')];
const userAuth = [verifyToken, isAuthenticated]; // Any authenticated user

// User routes (cần đăng nhập)
router.get('/profile', userAuth, userController.getMyProfile); // User xem profile của mình
router.get('/chat-users', userAuth, userController.getChatUsers); // User lấy danh sách users để chat

router.put('/profile', userAuth, userUpload.single("avatar"), userController.updateMyProfile); // User cập nhật profile

// Admin routes (chỉ admin mới truy cập được)
router.get('/', adminAuth, userController.getAllUsers); // Admin xem tất cả user
router.get('/:userId', adminAuth, userController.getUserById); // Admin xem chi tiết user
router.put('/:userId', adminAuth, userController.updateUser); // Admin cập nhật user
router.delete('/:userId', adminAuth, userController.deleteUser); // Admin xóa user

module.exports = router;