const Notification = require('../models/Notification');
const User = require('../models/UserModel/User');
const mongoose = require('mongoose');

// Tạo notification mới
const createNotification = async (senderId, receiveId, type, content, teamId = null, eventId = null, bookingId = null) => {
  try {
    const notification = new Notification({
      senderId,
      receiveId,
      type,
      content,
      teamId,
      eventId,
      bookingId,
      isRead: false
    });
    await notification.save();

    // Populate để gửi đầy đủ thông tin qua socket
    const populatedNotification = await Notification.findById(notification._id)
      .populate('senderId', 'name email avatar')
      .populate('teamId', 'name avatar')
      .populate('eventId', 'name')
      .populate('bookingId', 'startTime endTime');

    // Emit real-time notification qua Socket.io
    if (global.io) {
      // Convert receiveId to string (có thể là ObjectId hoặc string)
      const receiveIdStr = receiveId.toString ? receiveId.toString() : String(receiveId);
      console.log(`📢 Emitting notification to user: ${receiveIdStr}`);
      
      // Chỉ emit một lần đến room của user (tránh duplicate)
      // User đã join room khi connect với userId
      global.io.to(receiveIdStr).emit('newNotification', populatedNotification.toObject());
      console.log(`✅ Notification emitted to room: ${receiveIdStr}`);
    } else {
      console.warn('⚠️ Socket.io not available, notification not emitted');
    }

    return populatedNotification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Lấy tất cả notifications của user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, isRead } = req.query;

    const filter = { receiveId: userId };
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filter)
      .populate('senderId', 'name email avatar')
      .populate('teamId', 'name avatar')
      .populate('eventId', 'name')
      .populate('bookingId', 'startTime endTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ receiveId: userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Đánh dấu notification là đã đọc
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy notification'
      });
    }

    // Kiểm tra quyền
    if (notification.receiveId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật notification này'
      });
    }

    notification.isRead = true;
    notification.updatedAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Đánh dấu tất cả notifications là đã đọc
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { receiveId: userId, isRead: false },
      { isRead: true, updatedAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả là đã đọc'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Đếm số notifications chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      receiveId: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Xóa notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy notification'
      });
    }

    // Kiểm tra quyền
    if (notification.receiveId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa notification này'
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa notification thành công'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
};

