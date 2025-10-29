const Booking = require('../models/Booking');
const Field = require('../models/Field');
const TimeSlot = require('../models/TimeSlot');
const User = require('../models/UserModel/User');
const mongoose = require('mongoose');

// Get all bookings with filters
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
    
    // Filter by date range
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
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get booking by ID
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
      .populate('fieldId', 'name fieldNumber purpose capacity price location address features images')
      .populate('teamId', 'name');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy booking' 
      });
    }

    res.status(200).json({
      success: true,
      data: booking
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

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { fieldId, timeSlotId, date, notes, teamId, duration, totalPrice } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!fieldId || !timeSlotId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }

    // Validate ObjectId format
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

    // Get field details
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy sân' 
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

    // Check if time slot belongs to field
    if (timeSlot.fieldId.toString() !== fieldId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Khung giờ không thuộc sân này' 
      });
    }

    // Create start and end time
    const startTime = new Date(`${date}T${timeSlot.startTime}`);
    const endTime = new Date(`${date}T${timeSlot.endTime}`);

    // Check for conflicts
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

    // Calculate duration (chỉ để lưu, không dùng tính giá)
    const calculatedDuration = (endTime - startTime) / (1000 * 60 * 60); // hours
    const finalDuration = duration || calculatedDuration;
    
    // Get multiplier from time slot
    const timeSlotMultiplier = timeSlot.multiplier || 
      (timeSlot.timeType === 'ca_sang' ? 1.0 :
       timeSlot.timeType === 'ca_chieu' ? 1.2 :
       timeSlot.timeType === 'ca_toi' ? 1.5 : 1.0);
    
    // GIÁ CỐ ĐỊNH THEO CA: giá sân × hệ số ca (KHÔNG nhân duration)
    const finalTotalPrice = totalPrice || (field.pricePerHour * timeSlotMultiplier);

    // Create booking
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

    // Populate and return
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

// Update booking
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

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền cập nhật booking này' 
      });
    }

    // Don't allow updating confirmed bookings
    if (booking.status === 'confirmed' && updateData.status) {
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

// Cancel booking
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

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền hủy booking này' 
      });
    }

    // Don't allow cancelling completed bookings
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

// Delete booking
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

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền xóa booking này' 
      });
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

// Check availability
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

    // Check for conflicts
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
