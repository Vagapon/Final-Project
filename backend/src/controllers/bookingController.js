const Booking = require('../models/Booking');
const Field = require('../models/Field');
const TimeSlot = require('../models/TimeSlot');
const User = require('../models/UserModel/User');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');
const UserRole = require('../models/UserModel/UserRole');
const Role = require('../models/UserModel/Role');

// Hàm helper để kiểm tra user có phải admin hoặc staff không
const isAdminOrStaff = async (userId) => {
  try {
    const userRole = await UserRole.findOne({ user_id: userId }).populate('role_id');
    if (!userRole || !userRole.role_id) return false;
    
    const roleCode = userRole.role_id.code?.toUpperCase();
    return roleCode === 'ADMIN' || roleCode === 'STAFF';
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Hàm helper để kiểm tra user có phải ADMIN không
const isAdmin = async (userId) => {
  try {
    const userRole = await UserRole.findOne({ user_id: userId }).populate('role_id');
    if (!userRole || !userRole.role_id) return false;
    
    const roleCode = userRole.role_id.code?.toUpperCase();
    return roleCode === 'ADMIN';
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
};

// Hàm helper để kiểm tra người tạo có phải ADMIN không
const isCreatorAdmin = async (creatorId) => {
  if (!creatorId) return false;
  return await isAdmin(creatorId);
};

// Hàm helper để kiểm tra staff có thể chỉnh sửa/xóa không (staff chỉ có thể chỉnh sửa dữ liệu của mình, không phải dữ liệu của admin)
const canStaffEdit = async (currentUserId, creatorId) => {
  const currentUserIsAdmin = await isAdmin(currentUserId);
  if (currentUserIsAdmin) return true; // Admin có thể chỉnh sửa tất cả
  
  const currentUserIsStaff = await isAdminOrStaff(currentUserId);
  if (!currentUserIsStaff) return false; // Không phải admin hoặc staff
  
  if (!creatorId) return true; // Nếu không có người tạo, cho phép chỉnh sửa (để tương thích ngược)
  
  const creatorIsAdmin = await isCreatorAdmin(creatorId);
  if (creatorIsAdmin) return false; // Staff không thể chỉnh sửa dữ liệu của admin
  
  // Staff có thể chỉnh sửa dữ liệu của chính họ
  return creatorId?.toString() === currentUserId?.toString();
};

// Lấy tất cả bookings với bộ lọc
const getAllBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      fieldId, 
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Tạo filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (fieldId) filter.fieldId = fieldId;
    if (userId) filter.userId = userId;
    
    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Tạo sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy bookings với populate
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone_number')
      .populate({
        path: 'fieldId',
        select: 'name fieldNumber purpose capacity price location managedBy',
        populate: {
          path: 'managedBy',
          select: 'name email'
        }
      })
      .populate('timeSlotId', 'startTime endTime timeType multiplier')
      .populate('teamId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số bookings
    const total = await Booking.countDocuments(filter);

    // Populate managedBy role để kiểm tra quyền
    const bookingsWithRole = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();
      if (bookingObj.fieldId && bookingObj.fieldId.managedBy) {
        const managedByRole = await UserRole.findOne({ user_id: bookingObj.fieldId.managedBy }).populate('role_id');
        const roleCode = managedByRole?.role_id?.code || null;
        bookingObj.fieldId.managedByRole = roleCode;
      }
      return bookingObj;
    }));

    res.status(200).json({
      success: true,
      data: bookingsWithRole,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy booking theo ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID không hợp lệ' 
      });
    }

    const booking = await Booking.findById(id)
      .populate('userId', 'name email phone_number')
      .populate({
        path: 'fieldId',
        select: 'name fieldNumber purpose capacity price location address features images managedBy',
        populate: {
          path: 'managedBy',
          select: 'name email'
        }
      })
      .populate('timeSlotId', 'startTime endTime timeType multiplier')
      .populate('teamId', 'name');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy booking' 
      });
    }

    // Populate managedBy role để kiểm tra quyền
    let bookingWithRole = booking.toObject();
    if (bookingWithRole.fieldId && bookingWithRole.fieldId.managedBy) {
      const managedByRole = await UserRole.findOne({ user_id: bookingWithRole.fieldId.managedBy }).populate('role_id');
      const roleCode = managedByRole?.role_id?.code || null;
      bookingWithRole.fieldId.managedByRole = roleCode;
    }

    res.status(200).json({
      success: true,
      data: bookingWithRole || booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Tạo booking mới
const createBooking = async (req, res) => {
  try {
    const { fieldId, timeSlotId, date, notes, teamId, duration, totalPrice } = req.body;
    const userId = req.user.id;

    // Kiểm tra các trường bắt buộc
    if (!fieldId || !timeSlotId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }

    // Kiểm tra định dạng ObjectId
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    
    if (!isValidObjectId(fieldId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID sân không hợp lệ' 
      });
    }

    if (!isValidObjectId(timeSlotId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID khung giờ không hợp lệ' 
      });
    }

    // Lấy thông tin sân
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy sân' 
      });
    }

    // Lấy thông tin khung giờ
    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy khung giờ' 
      });
    }

    // Kiểm tra khung giờ có thuộc sân không
    if (timeSlot.fieldId.toString() !== fieldId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Khung giờ không thuộc sân này' 
      });
    }

    // Tạo thời gian bắt đầu và kết thúc
    const startTime = new Date(`${date}T${timeSlot.startTime}`);
    const endTime = new Date(`${date}T${timeSlot.endTime}`);
    const now = new Date();

    if (startTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Không thể đặt sân cho thời gian trong quá khứ'
      });
    }

    // Kiểm tra xung đột
    const existingBooking = await Booking.findOne({
      fieldId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ 
        success: false, 
        message: 'Khung giờ này đã được đặt' 
      });
    }

    // Tính thời lượng (chỉ để lưu, không dùng tính giá)
    const calculatedDuration = (endTime - startTime) / (1000 * 60 * 60); // giờ
    const finalDuration = duration || calculatedDuration;
    
    // Lấy hệ số từ khung giờ
    const timeSlotMultiplier = timeSlot.multiplier || 
      (timeSlot.timeType === 'ca_sang' ? 1.0 :
       timeSlot.timeType === 'ca_chieu' ? 1.2 :
       timeSlot.timeType === 'ca_toi' ? 1.5 : 1.0);
    
    // GIÁ CỐ ĐỊNH THEO CA: giá sân × hệ số ca (KHÔNG nhân duration)
    const finalTotalPrice = totalPrice || (field.pricePerHour * timeSlotMultiplier);

    // Tạo booking
    const booking = new Booking({
      userId,
      fieldId,
      timeSlotId,
      startTime,
      endTime,
      duration: finalDuration,
      totalPrice: finalTotalPrice,
      notes,
      teamId: teamId || null,
      status: 'pending'
    });

    await booking.save();

    // Tạo notification cho tất cả admin users
    try {
        // Lấy role ADMIN
        const adminRole = await Role.findOne({ code: 'ADMIN' });
        if (adminRole) {
            // Lấy tất cả admin users
            const adminUserRoles = await UserRole.find({ role_id: adminRole._id }).populate('user_id');
            const adminUsers = adminUserRoles.map(ur => ur.user_id);

            // Tạo notification cho mỗi admin
            const fieldName = field.name || 'sân bóng';
            const teamName = booking.teamId ? (await mongoose.model('Team').findById(booking.teamId))?.name : null;
            const userName = (await User.findById(userId))?.name || 'Người dùng';
            
            let content;
            if (teamName) {
                content = `Đội "${teamName}" đã đặt sân "${fieldName}"`;
            } else {
                content = `${userName} đã đặt sân "${fieldName}"`;
            }

            for (const admin of adminUsers) {
                await createNotification(
                    userId,      // senderId (người đặt sân)
                    admin._id,   // receiveId (admin)
                    'booking',
                    content,
                    booking.teamId || null,
                    null,        // eventId
                    booking._id  // bookingId
                );
            }
        }
    } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Không fail request nếu notification lỗi
    }

    // Populate và trả về
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone_number')
      .populate('fieldId', 'name fieldNumber purpose capacity price location')
      .populate('teamId', 'name');

    res.status(201).json({
      success: true,
      message: 'Đặt sân thành công',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Cập nhật booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID không hợp lệ' 
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy booking' 
      });
    }

    // Kiểm tra user có sở hữu booking hoặc là admin/staff không
    const hasPermission = booking.userId.toString() === userId || await isAdminOrStaff(userId);
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền cập nhật booking này' 
      });
    }

    // Đối với staff: Kiểm tra họ có thể chỉnh sửa booking này không
    // Staff chỉ có thể chỉnh sửa booking mà họ tạo (nếu booking được tạo bởi staff qua admin panel)
    // Lưu ý: Booking không có trường createdBy, nên chúng ta kiểm tra user hiện tại có phải staff không
    // và booking có được tạo bởi admin không (chúng ta cần kiểm tra managedBy của sân)
    const currentUserIsAdmin = await isAdmin(userId);
    if (!currentUserIsAdmin) {
      // Nếu là staff, kiểm tra sân có được tạo bởi admin không
      const field = await Field.findById(booking.fieldId);
      if (field && field.managedBy) {
        const canEdit = await canStaffEdit(userId, field.managedBy);
        if (!canEdit) {
          return res.status(403).json({ 
            success: false, 
            message: 'Bạn không có quyền cập nhật booking này. Chỉ có thể xem.' 
          });
        }
      }
    }

    // Kiểm tra user có phải admin/staff không để cho phép cập nhật booking đã xác nhận
    const isAdminOrStaffUser = await isAdminOrStaff(userId);
    
    // Không cho phép cập nhật booking đã xác nhận (trừ admin/staff)
    if (booking.status === 'confirmed' && updateData.status && !isAdminOrStaffUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể cập nhật booking đã xác nhận' 
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true }
    ).populate('userId', 'name email phone_number')
     .populate('fieldId', 'name fieldNumber purpose capacity price location')
     .populate('teamId', 'name');

    res.status(200).json({
      success: true,
      message: 'Cập nhật booking thành công',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Hủy booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID không hợp lệ' 
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy booking' 
      });
    }

    // Kiểm tra user có sở hữu booking hoặc là admin/staff không
    const hasPermission = booking.userId.toString() === userId || await isAdminOrStaff(userId);
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền hủy booking này' 
      });
    }

    // Đối với staff: Kiểm tra họ có thể hủy booking này không
    const currentUserIsAdmin = await isAdmin(userId);
    if (!currentUserIsAdmin) {
      const field = await Field.findById(booking.fieldId);
      if (field && field.managedBy) {
        const canCancel = await canStaffEdit(userId, field.managedBy);
        if (!canCancel) {
          return res.status(403).json({ 
            success: false, 
            message: 'Bạn không có quyền hủy booking này. Chỉ có thể xem.' 
          });
        }
      }
    }

    // Không cho phép hủy booking đã hoàn thành
    if (booking.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể hủy booking đã hoàn thành' 
      });
    }

    booking.status = 'cancelled';
    booking.updatedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Hủy booking thành công',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Xóa booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID không hợp lệ' 
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy booking' 
      });
    }

    // Kiểm tra user có sở hữu booking hoặc là admin/staff không
    const hasPermission = booking.userId.toString() === userId || await isAdminOrStaff(userId);
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền xóa booking này' 
      });
    }

    // Đối với staff: Kiểm tra họ có thể xóa booking này không
    const currentUserIsAdmin = await isAdmin(userId);
    if (!currentUserIsAdmin) {
      const field = await Field.findById(booking.fieldId);
      if (field && field.managedBy) {
        const canDelete = await canStaffEdit(userId, field.managedBy);
        if (!canDelete) {
          return res.status(403).json({ 
            success: false, 
            message: 'Bạn không có quyền xóa booking này. Chỉ có thể xem.' 
          });
        }
      }
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa booking thành công'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Kiểm tra tính khả dụng
const checkAvailability = async (req, res) => {
  try {
    const { fieldId, date, timeSlotId } = req.body;

    if (!fieldId || !date || !timeSlotId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }

    // Get time slot details
    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy khung giờ' 
      });
    }

    // Create start and end time
    const startTime = new Date(`${date}T${timeSlot.startTime}`);
    const endTime = new Date(`${date}T${timeSlot.endTime}`);
    const now = new Date();

    if (startTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Không thể kiểm tra/đặt sân cho thời gian trong quá khứ'
      });
    }

    // Kiểm tra xung đột
    const existingBooking = await Booking.findOne({
      fieldId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $in: ['pending', 'confirmed'] }
    });

    const isAvailable = !existingBooking;

    res.status(200).json({
      success: true,
      data: {
        isAvailable,
        timeSlot: {
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime
        }
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Tạo filter object
    const filter = { userId };
    if (status) filter.status = status;

    // Tạo sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy bookings với populate
    const bookings = await Booking.find(filter)
      .populate('fieldId', 'name fieldNumber purpose capacity price location')
      .populate('teamId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số bookings
    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  checkAvailability,
  getUserBookings
};
