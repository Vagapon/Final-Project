const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const {eventUpload} = require('../config/cloudinary'); // Import event upload middleware

// Create event
router.post('/', eventUpload.single("avatar") ,eventController.create);
router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);
router.put('/:eventId', eventUpload.single("avatar"), eventController.update);
router.delete('/:evenId', eventController.delete);


router.post('/registrations/:registrationId/approve', eventController.approveRegistration);

module.exports = router;

