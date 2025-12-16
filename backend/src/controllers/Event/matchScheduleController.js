const Match = require('../../models/Event/Match');
const Event = require('../../models/Event/Event');
const EventRegistration = require('../../models/Event/EventRegistration');
const Team = require('../../models/Team/Team');
const Field = require('../../models/Field');
const Ranking = require('../../models/Event/Ranking');
const Season = require('../../models/Event/Season');
const { generateRoundRobinSchedule, calculateTotalMatches, allocateMatchTimes } = require('../../utils/scheduleGenerator');
const { createNotification } = require('../notificationController');

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

    // Kiểm tra các đội đã được approve cho event này chưa
    const approvedRegistrations = await EventRegistration.find({
      eventId: eventId,
      teamId: { $in: teamIds },
      status: 'approved'
    });
    
    const approvedTeamIds = approvedRegistrations.map(reg => reg.teamId.toString());
    const unapprovedTeams = teamIds.filter(teamId => !approvedTeamIds.includes(teamId.toString()));
    
    if (unapprovedTeams.length > 0) {
      const unapprovedTeamNames = await Team.find({ _id: { $in: unapprovedTeams } }).select('name');
      return res.status(400).json({ 
        message: 'Một số đội chưa được approve cho event này',
        unapprovedTeams: unapprovedTeamNames.map(t => t.name)
      });
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

    // Tạo notification cho các team managers khi lịch thi đấu được tạo
    try {
      const eventName = event.name || 'sự kiện';
      const uniqueTeamIds = [...new Set(teams.map(t => t._id.toString()))];
      
      // Lấy thông tin teams với managerId
      const teamsWithManagers = await Team.find({ 
        _id: { $in: uniqueTeamIds } 
      }).select('_id name managerId');

      // Gửi notification cho mỗi team manager
      for (const team of teamsWithManagers) {
        if (team.managerId) {
          const teamName = team.name || 'đội của bạn';
          const content = `Lịch thi đấu cho sự kiện "${eventName}" đã được sắp xếp. Đội "${teamName}" có ${savedMatches.filter(m => 
            m.team1Id.toString() === team._id.toString() || 
            m.team2Id.toString() === team._id.toString()
          ).length} trận đấu.`;

          await createNotification(
            req.user.id,        // senderId (admin)
            team.managerId,     // receiveId (team manager)
            'match_scheduled',
            content,
            team._id,
            eventId,
            null
          );
        }
      }
    } catch (notifError) {
      console.error('Error creating match schedule notifications:', notifError);
      // Không fail request nếu notification lỗi
    }

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
 * Cập nhật kết quả trận đấu và tự động cập nhật ranking
 */
const updateMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { score, status } = req.body;

    const match = await Match.findById(matchId).populate('eventId');
    if (!match) {
      return res.status(404).json({ message: 'Trận đấu không tồn tại' });
    }

    // Lưu điểm cũ để tính toán lại ranking nếu cần
    const oldScore = match.score;

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
     .populate('team2Id', 'name shortName')
     .populate('eventId');

    // Nếu có điểm và trận đấu đã kết thúc, cập nhật ranking
    if (score && updatedMatch.status === 'completed' && updatedMatch.eventId) {
      try {
        await updateRankingFromMatch(updatedMatch, oldScore);
      } catch (rankingError) {
        console.error('Error updating ranking:', rankingError);
        // Không fail request nếu ranking update lỗi
      }
    }

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
 * Hàm helper để cập nhật ranking dựa trên kết quả trận đấu
 */
const updateRankingFromMatch = async (match, oldScore = null) => {
  if (!match.score || !match.eventId || !match.team1Id || !match.team2Id) {
    return;
  }

  const { team1: score1, team2: score2 } = match.score;
  const team1Id = match.team1Id._id || match.team1Id;
  const team2Id = match.team2Id._id || match.team2Id;
  const eventId = match.eventId._id || match.eventId;

  // Lấy season từ event
  const event = await Event.findById(eventId);
  if (!event || !event.seasonId) {
    console.log('Event không có seasonId, bỏ qua cập nhật ranking');
    return;
  }

  const seasonId = event.seasonId;

  // Nếu có điểm cũ, trừ đi điểm cũ trước
  if (oldScore && oldScore.team1 !== undefined && oldScore.team2 !== undefined) {
    await revertRankingFromOldScore(team1Id, team2Id, eventId, seasonId, oldScore);
  }

  // Tính toán kết quả
  let team1Result = 'draw'; // draw
  let team2Result = 'draw';

  if (score1 > score2) {
    team1Result = 'win';
    team2Result = 'loss';
  } else if (score1 < score2) {
    team1Result = 'loss';
    team2Result = 'win';
  }

  // Cập nhật ranking cho team 1
  await updateTeamRanking(team1Id, eventId, seasonId, {
    result: team1Result,
    goalsFor: score1,
    goalsAgainst: score2
  });

  // Cập nhật ranking cho team 2
  await updateTeamRanking(team2Id, eventId, seasonId, {
    result: team2Result,
    goalsFor: score2,
    goalsAgainst: score1
  });
};

/**
 * Hàm helper để revert ranking từ điểm cũ
 */
const revertRankingFromOldScore = async (team1Id, team2Id, eventId, seasonId, oldScore) => {
  const { team1: oldScore1, team2: oldScore2 } = oldScore;

  let oldTeam1Result = 'draw';
  let oldTeam2Result = 'draw';

  if (oldScore1 > oldScore2) {
    oldTeam1Result = 'win';
    oldTeam2Result = 'loss';
  } else if (oldScore1 < oldScore2) {
    oldTeam1Result = 'loss';
    oldTeam2Result = 'win';
  }

  // Revert team 1
  await updateTeamRanking(team1Id, eventId, seasonId, {
    result: oldTeam1Result,
    goalsFor: oldScore1,
    goalsAgainst: oldScore2,
    revert: true
  });

  // Revert team 2
  await updateTeamRanking(team2Id, eventId, seasonId, {
    result: oldTeam2Result,
    goalsFor: oldScore2,
    goalsAgainst: oldScore1,
    revert: true
  });
};

/**
 * Hàm helper để cập nhật ranking cho một team
 */
const updateTeamRanking = async (teamId, eventId, seasonId, { result, goalsFor, goalsAgainst, revert = false }) => {
  // Tìm hoặc tạo ranking record
  let ranking = await Ranking.findOne({ teamId, eventId, seasonId });

  if (!ranking) {
    ranking = new Ranking({
      teamId,
      eventId,
      seasonId,
      win: 0,
      loss: 0,
      draw: 0,
      gf: 0,
      ga: 0,
      point: 0
    });
  }

  // Cập nhật số liệu
  const multiplier = revert ? -1 : 1;

  if (result === 'win') {
    ranking.win = Math.max(0, ranking.win + (1 * multiplier));
    ranking.point = Math.max(0, ranking.point + (3 * multiplier));
  } else if (result === 'loss') {
    ranking.loss = Math.max(0, ranking.loss + (1 * multiplier));
    // Loss không cộng điểm
  } else if (result === 'draw') {
    ranking.draw = Math.max(0, ranking.draw + (1 * multiplier));
    ranking.point = Math.max(0, ranking.point + (1 * multiplier));
  }

  // Cập nhật số bàn thắng/thua
  ranking.gf = Math.max(0, ranking.gf + (goalsFor * multiplier));
  ranking.ga = Math.max(0, ranking.ga + (goalsAgainst * multiplier));
  ranking.gd = ranking.gf - ranking.ga;
  ranking.updatedAt = Date.now();

  await ranking.save();
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

    // Kiểm tra các đội đã được approve cho event này chưa
    const approvedRegistrations = await EventRegistration.find({
      eventId: eventId,
      teamId: { $in: [team1Id, team2Id] },
      status: 'approved'
    });
    
    const approvedTeamIds = approvedRegistrations.map(reg => reg.teamId.toString());
    const unapprovedTeams = [team1Id, team2Id].filter(teamId => !approvedTeamIds.includes(teamId.toString()));
    
    if (unapprovedTeams.length > 0) {
      const unapprovedTeamNames = await Team.find({ _id: { $in: unapprovedTeams } }).select('name');
      return res.status(400).json({ 
        message: 'Một hoặc cả hai đội chưa được approve cho event này',
        unapprovedTeams: unapprovedTeamNames.map(t => t.name)
      });
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

    // Tạo notification cho các team managers khi trận đấu được tạo
    try {
      const event = await Event.findById(eventId);
      const eventName = event?.name || 'sự kiện';
      const team1 = await Team.findById(team1Id).select('name managerId');
      const team2 = await Team.findById(team2Id).select('name managerId');
      
      const matchDateStr = matchDate ? new Date(matchDate).toLocaleDateString('vi-VN') : '';
      const matchTimeStr = matchTime || '';
      
      // Notification cho team 1
      if (team1 && team1.managerId) {
        const content = `Trận đấu của đội "${team1.name}" vs "${team2?.name || 'đối thủ'}" trong sự kiện "${eventName}" đã được sắp xếp${matchDateStr ? ` vào ${matchDateStr}` : ''}${matchTimeStr ? ` lúc ${matchTimeStr}` : ''}.`;
        
        await createNotification(
          req.user.id,        // senderId (admin)
          team1.managerId,    // receiveId (team 1 manager)
          'match_scheduled',
          content,
          team1Id,
          eventId,
          savedMatch._id
        );
      }

      // Notification cho team 2
      if (team2 && team2.managerId) {
        const content = `Trận đấu của đội "${team2.name}" vs "${team1?.name || 'đối thủ'}" trong sự kiện "${eventName}" đã được sắp xếp${matchDateStr ? ` vào ${matchDateStr}` : ''}${matchTimeStr ? ` lúc ${matchTimeStr}` : ''}.`;
        
        await createNotification(
          req.user.id,        // senderId (admin)
          team2.managerId,    // receiveId (team 2 manager)
          'match_scheduled',
          content,
          team2Id,
          eventId,
          savedMatch._id
        );
      }
    } catch (notifError) {
      console.error('Error creating match notification:', notifError);
      // Không fail request nếu notification lỗi
    }

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
    const match = await Match.findById(matchId).populate('eventId');
    if (!match) {
      return res.status(404).json({ message: 'Trận đấu không tồn tại' });
    }

    // Lưu điểm cũ nếu có cập nhật điểm
    const oldScore = match.score;

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
      { path: 'fieldId', select: 'name address' },
      { path: 'eventId' }
    ]);

    // Nếu có cập nhật điểm và trận đấu đã kết thúc, cập nhật ranking
    if (updateData.score && updatedMatch.status === 'completed' && updatedMatch.eventId) {
      try {
        await updateRankingFromMatch(updatedMatch, oldScore);
      } catch (rankingError) {
        console.error('Error updating ranking:', rankingError);
        // Không fail request nếu ranking update lỗi
      }
    }

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
 * Lấy tất cả trận đấu (cho trang quản lý trận đấu - không lọc theo event)
 */
const getAllMatches = async (req, res) => {
  try {
    const { status, round, teamId, eventId } = req.query;

    // Tạo query filter
    const filter = {};
    if (status) filter.status = status;
    if (round) filter.round = round;
    if (eventId) filter.eventId = eventId;
    if (teamId) {
      filter.$or = [
        { team1Id: teamId },
        { team2Id: teamId }
      ];
    }

    // Lấy danh sách trận đấu với populate event
    const matches = await Match.find(filter)
      .populate('team1Id', 'name shortName avatar')
      .populate('team2Id', 'name shortName avatar')
      .populate('fieldId', 'name address')
      .populate('eventId', 'name startDate endDate status createdBy')
      .sort({ matchDate: 1, matchTime: 1 });

    res.status(200).json({
      message: 'Lấy danh sách trận đấu thành công',
      data: {
        totalMatches: matches.length,
        allMatches: matches
      }
    });

  } catch (error) {
    console.error('Error getting all matches:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách trận đấu', error: error.message });
  }
};

