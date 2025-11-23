// controllers/eventController.js
const Event = require("../../models/Event/Event");
const EventRegistration = require("../../models/Event/EventRegistration");
const Season = require("../../models/Event/Season");
const Team = require("../../models/Team/Team");
const { createNotification } = require("../notificationController");
const UserRole = require("../../models/UserModel/UserRole");
const mongoose = require("mongoose");

// Tiện ích: kiểm tra ngày tháng + mùa giải
const validateDates = async (startDate, endDate, seasonId) => {
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ");
    }
    if (start > end) {
      throw new Error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
    }

    const season = await Season.findById(seasonId).maxTimeMS(5000); // 5 second timeout
    if (!season) {
      throw new Error("Không tìm thấy mùa giải");
    }


    // Chuyển đổi ngày mùa giải sang đối tượng Date để so sánh
    const seasonStart = new Date(season.startDate);
    const seasonEnd = new Date(season.endDate);
    
    
    if (start < seasonStart || end > seasonEnd) {
      throw new Error("Ngày sự kiện phải nằm trong khoảng thời gian của mùa giải");
    }

    return { start, end };
  } catch (error) {
    console.error('Error in validateDates:', error);
    throw error;
  }
};

const eventController = {
  // TẠO MỚI
  create: async (req, res) => {
    
    const { name, description, sportTypeId, seasonId, startDate, endDate, location, status, address, maxTeams } = req.body;
    
    // Kiểm tra các trường bắt buộc
    if (!name) {
      return res.status(400).json({ message: "Event name is required" });
    }
    if (!sportTypeId) {
      return res.status(400).json({ message: "Sport type is required" });
    }
    if (!seasonId) {
      return res.status(400).json({ message: "Season is required" });
    }
    if (!startDate) {
      return res.status(400).json({ message: "Start date is required" });
    }
    if (!endDate) {
      return res.status(400).json({ message: "End date is required" });
    }
    if (maxTeams && (isNaN(parseInt(maxTeams)) || parseInt(maxTeams) < 1)) {
      return res.status(400).json({ message: "Max teams must be a positive number" });
    }
    try {
      const { start, end } = await validateDates(startDate, endDate, seasonId);

      const maxTeamsInt = maxTeams ? parseInt(maxTeams) : 0;
      const calculatedMatches = maxTeamsInt > 0 ? Math.floor((maxTeamsInt * (maxTeamsInt - 1)) / 2) : 0;

      const event = new Event({
        name,
        description,
        sportTypeId,
        seasonId,
        startDate: start,
        endDate: end,
        location,
        numberOfMatch: calculatedMatches,
        status,
        address,
        maxTeams: maxTeamsInt,
        avatar: req.file?.path || "",
        createdBy: req.user?.id || null
      });

      await event.save();
      
      res.status(201).json({
        success: true,
        data: event,
        message: "Event created successfully"
      });
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false,
          message: "Tên sự kiện đã tồn tại. Vui lòng chọn tên khác." 
        });
      }
      
      // Trả về thông báo lỗi cụ thể
      res.status(400).json({ 
        success: false,
        message: error.message || "Có lỗi xảy ra khi tạo sự kiện",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // CẬP NHẬT
  update: async (req, res) => {
    try {
      const { eventId } = req.params;
      const updates = { ...req.body };

      // Kiểm tra ngày nếu có cập nhật
      if (updates.startDate || updates.endDate || updates.seasonId) {
        const { start, end } = await validateDates(
          updates.startDate || undefined,
          updates.endDate || undefined,
          updates.seasonId || undefined
        );
        updates.startDate = start;
        updates.endDate = end;
      }

      if (req.file) updates.avatar = req.file.path;

      if (updates.maxTeams !== undefined) {
        updates.numberOfMatch = Math.floor((updates.maxTeams * (updates.maxTeams - 1)) / 2);
      }

      // Kiểm tra quyền: Staff không thể cập nhật sự kiện được tạo bởi Admin
      const existing = await Event.findById(eventId);
      if (!existing) return res.status(404).json({ message: "Event not found" });
      
      const UserRole = require('../../models/UserModel/UserRole');
      const isAdmin = async (userId) => {
        try {
          const userRole = await UserRole.findOne({ user_id: userId }).populate('role_id');
          if (!userRole || !userRole.role_id) return false;
          const roleCode = userRole.role_id.code?.toUpperCase();
          return roleCode === 'ADMIN';
        } catch (error) {
          return false;
        }
      };
      
      const canStaffEdit = async (currentUserId, creatorId) => {
        const currentUserIsAdmin = await isAdmin(currentUserId);
        if (currentUserIsAdmin) return true;
        
        if (!creatorId) return true;
        const creatorIsAdmin = await isAdmin(creatorId);
        if (creatorIsAdmin) return false;
        return creatorId?.toString() === currentUserId?.toString();
      };
      
      const canEdit = await canStaffEdit(req.user.id, existing.createdBy);
      if (!canEdit) {
        return res.status(403).json({ 
          success: false,
          message: "Bạn không có quyền chỉnh sửa sự kiện này. Chỉ có thể xem." 
        });
      }

      const event = await Event.findByIdAndUpdate(eventId, updates, { new: true, runValidators: true });
      if (!event) return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });

      res.status(200).json({
        success: true,
        data: event,
        message: "Event updated successfully"
      });
    } catch (error) {
      console.error('Error updating event:', error);
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false,
          message: "Tên sự kiện đã tồn tại. Vui lòng chọn tên khác." 
        });
      }
      res.status(400).json({ 
        success: false,
        message: error.message || "Có lỗi xảy ra khi cập nhật sự kiện" 
      });
    }
  },

  // LẤY TẤT CẢ
