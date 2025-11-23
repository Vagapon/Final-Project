const express = require('express');
const router = express.Router();
const {
  getRankingByEvent,
  getAllRankings,
  getRankingWithForm
} = require('../controllers/Event/rankingController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Lấy bảng xếp hạng của một event
router.get('/event/:eventId', getRankingByEvent);

// Lấy tất cả bảng xếp hạng (cho trang quản lý ranking)
router.get('/', verifyToken, getRankingWithForm);

module.exports = router;

