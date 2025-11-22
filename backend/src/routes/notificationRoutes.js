const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả routes đều cần authentication
router.use(verifyToken);

// Lấy notifications của user
router.get('/', getUserNotifications);

// Đếm số notifications chưa đọc
router.get('/unread-count', getUnreadCount);

// Đánh dấu notification là đã đọc
router.put('/:id/read', markAsRead);

// Đánh dấu tất cả notifications là đã đọc
router.put('/mark-all-read', markAllAsRead);

// Xóa notification
router.delete('/:id', deleteNotification);

module.exports = router;

