const EventRegistration = require('../../models/Event/EventRegistration');
const Team = require('../../models/Team/Team');
const Event = require('../../models/Event/Event');
const { createNotification } = require('../notificationController');
const UserRole = require('../../models/UserModel/UserRole');
const Role = require('../../models/UserModel/Role');
const User = require('../../models/UserModel/User');

const eventRegistrationController = {

    registration : async (req, res) => {
        try {
            const { teamId, eventId } = req.body;
            const adminId = req.user.id; // Từ verifyToken -> req.user.id
            if (!teamId || !eventId) {
                return res.status(400).json({ message: 'teamId and eventId are required' });
            }
            // Kiểm tra đội có tồn tại và thuộc về user hiện tại (quản lý) trừ khi ADMIN đăng ký thay mặt
            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            const roleUpper = (req.user.role || '').toString().toUpperCase();
            if (roleUpper !== 'ADMIN' && team.managerId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Only the team manager can register the team for an event' });
            }
            // Kiểm tra sự kiện có tồn tại không
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

            // Tạo notification cho tất cả admin users
            try {
                // Lấy role ADMIN
                const adminRole = await Role.findOne({ code: 'ADMIN' });
                if (adminRole) {
                    // Lấy tất cả admin users
                    const adminUserRoles = await UserRole.find({ role_id: adminRole._id }).populate('user_id');
                    const adminUsers = adminUserRoles.map(ur => ur.user_id);

                    // Tạo notification cho mỗi admin
                    const teamName = team.name || 'Một đội';
                    const eventName = event.name || 'sự kiện';
                    const content = `Đội "${teamName}" đã đăng ký tham gia sự kiện "${eventName}"`;

                    for (const admin of adminUsers) {
                        await createNotification(
                            req.user.id, // senderId (người đăng ký)
                            admin._id,   // receiveId (admin)
                            'event_registration',
                            content,
                            teamId,
                            eventId,     // eventId
                            null         // bookingId
                        );
                    }
                }
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
                // Không fail request nếu notification lỗi
            }

            res.status(201).json({ message: 'Registration successful', registration });
        } catch (error) {
            if (error.code === 11000) { // Lỗi trùng khóa
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

            // Kiểm tra role được thực hiện trong route middleware (checkRole(['ADMIN']))
            const registration = await EventRegistration.findById(registrationId);
            if (!registration) {
                return res.status(404).json({ message: 'Registration not found' });
            }

            // Lưu status cũ để so sánh
            const oldStatus = registration.status;

            // Cập nhật status
            registration.status = status;
            registration.updatedAt = Date.now();
            await registration.save();

            // Tạo notification cho team manager khi status thay đổi (approve hoặc reject)
            if ((status === 'approved' || status === 'rejected') && oldStatus !== status) {
                try {
                    const team = await Team.findById(registration.teamId);
                    const event = await Event.findById(registration.eventId);
                    
                    if (team && team.managerId && event) {
                        const eventName = event.name || 'sự kiện';
                        const teamName = team.name || 'đội của bạn';
                        
                        let content;
                        let notificationType;
                        
                        if (status === 'approved') {
                            content = `Đội "${teamName}" đã được phê duyệt tham gia sự kiện "${eventName}"`;
                            notificationType = 'event_approved';
                        } else if (status === 'rejected') {
                            content = `Đội "${teamName}" đã bị từ chối tham gia sự kiện "${eventName}"`;
                            notificationType = 'other'; // Có thể thêm 'event_rejected' vào enum nếu cần
                        }

                        console.log(`📝 Creating ${status} notification for team manager: ${team.managerId}`);
                        const notification = await createNotification(
                            req.user.id,        // senderId (admin)
                            team.managerId,     // receiveId (quản lý đội)
                            notificationType,
                            content,
                            registration.teamId,
                            registration.eventId,
                            null
                        );
                        console.log(`✅ ${status} notification created: ${notification._id}`);
                    }
                } catch (notifError) {
                    console.error('Error creating status update notification:', notifError);
                    // Không fail request nếu notification lỗi
                }
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
                .sort({ createdAt: -1 }); // Sắp xếp theo mới nhất
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
    // Đăng ký đội của user hiện tại (cho FE để vô hiệu hóa nút / lọc đã tham gia)
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
    // Đối với ADMIN: tất cả đội đã đăng ký trong sự kiện được tạo bởi admin hiện tại
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
    // Xóa một đăng ký (chỉ ADMIN)
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
