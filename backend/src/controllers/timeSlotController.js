const TimeSlot = require('../models/TimeSlot');
const Field = require('../models/Field');
const mongoose = require('mongoose');

// Lấy khung giờ theo sân
const getTimeSlotsByField = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { date } = req.query;
    
    // Build filter object
    const filter = { fieldId };
    
    // If date is provided, we can add additional filtering logic here
    // For now, we'll return all time slots for the field
    // In the future, we can filter by availability on specific dates
    
    const timeSlots = await TimeSlot.find(filter).sort({ startTime: 1 });
    res.json({ success: true, data: timeSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo khung giờ
const createTimeSlot = async (req, res) => {
  try {
    const { fieldId, startTime, endTime, timeType, multiplier = 1.0, description } = req.body;
    
    const field = await Field.findById(fieldId);
    if (!field) return res.status(404).json({ success: false, message: 'Không tìm thấy sân' });

    const timeSlot = new TimeSlot({
      fieldId, startTime, endTime, timeType, multiplier, description
    });
    
    await timeSlot.save();
    res.status(201).json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật khung giờ
const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const timeSlot = await TimeSlot.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa khung giờ
const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await TimeSlot.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo khung giờ mặc định
const createDefaultTimeSlots = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const field = await Field.findById(fieldId);
    if (!field) return res.status(404).json({ success: false, message: 'Không tìm thấy sân' });

    const defaultSlots = [
      { startTime: '06:00', endTime: '07:30', timeType: 'ca_sang', multiplier: 1.0, description: 'Ca sáng' },
      { startTime: '08:00', endTime: '09:30', timeType: 'ca_sang', multiplier: 1.0, description: 'Ca sáng' },
      { startTime: '14:00', endTime: '15:30', timeType: 'ca_chieu', multiplier: 1.2, description: 'Ca chiều' },
      { startTime: '16:00', endTime: '17:30', timeType: 'ca_chieu', multiplier: 1.2, description: 'Ca chiều' },
      { startTime: '18:00', endTime: '19:30', timeType: 'ca_toi', multiplier: 1.5, description: 'Ca tối' },
      { startTime: '20:00', endTime: '21:30', timeType: 'ca_toi', multiplier: 1.5, description: 'Ca tối' }
    ];

    const timeSlots = defaultSlots.map(slot => ({ ...slot, fieldId }));
    await TimeSlot.insertMany(timeSlots);
    res.json({ success: true, message: 'Tạo khung giờ mặc định thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTimeSlotsByField,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  createDefaultTimeSlots
};
