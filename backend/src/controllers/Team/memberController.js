const TeamMember = require('../../models/Team/TeamMember');
const Team = require('../../models/Team/Team');
const mongoose = require('mongoose');
const axios = require('axios');

const memberController = {
    create : async (req, res) => {
        const { teamId, nameMember, number, isCaptain, avatar } = req.body;
        try {
            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                return res.status(400).json({ success: false, message: "Invalid teamId" });
            }

            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ success: false, message: "Team not found" });
            }

            if (!req.user || team.managerId.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: "Not authorized to add members" });
            }

            const finalAvatar = req.file?.path || avatar || "";

            const isCaptainFinal = typeof isCaptain === 'string' ? isCaptain === 'true' : Boolean(isCaptain);
            const member = new TeamMember({
                teamId,
                nameMember,
                number,
                isCaptain: isCaptainFinal,
                avatar: finalAvatar
            });
            await member.save();
            return res.status(201).json({ success: true, data: member });
        }
        catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: "Member with this name or number already exists in the team" });
            }
            return res.status(400).json({ success: false, message: error.message || "Error creating team member" });
        }
    },
update: async (req, res) => {
  try {
    const { memberId } = req.params;
    const { nameMember, number, isCaptain } = req.body;

    const member = await TeamMember.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // check quyền
    const team = await Team.findById(member.teamId);
    if (team.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (nameMember) member.nameMember = nameMember;
    if (number) member.number = number;
    if (typeof isCaptain !== "undefined") {
      const isCaptainFinal = typeof isCaptain === 'string' ? isCaptain === 'true' : Boolean(isCaptain);
      member.isCaptain = isCaptainFinal;
    }
    if (req.file) member.avatar = req.file.path;

    member.updatedAt = Date.now();
    await member.save();
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

 delete : async (req, res) => {
        const { memberId } = req.params;
        try {
            const member = await TeamMember.findById(memberId);
            if (!member) {
                return res.status(404).json({ message: "Member not found" });
            }
            const team = await Team.findById(member.teamId);
            if (team.managerId.toString() !== req.user.id) {
                return res.status(403).json({ message: "Not authorized to delete members of this team" });
            }
            await member.remove();
            res.status(200).json({ success: true, message: "Member deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message || "Error deleting team member" });
        }
    },
    getById : async (req, res) => {
        const { id } = req.params;
        try {
            const member = await TeamMember.findById(id);
            if (!member) {
                return res.status(404).json({ message: "Member not found" });
            }
            res.status(200).json({ success: true, data: member });
        } catch (error) {
            res.status(500).json({ message: error.message || "Error fetching team member" });
        }
    },
   getByteamId : async (req, res) => {
        const { teamId } = req.params;
        try {
            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                return res.status(400).json({ success: false, message: "Invalid teamId" });
            }
            const members = await TeamMember.find({ teamId });
            res.status(200).json({ success: true, data: members });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message || "Error fetching team members" });
        } 
    },
getAll : async (req, res) => {
        try {
            const members = await TeamMember.find();
            res.status(200).json({ success: true, data: members });
        } catch (error) {
            res.status(500).json({ message: error.message || "Error fetching team members" });
        }
    },
importFromGoogleSheet: async (req, res) => {
  try {
    const { teamId, sheetUrl } = req.body;

    if (!teamId || !sheetUrl) {
      return res.status(400).json({ success: false, message: "teamId and sheetUrl are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ success: false, message: "Invalid teamId format" });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "Google API key not configured" });
    }

    // lấy spreadsheetId từ URL (hỗ trợ nhiều định dạng)
    const idMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) {
      return res.status(400).json({ success: false, message: "Invalid Google Sheet URL" });
    }
    const spreadsheetId = idMatch[1];

    // lấy metadata để tìm tên tab đầu tiên
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
    const metaRes = await axios.get(metaUrl);
    const sheetName = metaRes?.data?.sheets?.[0]?.properties?.title;
    if (!sheetName) {
      return res.status(400).json({ success: false, message: "Cannot determine first sheet name" });
    }

    // đọc dữ liệu cột A, B
    const range = encodeURIComponent(sheetName) + "!A2:B";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

    const response = await axios.get(url);

    if (!response.data.values || response.data.values.length === 0) {
      return res.status(400).json({ success: false, message: "No data found in Google Sheet" });
    }

    const newMembers = response.data.values
      .map((row) => {
        const name = (row?.[0] || '').toString().trim();
        const numberParsed = parseInt(row?.[1], 10);
        if (!name || !Number.isFinite(numberParsed)) return null;
        return {
          teamId,
          nameMember: name,
          number: numberParsed,
          avatar: "",
          isCaptain: false
        };
      })
      .filter(Boolean);

    if (newMembers.length === 0) {
      return res.status(400).json({ success: false, message: "No valid rows (name, number) found" });
    }

    const inserted = await TeamMember.insertMany(newMembers, { ordered: false });
    res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (error) {
    if (error.response) {
      console.error("Google API Error:", error.response.data);
      return res.status(error.response.status).json({ success: false, error: error.response.data });
    }
    if (error?.writeErrors) {
      const skipped = error.writeErrors.length;
      const insertedCount = Math.max(0, (error.result?.result?.nInserted || 0));
      return res.status(201).json({ success: true, count: insertedCount, skipped, message: "Imported with duplicates skipped" });
    }
    console.error("Error importing from Google Sheet:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

};

module.exports = memberController;
    

