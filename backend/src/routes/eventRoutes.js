const express = require('express');
const router = express.Router();

const eventController = require('../controllers/Event/eventController');
const {eventUpload} = require('../config/cloudinary'); // Import event upload middleware
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Create event (admin or staff)
router.post('/', verifyToken, checkRole(['ADMIN','STAFF']), eventUpload.single("avatar") ,eventController.create);
router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);
// Update event (admin or staff). Controller should verify ownership for STAFF
router.put('/:eventId', verifyToken, checkRole(['ADMIN','STAFF']), eventUpload.single("avatar"), eventController.update);
// Delete event (admin only)
router.delete('/:eventId', verifyToken, checkRole(['ADMIN']), eventController.delete);


// Approve registration (admin or staff). Controller verifies ownership for STAFF
router.post('/registrations/:registrationId/approve', verifyToken, checkRole(['ADMIN','STAFF']), eventController.approveRegistration);

module.exports = router;

