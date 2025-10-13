const express = require('express');
const router = express.Router();
const {
  getTimeSlotsByField,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  createDefaultTimeSlots
} = require('../controllers/timeSlotController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.get('/field/:fieldId', getTimeSlotsByField);
router.post('/', verifyToken, checkRole(['admin', 'staff']), createTimeSlot);
router.put('/:id', verifyToken, checkRole(['admin', 'staff']), updateTimeSlot);
router.delete('/:id', verifyToken, checkRole(['admin', 'staff']), deleteTimeSlot);
router.post('/create-default/:fieldId', verifyToken, checkRole(['admin', 'staff']), createDefaultTimeSlots);

module.exports = router;
