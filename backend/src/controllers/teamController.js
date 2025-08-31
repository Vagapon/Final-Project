const Team = require('../models/Team/Team');
const TeamMatch = require('../models/Team/TeamMatch');
const mongoose = require('mongoose');

const teamController = {
  // Tạo team
  createTeam: async (req, res) => {
    try {
      const { name, shortName, description, avatar } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Team name is required" });
      }

      // ✅ Check nếu user đã có team rồi thì chặn luôn
      const existingTeamByManager = await Team.findOne({ managerId: req.user.id });
      if (existingTeamByManager) {
        return res.status(400).json({ message: "User already has a team" });
      }

      // Check trùng tên (không phân biệt hoa thường)
      const existingTeamByName = await Team.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") }
      });
      if (existingTeamByName) {
        return res.status(400).json({ message: "Team name already exists" });
      }

      // Avatar
      const finalAvatar = req.file ? req.file.path : avatar || "";

      // ✅ Tạo team mới
      const newTeam = new Team({
        name,
        shortName,
        description,
        avatar: finalAvatar,
        managerId: req.user.id   // <-- gắn từ token decode
      });

      const savedTeam = await newTeam.save();

      // Populate manager info trả về luôn cho FE
      const populatedTeam = await Team.findById(savedTeam.id).populate(
        "managerId",
        "name email phone"
      );

      res.status(201).json(populatedTeam);
    } catch (error) {
      console.error("Error creating team:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Cập nhật team
  updateTeam: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, shortName, description, avatar } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid team ID' });
      }

      const team = await Team.findById(id);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // ✅ Check quyền: chỉ manager mới được sửa
      if (team.managerId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this team" });
      }

      // Check trùng tên (case-insensitive), excluding current team
      if (name && name.toLowerCase() !== team.name.toLowerCase()) {
        const existingTeam = await Team.findOne({
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          id: { $ne: id }
        });
        if (existingTeam) {
          return res.status(400).json({ message: 'Team name already exists' });
        }
        team.name = name;
      }

      if (shortName) team.shortName = shortName;
      if (description) team.description = description;

      if (req.file) {
        team.avatar = req.file.path;
      } else if (avatar) {
        team.avatar = avatar;
      }

      const updatedTeam = await team.save();
      res.status(200).json(updatedTeam);
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Xóa team
  deleteTeam: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid team ID' });
      }

      const team = await Team.findById(id);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // ✅ Check quyền
      if (team.managerId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this team" });
      }

      // Check nếu team có match
      const associatedMatches = await TeamMatch.findOne({ teamId: id });
      if (associatedMatches) {
        return res.status(400).json({ message: 'Cannot delete team associated with matches' });
      }

      await Team.findByIdAndDelete(id);
      res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
      console.error('Error deleting team:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Lấy tất cả team
  getAllTeams: async (req, res) => {
    try {
      const teams = await Team.find()
        .populate("managerId", "name email phone")
        .sort({ createdAt: -1 });

      res.status(200).json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Lấy theo ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }

      const team = await Team.findById(id).populate("managerId", "name email phone");
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.status(200).json(team);
    } catch (error) {
      console.error("Error fetching team:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  myTeam: async (req, res) => {
  try {
    const team = await Team.findOne({ managerId: req.user.id })
      .populate("managerId", "name email phone_number avatar");

    if (!team) {
      return res.status(404).json({ message: "User has no team yet" });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error("Error fetching my team:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
};

module.exports = teamController;
