// controllers/eventController.js
const Event = require("../../models/Event/Event");
const EventRegistration = require("../../models/Event/EventRegistration");
const Season = require("../../models/Event/Season");
const Team = require("../../models/Team/Team");
const { createNotification } = require("../notificationController");
const mongoose = require("mongoose");

// Utility: validate dates + season
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


    // Convert season dates to Date objects for comparison
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
  // CREATE
  create: async (req, res) => {
    
    const { name, description, sportTypeId, seasonId, startDate, endDate, location, status, address, maxTeams } = req.body;
    
    // Validate required fields
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
      
      // Return specific error message
      res.status(400).json({ 
        success: false,
        message: error.message || "Có lỗi xảy ra khi tạo sự kiện",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // UPDATE
  update: async (req, res) => {
    try {
      const { eventId } = req.params;
      const updates = { ...req.body };

      // Validate ngày nếu có update
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

      // STAFF can only update their own events
      if (req.user && req.user.role && req.user.role.toUpperCase() === 'STAFF') {
        const existing = await Event.findById(eventId);
        if (!existing) return res.status(404).json({ message: "Event not found" });
        if (existing.createdBy?.toString() !== req.user.id) {
          return res.status(403).json({ message: "Not authorized to update this event" });
        }
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

  // GET ALL
getAll : async (req, res) => {
  try {
    // Add lean() để convert mongoose document sang plain object
    const events = await Event.find()
      .populate({
        path: 'sportTypeId',
        select: 'name' 
      })
      .lean()
      .exec();

    // Calculate approved teams count for each event
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const approvedCount = await EventRegistration.countDocuments({
          eventId: event._id,
          status: "approved"
        });
        return {
          ...event,
          participants: approvedCount
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


  // GET BY ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      
      // Calculate approved teams count
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

  // DELETE
  delete: async (req, res) => {
    try {
      const { eventId } = req.params;
      const event = await Event.findByIdAndDelete(eventId);
      if (!event) return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
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

  // APPROVE REGISTRATION
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

        // STAFF can only approve registrations for their own events
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
        // Không tạo notification ở đây để tránh duplicate

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
