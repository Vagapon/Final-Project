/**
 * Utility functions để tạo lịch thi đấu vòng tròn
 */

/**
 * Tạo lịch thi đấu vòng tròn 1 lượt
 * @param {Array} teams - Danh sách các đội tham gia
 * @param {Object} eventInfo - Thông tin event (startDate, endDate, numberOfMatch)
 * @returns {Array} - Danh sách các trận đấu
 */
function generateRoundRobinSchedule(teams, eventInfo) {
  if (!teams || teams.length < 2) {
    throw new Error('Cần ít nhất 2 đội để tạo lịch thi đấu');
  }

  const matches = [];
  const teamCount = teams.length;
  
  // Tính số vòng đấu cần thiết
  const totalRounds = teamCount % 2 === 0 ? teamCount - 1 : teamCount;
  
  // Tạo ma trận thi đấu
  const schedule = [];
  
  // Nếu số đội lẻ, thêm đội "bye" (nghỉ)
  const teamsWithBye = teamCount % 2 === 1 ? [...teams, null] : teams;
  const actualTeamCount = teamsWithBye.length;
  
  // Tạo lịch thi đấu
  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];
    
    for (let i = 0; i < actualTeamCount / 2; i++) {
      const team1Index = i;
      const team2Index = actualTeamCount - 1 - i;
      
      const team1 = teamsWithBye[team1Index];
      const team2 = teamsWithBye[team2Index];
      
      // Bỏ qua nếu có đội "bye"
      if (team1 && team2) {
        roundMatches.push({
          team1: team1,
          team2: team2,
          round: round + 1
        });
      }
    }
    
    schedule.push(roundMatches);
    
    // Xoay vòng các đội (trừ đội đầu tiên)
    const firstTeam = teamsWithBye[0];
    const lastTeam = teamsWithBye[actualTeamCount - 1];
    
    // Di chuyển các đội
    for (let i = actualTeamCount - 1; i > 1; i--) {
      teamsWithBye[i] = teamsWithBye[i - 1];
    }
    teamsWithBye[1] = lastTeam;
  }
  
  // Chuyển đổi thành format phù hợp với model Match
  let matchNumber = 1;
  const startDate = new Date(eventInfo.startDate);
  const endDate = new Date(eventInfo.endDate);
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  schedule.forEach((roundMatches, roundIndex) => {
    roundMatches.forEach((match, matchIndex) => {
      // Tính ngày thi đấu dựa trên số vòng và số trận
      const dayOffset = Math.floor((roundIndex * roundMatches.length + matchIndex) / Math.max(1, Math.floor(eventInfo.numberOfMatch / totalDays)));
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + Math.min(dayOffset, totalDays - 1));
      
      matches.push({
        team1Id: match.team1._id || match.team1,
        team2Id: match.team2._id || match.team2,
        round: `Round ${roundIndex + 1}`,
        matchNumber: matchNumber++,
        matchDate: matchDate,
        matchTime: "14:00", // Giờ mặc định, có thể tùy chỉnh
        duration: 90, // 90 phút mặc định
        eventId: eventInfo.eventId,
        status: 'upcoming'
      });
    });
  });
  
  return matches;
}

/**
 * Tính số trận đấu cần thiết cho thi đấu vòng tròn
 * @param {number} teamCount - Số lượng đội
 * @returns {number} - Số trận đấu
 */
function calculateTotalMatches(teamCount) {
  if (teamCount < 2) return 0;
  return (teamCount * (teamCount - 1)) / 2;
}

/**
 * Tính số vòng đấu cần thiết
 * @param {number} teamCount - Số lượng đội
 * @returns {number} - Số vòng đấu
 */
function calculateTotalRounds(teamCount) {
  if (teamCount < 2) return 0;
  return teamCount % 2 === 0 ? teamCount - 1 : teamCount;
}

/**
 * Phân bổ thời gian thi đấu cho các trận
 * @param {Array} matches - Danh sách trận đấu
 * @param {Object} options - Tùy chọn phân bổ thời gian
 * @returns {Array} - Danh sách trận đấu với thời gian đã phân bổ
 */
function allocateMatchTimes(matches, options = {}) {
  const {
    startTime = "09:00",
    endTime = "18:00",
    matchDuration = 90,
    breakTime = 30, // Thời gian nghỉ giữa các trận (phút)
    maxMatchesPerDay = 4
  } = options;
  
  // Nhóm các trận theo ngày
  const matchesByDate = {};
  matches.forEach(match => {
    const dateKey = match.matchDate.toISOString().split('T')[0];
    if (!matchesByDate[dateKey]) {
      matchesByDate[dateKey] = [];
    }
    matchesByDate[dateKey].push(match);
  });
  
  // Phân bổ thời gian cho từng ngày
  Object.keys(matchesByDate).forEach(dateKey => {
    const dayMatches = matchesByDate[dateKey];
    
    // Giới hạn số trận mỗi ngày
    const limitedMatches = dayMatches.slice(0, maxMatchesPerDay);
    
    limitedMatches.forEach((match, index) => {
      const startHour = parseInt(startTime.split(':')[0]);
      const startMinute = parseInt(startTime.split(':')[1]);
      
      const matchStartTime = new Date(match.matchDate);
      matchStartTime.setHours(startHour, startMinute + index * (matchDuration + breakTime), 0, 0);
      
      match.matchTime = `${matchStartTime.getHours().toString().padStart(2, '0')}:${matchStartTime.getMinutes().toString().padStart(2, '0')}`;
    });
  });
  
  return matches;
}

module.exports = {
  generateRoundRobinSchedule,
  calculateTotalMatches,
  calculateTotalRounds,
  allocateMatchTimes
};

