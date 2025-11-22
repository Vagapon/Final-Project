const express = require('express');
const router = express.Router();

const eventController = require('../controllers/Event/eventController');
const {
  createRoundRobinSchedule,
  getEventSchedule,
  updateMatchResult,
  deleteEventSchedule,
  createSingleMatch,
  updateSingleMatch,
  deleteSingleMatch,
  getEventMatches,
  getScheduleResources,
  manualUpdateMatchStatus
} = require('../controllers/Event/matchScheduleController');
const {eventUpload} = require('../config/cloudinary'); // Import event upload middleware
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Create event (admin or staff)
router.post('/', verifyToken, checkRole(['ADMIN','STAFF']), eventUpload.single('avatar'), eventController.create);
router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);
// Update event (admin or staff). Controller should verify ownership for STAFF
router.put('/:eventId', verifyToken, checkRole(['ADMIN','STAFF']), eventUpload.single('avatar'), eventController.update);
// Delete event (admin only)
router.delete('/:eventId', verifyToken, checkRole(['ADMIN']), eventController.delete);


// Approve registration (admin or staff). Controller verifies ownership for STAFF
router.post('/registrations/:registrationId/approve', verifyToken, checkRole(['ADMIN','STAFF']), eventController.approveRegistration);

// ===== MATCH SCHEDULE ROUTES =====
// Lấy danh sách teams, fields và rounds cho UI
router.get('/:eventId/schedule/resources', getScheduleResources);

// Lấy danh sách trận đấu của event
router.get('/:eventId/matches', getEventMatches);

// Lấy lịch thi đấu của event (API tự động)
router.get('/:eventId/schedule', getEventSchedule);

// Tạo lịch thi đấu vòng tròn cho event (API tự động)
router.post('/:eventId/schedule', verifyToken, createRoundRobinSchedule);

// Tạo trận đấu đơn lẻ (cho UI thủ công)
router.post('/:eventId/match', verifyToken, createSingleMatch);

// Cập nhật trận đấu
router.put('/match/:matchId', verifyToken, updateSingleMatch);

// Cập nhật kết quả trận đấu
router.put('/match/:matchId/result', verifyToken, updateMatchResult);

// Xóa trận đấu đơn lẻ
router.delete('/match/:matchId', verifyToken, deleteSingleMatch);

// Xóa lịch thi đấu của event
router.delete('/:eventId/schedule', verifyToken, deleteEventSchedule);

// Tự động cập nhật trạng thái tất cả trận đấu (có thể gọi từ cron job)
router.post('/matches/auto-update-status', verifyToken, checkRole(['ADMIN']), manualUpdateMatchStatus);

module.exports = router;

