const express = require('express');

const seasonController = require('../controllers/Event/seasonController');
const router = express.Router();

router.get('/', seasonController.getSeasons); 
router.post('/', seasonController.createSeason);
router.put('/:seasonId', seasonController.updateSeason);
router.delete('/:seasonId', seasonController.deleteSeason);
router.get('/sport-types', seasonController.getSportTypes);                                                                                                                                                                                                                                                                                                                                                                                                                 

module.exports = router;
