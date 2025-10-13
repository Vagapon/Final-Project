const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  checkAvailability,
  getUserBookings
} = require('../controllers/bookingController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Public routes
router.post('/check-availability', checkAvailability); // Check availability (no auth needed)

// Protected routes (require authentication)
router.get('/user', verifyToken, getUserBookings); // Get current user's bookings
router.post('/', verifyToken, createBooking); // Create new booking
router.get('/:id', verifyToken, getBookingById); // Get booking by ID
router.put('/:id', verifyToken, updateBooking); // Update booking
router.patch('/:id/cancel', verifyToken, cancelBooking); // Cancel booking
router.delete('/:id', verifyToken, deleteBooking); // Delete booking

// Admin routes
router.get('/', verifyToken, checkRole(['admin', 'staff']), getAllBookings); // Get all bookings (admin only)

module.exports = router;