/**
 * Lấy các trận đấu đã hoàn thành (public - không cần quyền admin)
 */
const getCompletedMatches = async (req, res) => {
  try {
    const { limit = 10, eventId } = req.query;

    // Tạo query filter - chỉ lấy các trận đấu đã hoàn thành có điểm
    const filter = {
      status: 'completed',
      score: { $exists: true, $ne: null }
    };
    
    if (eventId) filter.eventId = eventId;

    // Lấy danh sách trận đấu với populate
    const matches = await Match.find(filter)
      .populate('team1Id', 'name shortName avatar')
      .populate('team2Id', 'name shortName avatar')
      .populate('fieldId', 'name address')
      .populate('eventId', 'name startDate endDate status')
      .sort({ matchDate: -1, matchTime: -1 }) // Mới nhất trước
      .limit(parseInt(limit));

    res.status(200).json({
      message: 'Lấy danh sách trận đấu đã hoàn thành thành công',
      data: {
        totalMatches: matches.length,
        allMatches: matches
      }
    });

  } catch (error) {
    console.error('Error getting completed matches:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách trận đấu', error: error.message });
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

    // Lấy danh sách teams đã đăng ký và được approve cho event này
    const approvedRegistrations = await EventRegistration.find({
      eventId: eventId,
      status: 'approved'
    })
      .populate('teamId', 'name shortName avatar')
      .select('teamId');

    // Lấy danh sách team IDs đã được approve
    const approvedTeamIds = approvedRegistrations
      .map(reg => reg.teamId)
      .filter(team => team !== null);

    // Lấy thông tin đầy đủ của các teams đã được approve
    const teams = await Team.find({ _id: { $in: approvedTeamIds.map(t => t._id || t) } })
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

/**
 * Tự động cập nhật trạng thái các trận đấu dựa trên thời gian
 * Hàm này sẽ được gọi định kỳ để cập nhật trạng thái từ:
 * - upcoming → ongoing (khi đến giờ bắt đầu)
 * - ongoing → completed (khi hết thời gian thi đấu)
 */
const autoUpdateMatchStatus = async () => {
  try {
    const now = new Date();
    
    // Lấy tất cả các trận đấu chưa kết thúc và chưa bị hủy
    const matches = await Match.find({
      status: { $in: ['upcoming', 'ongoing'] }
    }).populate('team1Id team2Id fieldId');

    let updatedCount = 0;

    for (const match of matches) {
      if (!match.matchDate) continue;

      // Tạo thời gian bắt đầu trận đấu
      const matchDate = new Date(match.matchDate);
      let matchStartTime = new Date(matchDate);
      
      // Nếu có matchTime, kết hợp với matchDate
      if (match.matchTime) {
        const [hours, minutes] = match.matchTime.split(':').map(Number);
        matchStartTime.setHours(hours || 0, minutes || 0, 0, 0);
      }

      // Tính thời gian kết thúc = thời gian bắt đầu + duration
      const duration = match.duration || 90; // Mặc định 90 phút
      const matchEndTime = new Date(matchStartTime.getTime() + duration * 60 * 1000);

      let newStatus = null;

      // Kiểm tra và cập nhật trạng thái
      if (match.status === 'upcoming' && now >= matchStartTime && now < matchEndTime) {
        // Chuyển từ "sắp diễn ra" sang "đang diễn ra"
        newStatus = 'ongoing';
      } else if (match.status === 'ongoing' && now >= matchEndTime) {
        // Chuyển từ "đang diễn ra" sang "đã kết thúc"
        newStatus = 'completed';
      }

      // Cập nhật trạng thái nếu có thay đổi
      if (newStatus) {
        await Match.findByIdAndUpdate(match._id, { 
          status: newStatus,
          updatedAt: Date.now()
        });
        updatedCount++;
        console.log(`Đã cập nhật trận đấu ${match._id} từ ${match.status} sang ${newStatus}`);
      }
    }

    if (updatedCount > 0) {
      console.log(`Đã tự động cập nhật ${updatedCount} trận đấu`);
    }

    return {
      success: true,
      updatedCount,
      message: `Đã cập nhật ${updatedCount} trận đấu`
    };
  } catch (error) {
    console.error('Lỗi khi tự động cập nhật trạng thái trận đấu:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * API endpoint để gọi thủ công hàm tự động cập nhật
 * Có thể được gọi từ cron job hoặc scheduler
 */
const manualUpdateMatchStatus = async (req, res) => {
  try {
    const result = await autoUpdateMatchStatus();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        updatedCount: result.updatedCount
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái',
      error: error.message
    });
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
  getAllMatches,
  getCompletedMatches,
  getScheduleResources,
  
  // Tự động cập nhật trạng thái
  autoUpdateMatchStatus,
  manualUpdateMatchStatus
};