getAll : async (req, res) => {
  try {
    // Thêm lean() để chuyển đổi mongoose document sang plain object
    const events = await Event.find()
      .populate({
        path: 'sportTypeId',
        select: 'name' 
      })
      .lean()
      .exec();

    // Tính số đội đã được phê duyệt và populate createdBy role cho mỗi sự kiện
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const approvedCount = await EventRegistration.countDocuments({
          eventId: event._id,
          status: "approved"
        });
        
        // Populate createdBy role để kiểm tra quyền
        let createdByRole = null;
        if (event.createdBy) {
          const creatorRole = await UserRole.findOne({ user_id: event.createdBy }).populate('role_id');
          createdByRole = creatorRole?.role_id?.code || null;
        }
        
        return {
          ...event,
          participants: approvedCount,
          createdByRole: createdByRole
        };
      })
    );

    res.status(200).json({
      success: true,
      data: eventsWithParticipants
    });
  } catch (error) {
    console.error('Error in getAll:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
},


  // LẤY THEO ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      
      // Tính số đội đã được phê duyệt
      const approvedCount = await EventRegistration.countDocuments({
        eventId: event._id,
        status: "approved"
      });
      
      const eventWithParticipants = {
        ...event.toObject(),
        participants: approvedCount
      };
      
      res.status(200).json(eventWithParticipants);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event", error });
    }
  },

  // XÓA
  delete: async (req, res) => {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
      
      // Kiểm tra quyền: Staff không thể xóa sự kiện được tạo bởi Admin
      const UserRole = require('../../models/UserModel/UserRole');
      const isAdmin = async (userId) => {
        try {
          const userRole = await UserRole.findOne({ user_id: userId }).populate('role_id');
          if (!userRole || !userRole.role_id) return false;
          const roleCode = userRole.role_id.code?.toUpperCase();
          return roleCode === 'ADMIN';
        } catch (error) {
          return false;
        }
      };
      
      const canStaffEdit = async (currentUserId, creatorId) => {
        const currentUserIsAdmin = await isAdmin(currentUserId);
        if (currentUserIsAdmin) return true;
        
        if (!creatorId) return true;
        const creatorIsAdmin = await isAdmin(creatorId);
        if (creatorIsAdmin) return false;
        return creatorId?.toString() === currentUserId?.toString();
      };
      
      const canDelete = await canStaffEdit(req.user.id, event.createdBy);
      if (!canDelete) {
        return res.status(403).json({ 
          success: false,
          message: "Bạn không có quyền xóa sự kiện này. Chỉ có thể xem." 
        });
      }
      
      await Event.findByIdAndDelete(eventId);
      res.status(200).json({ 
        success: true,
        message: "Event deleted successfully" 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Error deleting event", 
        error: error.message 
      });
    }
  },

  // PHÊ DUYỆT ĐĂNG KÝ
  approveRegistration: async (req, res) => {
    try {
      const { registrationId } = req.params;
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const registration = await EventRegistration.findById(registrationId).session(session);
        if (!registration) {
          await session.abortTransaction();
          return res.status(404).json({ message: "Registration not found" });
        }

        if (registration.status === "approved") {
          await session.abortTransaction();
          return res.status(400).json({ message: "Registration already approved" });
        }

        const event = await Event.findById(registration.eventId).session(session);
        if (!event) {
          await session.abortTransaction();
          return res.status(404).json({ message: "Event not found" });
        }

        // STAFF chỉ có thể phê duyệt đăng ký cho sự kiện của chính họ
        if (req.user && req.user.role && req.user.role.toUpperCase() === 'STAFF') {
          if (event.createdBy?.toString() !== req.user.id) {
            await session.abortTransaction();
            return res.status(403).json({ message: "Not authorized to approve for this event" });
          }
        }

        if (typeof event.maxTeams === "number" && event.maxTeams >= 0) {
          const approvedCount = await EventRegistration.countDocuments({
            eventId: event._id,
            status: "approved"
          }).session(session);

          if (approvedCount >= event.maxTeams) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Event is full" });
          }
        }

        registration.status = "approved";
        await registration.save({ session });

        // Notification sẽ được tạo trong updateRegistrationStatus nếu route đó được gọi
        // Không tạo notification ở đây để tránh trùng lặp

        await session.commitTransaction();
        res.status(200).json({ message: "Registration approved", registration });
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (error) {
      res.status(500).json({ message: "Error approving registration", error: error.message });
    }
  }
};

module.exports = eventController;
