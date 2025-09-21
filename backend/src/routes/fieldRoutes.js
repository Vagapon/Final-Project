const express = require('express');
const router = express.Router();
const {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  updateFieldStatus,
  getFieldsByPurpose,
  getFieldStats
} = require('../controllers/fieldController');

// Import middleware
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  validateCreateField,
  validateUpdateField,
  validateFieldStatus,
  validateObjectId,
  validateFieldQuery
} = require('../middlewares/fieldValidation');
const { fieldUpload } = require('../config/cloudinary');

// Public routes
router.get('/', validateFieldQuery, getAllFields); // Lấy danh sách tất cả sân
router.get('/purpose/:purpose', getFieldsByPurpose); // Lấy sân theo mục đích
router.get('/stats', verifyToken, getFieldStats); // Thống kê sân (cần auth)
router.get('/:id', validateObjectId, getFieldById); // Lấy chi tiết một sân

// Protected routes (cần authentication)
router.post('/', verifyToken, fieldUpload.array('images', 5), validateCreateField, createField); // Tạo sân mới
router.put('/:id', verifyToken, fieldUpload.array('images', 5), validateObjectId, validateUpdateField, updateField); // Cập nhật sân
router.patch('/:id/status', verifyToken, validateObjectId, validateFieldStatus, updateFieldStatus); // Cập nhật trạng thái sân
router.delete('/:id', verifyToken, validateObjectId, deleteField); // Xóa sân

module.exports = router;
