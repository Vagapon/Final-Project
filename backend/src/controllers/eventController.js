// controllers/eventController.js
const Event = require("../models/Event/Event");
const EventRegistration = require("../models/Event/EventRegistration");
const Season = require("../models/Event/Season");
const mongoose = require("mongoose");

// Utility: validate dates + season
const validateDates = async (startDate, endDate, seasonId) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid start or end date");
  }
  if (start > end) {
    throw new Error("Start date must be before or equal to end date");
  }

  const season = await Season.findById(seasonId);
  if (!season) throw new Error("Season not found");

  if (start < season.startDate || end > season.endDate) {
    throw new Error("Event dates must be within the selected season date range");
  }

  return { start, end };
};

const eventController = {
  // CREATE
  create: async (req, res) => {
    const { name, description, sportTypeId, seasonId, startDate, endDate, location, status, address, maxTeams } = req.body;
    try {
      const { start, end } = await validateDates(startDate, endDate, seasonId);

      const calculatedMatches = maxTeams ? Math.floor((maxTeams * (maxTeams - 1)) / 2) : 0;

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
        maxTeams: maxTeams ? parseInt(maxTeams) : 0,
        avatar: req.file?.path || ""
      });

      await event.save();
      res.status(201).json(event);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Event name already exists" });
      }
      res.status(400).json({ message: error.message || "Error creating event" });
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

      const event = await Event.findByIdAndUpdate(eventId, updates, { new: true, runValidators: true });
      if (!event) return res.status(404).json({ message: "Event not found" });

      res.status(200).json(event);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Event name already exists" });
      }
      res.status(400).json({ message: error.message || "Error updating event" });
    }
  },

  // GET ALL
  getAll: async (req, res) => {
    try {
      const events = await Event.find();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events", error });
    }
  },

  // GET BY ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event", error });
    }
  },

  // DELETE
  delete: async (req, res) => {
    try {
      const { eventId } = req.params;
      const event = await Event.findByIdAndDelete(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting event", error });
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
