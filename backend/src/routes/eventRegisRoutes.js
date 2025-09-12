const express = require('express');
const router = express.Router();
const eventRegisController = require('../controllers/Event/eventRegisController');
const { verifyToken, isAuthenticated, checkRole } = require('../middlewares/authMiddleware');

// Create a registration (requires authentication)
router.post('/',verifyToken,isAuthenticated,eventRegisController.registration);

// Get all registrations (admin only)
router.get('/',verifyToken,checkRole(['ADMIN']),eventRegisController.getAllRegistrations);

// Update registration status (admin only)
router.patch('/:registrationId/status',verifyToken,checkRole(['ADMIN']),eventRegisController.updateRegistrationStatus);

// Delete a registration (admin only)
router.delete('/:registrationId',verifyToken,checkRole(['ADMIN']),eventRegisController.deleteRegistration);

// Get registrations by event (admin only)
router.get('/event/:eventId',verifyToken,checkRole(['ADMIN']),eventRegisController.getRegistrationsByEvent);

// Get registrations by team (admin only)
router.get('/team/:teamId',verifyToken,checkRole(['ADMIN']),eventRegisController.getRegistrationsByTeam);

// Get all teams registered for current user's events (ADMIN or STAFF)
router.get('/mine',verifyToken,checkRole(['ADMIN','STAFF']),eventRegisController.getAllTeamsRegisteredForMyEvents);

// Get registrations of current user's team (for FE joined/disable button)
router.get('/team/my',verifyToken,eventRegisController.getMyTeamRegistrations);

module.exports = router;
