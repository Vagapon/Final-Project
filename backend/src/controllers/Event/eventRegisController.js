const EventRegistration = require('../../models/Event/EventRegistration');
const Team = require('../../models/Team/Team');
const Event = require('../../models/Event/Event');

const eventRegistrationController = {

    registration : async (req, res) => {
        try {
            const { teamId, eventId } = req.body;
            const adminId = req.user.id; // From verifyToken -> req.user.id
            if (!teamId || !eventId) {
                return res.status(400).json({ message: 'teamId and eventId are required' });
            }
            // Check if team exists and belongs to current user (manager) unless ADMIN registers on behalf
            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            const roleUpper = (req.user.role || '').toString().toUpperCase();
            if (roleUpper !== 'ADMIN' && team.managerId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Only the team manager can register the team for an event' });
            }
            // Check if team exists
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            if (event.status === 'completed') {
                return res.status(400).json({ message: 'Event has been completed' });
            }

            const registration = new EventRegistration({
                teamId,
                eventId,
                adminId,
                status: 'pending'
            });
            await registration.save();
            res.status(201).json({ message: 'Registration successful', registration });
        } catch (error) {
            if (error.code === 11000) { // Duplicate key error
                return res.status(400).json({ message: 'This team has already registered for this event' });
            }
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getAllRegistrations: async (req, res) => {
        try {
            const registrations = await EventRegistration.find()
                .populate({ path: 'teamId', select: 'name avatar managerId', populate: { path: 'managerId', select: 'name email avatar' } })
                .populate('eventId', 'name startDate status location')
                .populate('adminId', 'name email')
                .sort({ createdAt: -1 });
            res.status(200).json(registrations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }   
    },
    updateRegistrationStatus: async (req, res) => {
        try {
            const { registrationId } = req.params;
            const { status } = req.body;

            // Role check is done in route middleware (checkRole(['ADMIN']))
            const registration = await EventRegistration.findByIdAndUpdate(
                registrationId,
                { status,
                    updatedAt: Date.now()
                 } ,
            );
            if (!registration) {
                return res.status(404).json({ message: 'Registration not found' });
            }
            res.status(200).json({ message: 'Registration status updated', registration });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getRegistrationsByEvent: async (req, res) => {
        try {
            const { eventId } = req.params;
            const registrations = await EventRegistration.find({ eventId })
                .populate({ path: 'teamId', select: 'name avatar managerId', populate: { path: 'managerId', select: 'name email avatar' } })
                .populate('adminId', 'name email')
                .sort({ createdAt: -1 }); // Sort by most recent
            res.status(200).json(registrations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getRegistrationsByTeam: async (req, res) => {
        try {
            const { teamId } = req.params;
            const registrations = await EventRegistration.find({ teamId })
                .populate('eventId', 'name startDate status location')
                .populate('adminId', 'name email')
                .sort({ createdAt: -1 });
            res.status(200).json(registrations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    // Current user's team registrations (for FE to disable button / filter joined)
    getMyTeamRegistrations: async (req, res) => {
        try {
            const team = await Team.findOne({ managerId: req.user.id }).select('_id');
            console.log('req.user.id:', req.user.id);
console.log('team.managerId:', team?.managerId);
            if (!team) return res.status(200).json([]);
            const registrations = await EventRegistration.find({ teamId: team._id })
                .populate('eventId', 'name startDate status location')
                .sort({ createdAt: -1 });
            res.status(200).json(registrations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    // For ADMIN: all teams registered in events created by current admin
    getAllTeamsRegisteredForMyEvents: async (req, res) => {
        try {
            const adminId = req.user.id;
            const myEvents = await Event.find({ createdBy: adminId }).select('_id name');
            const eventIds = myEvents.map(e => e._id);
            if (eventIds.length === 0) return res.status(200).json([]);
            const registrations = await EventRegistration.find({ eventId: { $in: eventIds } })
                .populate({ path: 'teamId', select: 'name avatar managerId', populate: { path: 'managerId', select: 'name email avatar' } })
                .populate('eventId', 'name startDate status location')
                .populate('adminId', 'name email')
                .sort({ createdAt: -1 });
            res.status(200).json(registrations);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    // Delete a registration (ADMIN only)
    deleteRegistration: async (req, res) => {
        try {
            const { registrationId } = req.params;
            const deleted = await EventRegistration.findByIdAndDelete(registrationId);
            if (!deleted) {
                return res.status(404).json({ message: 'Registration not found' });
            }
            return res.status(200).json({ message: 'Registration deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = eventRegistrationController;
