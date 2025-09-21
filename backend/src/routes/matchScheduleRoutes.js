const express = require('express');
const router = express.Router();
const {
  createRoundRobinSchedule,
  getEventSchedule,
  updateMatchResult,
  deleteEventSchedule,
  createSingleMatch,
  updateSingleMatch,
  deleteSingleMatch,
  getEventMatches,
  getScheduleResources
} = require('../../controllers/Event/matchScheduleController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// ===== API TỰ ĐỘNG (giữ lại để dùng sau) =====
// Tạo lịch thi đấu vòng tròn cho event
router.post('/:eventId/schedule', authenticateToken, createRoundRobinSchedule);

// Lấy lịch thi đấu của event
router.get('/:eventId/schedule', getEventSchedule);

// Cập nhật kết quả trận đấu
router.put('/match/:matchId/result', authenticateToken, updateMatchResult);

// Xóa lịch thi đấu của event
router.delete('/:eventId/schedule', authenticateToken, deleteEventSchedule);

// ===== API THỦ CÔNG (cho UI kéo thả) =====
// Lấy danh sách teams, fields và rounds cho UI
router.get('/:eventId/resources', getScheduleResources);

// Tạo trận đấu đơn lẻ
router.post('/:eventId/match', authenticateToken, createSingleMatch);

// Lấy danh sách trận đấu của event
router.get('/:eventId/matches', getEventMatches);

// Cập nhật trận đấu
router.put('/match/:matchId', authenticateToken, updateSingleMatch);

// Xóa trận đấu đơn lẻ
router.delete('/match/:matchId', authenticateToken, deleteSingleMatch);

module.exports = router;
