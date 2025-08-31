const express = require('express');

const teamController = require('../controllers/teamController');
const {teamUpload} = require('../config/cloudinary'); 
const { verifyToken, isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/' ,teamController.getAllTeams);
router.get('/myteam', verifyToken, teamController.myTeam);
router.post('/', verifyToken, isAuthenticated, teamUpload.single("avatar"), teamController.createTeam);
router.put('/:teamId', teamUpload.single("avatar") ,teamController.updateTeam);
router.delete('/:teamId', teamController.deleteTeam);
router.get('/:id', teamController.getById);

module.exports = router;                                 