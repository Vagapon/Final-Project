const Ranking = require('../../models/Event/Ranking');
const Event = require('../../models/Event/Event');
const Season = require('../../models/Event/Season');
const Team = require('../../models/Team/Team');
const Match = require('../../models/Event/Match');

/**
 * Lấy bảng xếp hạng theo event và season
 */
const getRankingByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { seasonId } = req.query;

    // Kiểm tra event có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event không tồn tại' });
    }

    // Nếu có seasonId, sử dụng nó, nếu không thì dùng event.seasonId
    const targetSeasonId = seasonId || event.seasonId;
    if (!targetSeasonId) {
      return res.status(400).json({ message: 'Event không có seasonId' });
    }

    // Lấy tất cả ranking của event này
    const rankings = await Ranking.find({ 
      eventId: eventId,
      seasonId: targetSeasonId
    })
      .populate('teamId', 'name shortName avatar logo')
      .populate('eventId', 'name')
      .populate('seasonId', 'name startDate endDate')
      .sort({ point: -1, gd: -1, gf: -1 }); // Sắp xếp theo điểm, hiệu số, số bàn thắng

    res.status(200).json({
      message: 'Lấy bảng xếp hạng thành công',
      data: rankings
    });

  } catch (error) {
    console.error('Error getting ranking:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy bảng xếp hạng', error: error.message });
  }
};

/**
 * Lấy tất cả bảng xếp hạng (cho trang quản lý ranking)
 */
const getAllRankings = async (req, res) => {
  try {
    const { seasonId, eventId } = req.query;

    // Tạo filter
    const filter = {};
    if (seasonId) filter.seasonId = seasonId;
    if (eventId) filter.eventId = eventId;

    // Lấy tất cả ranking
    const rankings = await Ranking.find(filter)
      .populate('teamId', 'name shortName avatar logo')
      .populate('eventId', 'name')
      .populate('seasonId', 'name startDate endDate')
      .sort({ point: -1, gd: -1, gf: -1 });

    // Nhóm theo event
    const rankingsByEvent = {};
    rankings.forEach(ranking => {
      const eventId = ranking.eventId?._id?.toString() || ranking.eventId?.toString();
      if (!rankingsByEvent[eventId]) {
        rankingsByEvent[eventId] = {
          event: ranking.eventId,
          rankings: []
        };
      }
      rankingsByEvent[eventId].rankings.push(ranking);
    });

    res.status(200).json({
      message: 'Lấy bảng xếp hạng thành công',
      data: {
        allRankings: rankings,
        rankingsByEvent
      }
    });

  } catch (error) {
    console.error('Error getting all rankings:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy bảng xếp hạng', error: error.message });
  }
};

/**
 * Lấy form gần đây của một team (last 5 matches)
 */
const getTeamRecentForm = async (teamId, eventId) => {
  try {
    const matches = await Match.find({
      eventId: eventId,
      $or: [
        { team1Id: teamId },
        { team2Id: teamId }
      ],
      status: 'completed',
      score: { $exists: true }
    })
      .sort({ matchDate: -1, matchTime: -1 })
      .limit(5)
      .select('team1Id team2Id score');

    const form = [];
    for (const match of matches) {
      const isTeam1 = match.team1Id.toString() === teamId.toString();
      const score1 = match.score?.team1 || 0;
      const score2 = match.score?.team2 || 0;

      if (score1 > score2) {
        form.push(isTeam1 ? 'W' : 'L');
      } else if (score1 < score2) {
        form.push(isTeam1 ? 'L' : 'W');
      } else {
        form.push('D');
      }
    }

    // Đảo ngược để hiển thị từ cũ đến mới
    return form.reverse();
  } catch (error) {
    console.error('Error getting team form:', error);
    return [];
  }
};

/**
 * Lấy bảng xếp hạng với form gần đây
 */
const getRankingWithForm = async (req, res) => {
  try {
    const { seasonId, eventId } = req.query;

    // Tạo filter
    const filter = {};
    if (seasonId) filter.seasonId = seasonId;
    if (eventId) filter.eventId = eventId;

    // Lấy tất cả ranking
    const rankings = await Ranking.find(filter)
      .populate('teamId', 'name shortName avatar logo')
      .populate('eventId', 'name')
      .populate('seasonId', 'name startDate endDate')
      .sort({ point: -1, gd: -1, gf: -1 });

    // Lấy form cho mỗi team
    const rankingsWithForm = await Promise.all(
      rankings.map(async (ranking) => {
        const form = await getTeamRecentForm(ranking.teamId._id, ranking.eventId._id);
        return {
          ...ranking.toObject(),
          form: form
        };
      })
    );

    res.status(200).json({
      message: 'Lấy bảng xếp hạng thành công',
      data: rankingsWithForm
    });

  } catch (error) {
    console.error('Error getting ranking with form:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy bảng xếp hạng', error: error.message });
  }
};

module.exports = {
  getRankingByEvent,
  getAllRankings,
  getRankingWithForm
};

