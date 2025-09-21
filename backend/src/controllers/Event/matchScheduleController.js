const Match = require('../models/Event/Match');
const Event = require('../models/Event/Event');
const Team = require('../models/Team/Team');
const Field = require('../models/Field');
const { generateRoundRobinSchedule, calculateTotalMatches, allocateMatchTimes } = require('../utils/scheduleGenerator');

/**
 * Tạo lịch thi đấu vòng tròn cho một event
 */
const createRoundRobinSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { 
      teamIds, 
      startTime = "14:00", 
      endTime = "18:00", 
      matchDuration = 90, 
      breakTime = 30,
      maxMatchesPerDay = 4 
    } = req.body;

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event không tồn tại' });
    }

    // Kiểm tra số đội có phù hợp không
    if (!teamIds || teamIds.length < 2) {
      return res.status(400).json({ message: 'Cần ít nhất 2 đội để tạo lịch thi đấu' });
    }

    if (teamIds.length > event.maxTeams) {
      return res.status(400).json({ message: `Số đội không được vượt quá ${event.maxTeams}` });
    }

    // Lấy thông tin các đội
    const teams = await Team.find({ _id: { $in: teamIds } });
    if (teams.length !== teamIds.length) {
      return res.status(400).json({ message: 'Một số đội không tồn tại' });
    }

    // Tính số trận đấu cần thiết
    const totalMatches = calculateTotalMatches(teams.length);
    
    // Kiểm tra numberOfMatch trong event
    if (event.numberOfMatch && event.numberOfMatch !== totalMatches) {
      return res.status(400).json({ 
        message: `Số trận đấu không khớp. Event có ${event.numberOfMatch} trận nhưng cần ${totalMatches} trận cho ${teams.length} đội` 
      });
    }

    // Xóa các trận đấu cũ nếu có
    await Match.deleteMany({ eventId });

    // Tạo lịch thi đấu
    const eventInfo = {
      eventId,
      startDate: event.startDate,
      endDate: event.endDate,
      numberOfMatch: totalMatches
    };

    let matches = generateRoundRobinSchedule(teams, eventInfo);
    
    // Phân bổ thời gian thi đấu
    matches = allocateMatchTimes(matches, {
      startTime,
      endTime,
      matchDuration,
      breakTime,
      maxMatchesPerDay
    });

    // Lưu các trận đấu vào database
    const savedMatches = await Match.insertMany(matches);

    // Cập nhật numberOfMatch trong event
    await Event.findByIdAndUpdate(eventId, { 
      numberOfMatch: totalMatches,
      status: 'ongoing'
    });

    res.status(201).json({
      message: 'Tạo lịch thi đấu thành công',
      data: {
        event: event.name,
        totalTeams: teams.length,
        totalMatches: totalMatches,
        totalRounds: Math.ceil(totalMatches / Math.floor(teams.length / 2)),
        matches: savedMatches
      }
    });

  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo lịch thi đấu', error: error.message });
  }
};

/**
 * Lấy lịch thi đấu của một event
 */
const getEventSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, round } = req.query;

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event không tồn tại' });
    }

    // Tạo query filter
    const filter = { eventId };
    if (status) filter.status = status;
    if (round) filter.round = round;

    // Lấy danh sách trận đấu
    const matches = await Match.find(filter)
      .populate('team1Id', 'name shortName avatar')
      .populate('team2Id', 'name shortName avatar')
      .populate('fieldId', 'name address')
      .sort({ matchDate: 1, matchTime: 1 });

    // Nhóm trận đấu theo vòng
    const matchesByRound = {};
    matches.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
    });

    res.status(200).json({
      message: 'Lấy lịch thi đấu thành công',
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status
        },
        totalMatches: matches.length,
        matchesByRound,
        allMatches: matches
      }
    });

  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch thi đấu', error: error.message });
  }
};

/**
 * Cập nhật kết quả trận đấu
 */
const updateMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { score, status } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Trận đấu không tồn tại' });
    }

    // Cập nhật kết quả
    const updateData = {};
    if (score) {
      updateData.score = score;
    }
    if (status) {
      updateData.status = status;
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId, 
      updateData, 
      { new: true }
    ).populate('team1Id', 'name shortName')
     .populate('team2Id', 'name shortName');

    res.status(200).json({
      message: 'Cập nhật kết quả trận đấu thành công',
      data: updatedMatch
    });

  } catch (error) {
    console.error('Error updating match result:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật kết quả', error: error.message });
  }
};

/**
 * Xóa lịch thi đấu của một event
 */
const deleteEventSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event không tồn tại' });
    }

    // Xóa tất cả trận đấu của event
    const result = await Match.deleteMany({ eventId });

    // Cập nhật numberOfMatch về null
    await Event.findByIdAndUpdate(eventId, { 
      numberOfMatch: null,
      status: 'upcoming'
    });

    res.status(200).json({
      message: 'Xóa lịch thi đấu thành công',
      data: {
        deletedMatches: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa lịch thi đấu', error: error.message });
  }
};

/**
 * Tạo trận đấu đơn lẻ (cho UI thủ công)
 */
const createSingleMatch = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { 
      team1Id, 
      team2Id, 
      fieldId, 
      matchDate, 
      matchTime, 
      round, 
      matchNumber,
      duration = 90,
      address,
      location
    } = req.body;

    // Validation đầu vào
    if (!team1Id || !team2Id) {
      return res.status(400).json({ message: 'Cần chọn cả hai đội thi đấu' });
    }

    if (team1Id === team2Id) {
      return res.status(400).json({ message: 'Hai đội thi đấu không được giống nhau' });
    }

    if (!matchDate) {
      return res.status(400).json({ message: 'Cần chọn ngày thi đấu' });
    }

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event không tồn tại' });
    }

    // Kiểm tra các đội có tồn tại không
    const teams = await Team.find({ _id: { $in: [team1Id, team2Id] } });
    if (teams.length !== 2) {
      return res.status(400).json({ message: 'Một hoặc cả hai đội không tồn tại' });
    }

    // Kiểm tra sân có tồn tại không (nếu có)
    if (fieldId) {
      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(400).json({ message: 'Sân thi đấu không tồn tại' });
      }
    }

    // Kiểm tra trùng lặp trận đấu
    const existingMatch = await Match.findOne({
      eventId,
      $or: [
        { team1Id, team2Id },
        { team1Id: team2Id, team2Id: team1Id }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({ message: 'Trận đấu giữa hai đội này đã tồn tại' });
    }

    // Kiểm tra xung đột thời gian nếu có fieldId
    if (fieldId && matchDate && matchTime) {
      const conflictingMatch = await Match.findOne({
        eventId,
        fieldId,
        matchDate: new Date(matchDate),
        matchTime,
        status: { $in: ['upcoming', 'ongoing'] }
      });

      if (conflictingMatch) {
        return res.status(400).json({ 
          message: 'Sân đã được sử dụng vào thời gian này',
          conflictingMatch: {
            id: conflictingMatch._id,
            teams: `${conflictingMatch.team1Id.name} vs ${conflictingMatch.team2Id.name}`
          }
        });
      }
    }

    // Tạo trận đấu mới
    const match = new Match({
      team1Id,
      team2Id,
      fieldId,
      matchDate: new Date(matchDate),
      matchTime,
      round: round || 'Round 1',
      matchNumber: matchNumber || 1,
      duration,
      address,
      location,
      eventId,
      status: 'upcoming'
    });

    const savedMatch = await match.save();
    
    // Populate thông tin để trả về
    await savedMatch.populate([
      { path: 'team1Id', select: 'name shortName avatar' },
      { path: 'team2Id', select: 'name shortName avatar' },
      { path: 'fieldId', select: 'name address' }
    ]);

    res.status(201).json({
      message: 'Tạo trận đấu thành công',
      data: savedMatch
    });

  } catch (error) {
    console.error('Error creating single match:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Lỗi server khi tạo trận đấu', error: error.message });
  }
};

/**
 * Cập nhật trận đấu
 */
const updateSingleMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const updateData = req.body;

    // Kiểm tra trận đấu có tồn tại không
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Trận đấu không tồn tại' });
    }

    // Validation cho việc cập nhật đội
    if (updateData.team1Id && updateData.team2Id) {
      if (updateData.team1Id === updateData.team2Id) {
        return res.status(400).json({ message: 'Hai đội thi đấu không được giống nhau' });
      }

      // Kiểm tra trùng lặp trận đấu với các đội mới
      const existingMatch = await Match.findOne({
        eventId: match.eventId,
        _id: { $ne: matchId },
        $or: [
          { team1Id: updateData.team1Id, team2Id: updateData.team2Id },
          { team1Id: updateData.team2Id, team2Id: updateData.team1Id }
        ]
      });

      if (existingMatch) {
        return res.status(400).json({ message: 'Trận đấu giữa hai đội này đã tồn tại' });
      }

      // Kiểm tra các đội có tồn tại không
      const teams = await Team.find({ _id: { $in: [updateData.team1Id, updateData.team2Id] } });
      if (teams.length !== 2) {
        return res.status(400).json({ message: 'Một hoặc cả hai đội không tồn tại' });
      }
    }

    // Kiểm tra sân có tồn tại không (nếu có)
    if (updateData.fieldId) {
      const field = await Field.findById(updateData.fieldId);
      if (!field) {
        return res.status(400).json({ message: 'Sân thi đấu không tồn tại' });
      }
    }

    // Kiểm tra xung đột thời gian nếu có fieldId và thời gian mới
    if (updateData.fieldId && (updateData.matchDate || updateData.matchTime)) {
      const checkDate = updateData.matchDate ? new Date(updateData.matchDate) : match.matchDate;
      const checkTime = updateData.matchTime || match.matchTime;

      const conflictingMatch = await Match.findOne({
        eventId: match.eventId,
        fieldId: updateData.fieldId,
        matchDate: checkDate,
        matchTime: checkTime,
        status: { $in: ['upcoming', 'ongoing'] },
        _id: { $ne: matchId }
      });

      if (conflictingMatch) {
        return res.status(400).json({ 
          message: 'Sân đã được sử dụng vào thời gian này',
          conflictingMatch: {
            id: conflictingMatch._id,
            teams: `${conflictingMatch.team1Id.name} vs ${conflictingMatch.team2Id.name}`
          }
        });
      }
    }

    // Cập nhật trận đấu
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      updateData,
      { new: true }
    ).populate([
      { path: 'team1Id', select: 'name shortName avatar' },
      { path: 'team2Id', select: 'name shortName avatar' },
      { path: 'fieldId', select: 'name address' }
    ]);

    res.status(200).json({
      message: 'Cập nhật trận đấu thành công',
      data: updatedMatch
    });

  } catch (error) {
    console.error('Error updating match:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Lỗi server khi cập nhật trận đấu', error: error.message });
  }
};

/**
 * Xóa trận đấu đơn lẻ
 */
const deleteSingleMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Kiểm tra trận đấu có tồn tại không
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Trận đấu không tồn tại' });
    }

    // Xóa trận đấu
    await Match.findByIdAndDelete(matchId);

    res.status(200).json({
      message: 'Xóa trận đấu thành công'
    });

  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa trận đấu', error: error.message });
  }
};

/**
 * Lấy danh sách trận đấu của event (cho UI thủ công)
 */
const getEventMatches = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, round, teamId } = req.query;

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event không tồn tại' });
    }

    // Tạo query filter
    const filter = { eventId };
    if (status) filter.status = status;
    if (round) filter.round = round;
    if (teamId) {
      filter.$or = [
        { team1Id: teamId },
        { team2Id: teamId }
      ];
    }

    // Lấy danh sách trận đấu
    const matches = await Match.find(filter)
      .populate('team1Id', 'name shortName avatar')
      .populate('team2Id', 'name shortName avatar')
      .populate('fieldId', 'name address')
      .sort({ matchDate: 1, matchTime: 1 });

    // Nhóm trận đấu theo vòng
    const matchesByRound = {};
    matches.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
    });

    res.status(200).json({
      message: 'Lấy danh sách trận đấu thành công',
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status
        },
        totalMatches: matches.length,
        matchesByRound,
        allMatches: matches
      }
    });

  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách trận đấu', error: error.message });
  }
};

/**
 * Lấy danh sách teams và fields cho UI tạo lịch thi đấu
 */
const getScheduleResources = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event không tồn tại' });
    }

    // Lấy danh sách teams
    const teams = await Team.find({})
      .select('name shortName avatar')
      .sort({ name: 1 });

    // Lấy danh sách fields
    const fields = await Field.find({ available: true })
      .select('name address location pricePerHour')
      .sort({ name: 1 });

    // Lấy danh sách rounds hiện có
    const existingRounds = await Match.distinct('round', { eventId });

    res.status(200).json({
      message: 'Lấy danh sách tài nguyên thành công',
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          maxTeams: event.maxTeams
        },
        teams,
        fields,
        existingRounds
      }
    });

  } catch (error) {
    console.error('Error getting schedule resources:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách tài nguyên', error: error.message });
  }
};

module.exports = {
  // API tự động (giữ lại để dùng sau)
  createRoundRobinSchedule,
  getEventSchedule,
  updateMatchResult,
  deleteEventSchedule,
  
  // API thủ công (mới)
  createSingleMatch,
  updateSingleMatch,
  deleteSingleMatch,
  getEventMatches,
  getScheduleResources
};
