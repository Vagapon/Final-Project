const Season = require('../../models/Event/Season');
const SportType = require('../../models/Event/SportType');
const mongoose = require('mongoose');

// Utility: escape regex special chars for safe exact, case-insensitive match
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


const seasonController = {
       createSeason: async (req, res) => { 
        try {
            const { name, status, startDate, endDate, backgroundImage } = req.body;
           
            // Chỉ validate status nếu có
            if (status && !['active', 'inactive', 'completed'].includes(status)) {
                return res.status(400).json({ message: "Status must be 'active', 'inactive', or 'completed'" });
            }

            // Validate required fields
            if (!name || !startDate || !endDate) {
                return res.status(400).json({ message: "Name, start date, and end date are required" });
            }

            // Parse dates and validate order
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                return res.status(400).json({ message: 'Invalid start or end date' });
            }
            if (start > end) {
                return res.status(400).json({ message: 'Start date must be before or equal to end date' });
            }

            // Check duplicate season name (case-insensitive)
            const existingByName = await Season.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') }
            });
            if (existingByName) {
                return res.status(400).json({ message: 'Season name already exists' });
            }

            // Prevent overlapping date ranges with any existing season
            const overlappingSeason = await Season.findOne({
                startDate: { $lte: end },
                endDate: { $gte: start }
            });
            if (overlappingSeason) {
                return res.status(400).json({
                    message: `Date range overlaps with season: ${overlappingSeason.name}`
                });
            }
            let finalBackgroundImage = '';
            if (req.file) {
                finalBackgroundImage = req.file.path;
            } else if (backgroundImage) {
                finalBackgroundImage = backgroundImage;
            }

            const newSeason = new Season({
                name,
                backgroundImage: finalBackgroundImage,
                status: status || 'active',
                startDate: start,
                endDate: end
            });
            
            await newSeason.save();
            res.status(201).json({
                success: true,
                data: newSeason,
                message: "Season created successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating season",
                error: error.message
            });
        }
    },
    getSeasons: async (req, res) => {
        try {
            const seasons = await Season.find().sort({ createdAt: -1 });
            res.status(200).json({
                success: true,
                data: seasons,
                message: "Seasons retrieved successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error retrieving seasons",
                error: error.message
            });
        }
    },
  updateSeason: async (req, res) => {
        try {
            const { seasonId } = req.params;
            const { name, status, startDate, endDate, backgroundImage } = req.body;
            const updateData = {};

            const existing = await Season.findById(seasonId);
            if (!existing) {
                return res.status(404).json({ 
                    success: false,
                    message: "Season not found" 
                });
            }

            // Xử lý các field thông thường
            if (name !== undefined) updateData.name = name;
            if (status !== undefined) updateData.status = status;
            if (startDate !== undefined) updateData.startDate = new Date(startDate);
            if (endDate !== undefined) updateData.endDate = new Date(endDate);

            // Determine final values for validation
            const finalName = name !== undefined ? name : existing.name;
            const finalStart = startDate !== undefined ? new Date(startDate) : existing.startDate;
            const finalEnd = endDate !== undefined ? new Date(endDate) : existing.endDate;

            if (Number.isNaN(finalStart.getTime()) || Number.isNaN(finalEnd.getTime())) {
                return res.status(400).json({ message: 'Invalid start or end date' });
            }
            if (finalStart > finalEnd) {
                return res.status(400).json({ message: 'Start date must be before or equal to end date' });
            }

            // Duplicate name check (case-insensitive) excluding current season
            const duplicateByName = await Season.findOne({
                _id: { $ne: seasonId },
                name: { $regex: new RegExp(`^${escapeRegex(finalName)}$`, 'i') }
            });
            if (duplicateByName) {
                return res.status(400).json({ message: 'Season name already exists' });
            }

            // Overlap check excluding current season
            const overlappingSeason = await Season.findOne({
                _id: { $ne: seasonId },
                startDate: { $lte: finalEnd },
                endDate: { $gte: finalStart }
            });
            if (overlappingSeason) {
                return res.status(400).json({
                    message: `Date range overlaps with season: ${overlappingSeason.name}`
                });
            }

            // Xử lý backgroundImage: ưu tiên file upload, sau đó đến URL từ body
            if (req.file) {
                // Nếu có file upload mới
                updateData.backgroundImage = req.file.path;
            } else if (backgroundImage !== undefined) {
                // Nếu không có file nhưng có URL trong body (bao gồm cả string rỗng để clear image)
                updateData.backgroundImage = backgroundImage;
            }

            const updatedSeason = await Season.findByIdAndUpdate(
                seasonId,
                { $set: updateData },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedSeason,
                message: "Season updated successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating season",
                error: error.message
            });
        }
    },
    deleteSeason: async (req, res) => {
        try {
            const { seasonId } = req.params;
            const deletedSeason = await Season.findByIdAndDelete(seasonId);
            if (!deletedSeason) {
                return res.status(404).json({ message: "Season not found" });
            }
            res.status(200).json({
                success: true,
                message: "Season deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting season",
                error: error.message
            });
        }
    },
    getSportTypes: async (req, res) => {
        try {
            const sportTypes = await SportType.find().sort({ createdAt: -1 });
            res.status(200).json({
                success: true,
                data: sportTypes,
                message: "Sport types retrieved successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error retrieving sport types",
                error: error.message
            });
        }
    }
};
module.exports = seasonController;