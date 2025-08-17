const Event = require('../models/Event/Event');
const EventRegistration = require('../models/Event/EventRegistration');
const TeamMember = require('../models/Team/TeamMember');
const TeamMatch = require('../models/Team/TeamMatch');
const Ranking = require('../models/Event/Ranking');
const Match = require('../models/Event/Match');
const mongoose = require('mongoose');
const { create } = require('../models/Blog');

const eventController = {
    create: async (req, res) => {
        try {
            const { name, description, sportTypeId, seasonId ,startDate, endDate, location, numberOfMatch, status, address} = req.body;
            const event = new Event({ name, description, sportTypeId, seasonId ,startDate, endDate, location, numberOfMatch, status, address });
            await event.save();
            res.status(201).json(event);
        } catch (error) {
            res.status(500).json({ message: 'Error creating event', error });
        }
    },

}
module.exports = eventController;
