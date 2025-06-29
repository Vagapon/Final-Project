import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "../../ModalEvent/MatchModal"; // Import Modal component

const MatchOverview = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample match data for slides
  const featuredMatches = [
    {
      id: 1,
      homeTeam: "Real Madrid",
      awayTeam: "Manchester United",
      homeImg: "https://upload.wikimedia.org/wikipedia/vi/thumb/c/c7/Logo_Real_Madrid.svg/1200px-Logo_Real_Madrid.svg.png",
      awayImg: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a1/Man_Utd_FC_.svg/1200px-Man_Utd_FC_.svg.png",
      homeScore: 2,
      awayScore: 1,
      status: "live",
      minute: "30'",
      tournament: "FIFA Club World Cup",
      stage: "Group stage • Group G • Matchday 2 of 3",
      homeScorers: ["Abdelmounaim Boutouil 6' (OG)", "Kenan Yıldız 16'"],
      awayScorers: ["Thembinkosi Lorch 25'"]
    },
    {
      id: 2,
      homeTeam: "Barcelona",
      awayTeam: "Liverpool",
      homeImg: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/230px-FC_Barcelona_%28crest%29.svg.png",
      awayImg: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
      homeScore: 1,
      awayScore: 3,
      status: "finished",
      minute: "FT",
      tournament: "Champions League",
      stage: "Quarter Finals • Leg 1 of 2",
      homeScorers: ["Pedri 23'"],
      awayScorers: ["Salah 15'", "Mané 34'", "Firmino 67'"]
    },
    {
      id: 3,
      homeTeam: "Chelsea",
      awayTeam: "Arsenal",
      homeImg: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
      awayImg: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      minute: "18:30",
      tournament: "Premier League",
      stage: "Matchday 15 of 38",
      homeScorers: [],
      awayScorers: []
    }
  ];

  const matches = [
    {
      id: 1,
      homeTeam: "Crystal Palace",
      homeTeamShort: "CRY",
      awayTeam: "Arsenal",
      awayTeamShort: "ARS",
      homeImg:
        "https://upload.wikimedia.org/wikipedia/vi/a/a2/Crystal_Palace_FC_logo_%282022%29.svg.png",
      awayImg: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
      date: "Thứ 7, 6/8",
      time: "02:00",
      status: "scheduled",
    },
    {
      id: 2,
      homeTeam: "Fulham",
      homeTeamShort: "FUL",
      awayTeam: "Liverpool",
      awayTeamShort: "LIV",
      homeFlag: "⚪",
      awayFlag: "🔴",
      date: "Thứ 7, 6/8",
      time: "18:30",
      status: "scheduled",
    },
    {
      id: 3,
      homeTeam: "Bournemouth",
      homeTeamShort: "BOU",
      awayTeam: "Aston Villa",
      awayTeamShort: "AVL",
      homeFlag: "🍒",
      awayFlag: "🦁",
      date: "Thứ 7, 6/8",
      time: "21:00",
      status: "scheduled",
    },
    {
      id: 4,
      homeTeam: "Newcastle",
      homeTeamShort: "NEW",
      awayTeam: "Nottm Forest",
      awayTeamShort: "NFO",
      homeFlag: "⚫",
      awayFlag: "🌲",
      date: "Thứ 7, 6/8",
      time: "21:00",
      status: "scheduled",
    },
    {
      id: 5,
      homeTeam: "Tottenham",
      homeTeamShort: "TOT",
      awayTeam: "Southampton",
      awayTeamShort: "SOU",
      homeFlag: "⚪",
      awayFlag: "🔴",
      date: "Thứ 7, 6/8",
      time: "21:00",
      status: "scheduled",
    },
    {
      id: 6,
      homeTeam: "Leeds United",
      homeTeamShort: "LEE",
      awayTeam: "Wolves",
      awayTeamShort: "WOL",
      homeFlag: "⚪",
      awayFlag: "🟡",
      date: "Thứ 7, 6/8",
      time: "21:00",
      status: "scheduled",
    },
    {
      id: 7,
      homeTeam: "Everton",
      homeTeamShort: "EVE",
      awayTeam: "Chelsea",
      awayTeamShort: "CHE",
      homeFlag: "🔵",
      awayFlag: "🔵",
      date: "Thứ 7, 6/8",
      time: "23:30",
      status: "scheduled",
    },
    {
      id: 8,
      homeTeam: "Leicester City",
      homeTeamShort: "LEI",
      awayTeam: "Brentford",
      awayTeamShort: "BRE",
      homeFlag: "🦊",
      awayFlag: "🐝",
      date: "Chủ nhật, 7/8",
      time: "20:00",
      status: "scheduled",
    },
    {
      id: 9,
      homeTeam: "Man United",
      homeTeamShort: "MUN",
      awayTeam: "Brighton",
      awayTeamShort: "BHA",
      homeFlag: "🔴",
      awayFlag: "⚪",
      date: "Chủ nhật, 7/8",
      time: "20:00",
      status: "scheduled",
    },
    {
      id: 10,
      homeTeam: "West Ham",
      homeTeamShort: "WHU",
      awayTeam: "Man City",
      awayTeamShort: "MCI",
      homeFlag: "⚒️",
      awayFlag: "🔵",
      date: "Chủ nhật, 7/8",
      time: "22:30",
      status: "scheduled",
    },
  ];

  const handleEdit = (match) => {
    setSelectedMatch(match);
    setEditFormData(match);
    setShowEditModal(true);
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowDetailModal(true);
  };

  const handleDelete = (matchId, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa trận đấu này?")) {
      console.log("Xóa trận đấu:", matchId);
    }
  };

  const handleEditClick = (match, e) => {
    e.stopPropagation();
    handleEdit(match);
  };

  const handleSaveEdit = () => {
    console.log("Lưu chỉnh sửa:", editFormData);
    setShowEditModal(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMatches.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMatches.length) % featuredMatches.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-7xl mx-auto">
      {/* Featured Matches Slider */}
      <div className="relative mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out" 
             style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {featuredMatches.map((match, index) => (
            <div key={match.id} className="w-full flex-shrink-0">
              <div className="max-w-3xl mx-auto p-6 text-center">
                {/* Header */}
                <h2 className="text-2xl font-semibold mb-4 text-left">Featured Match</h2>

                {/* Subheading */}
                <p className="text-sm text-gray-500 mb-2 text-left">
                  {match.tournament}
                </p>

                {/* Teams & Score */}
                <div className="flex items-center justify-between text-center py-6 border-b border-gray-200">
                  {/* Team 1 */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <img
                      src={match.homeImg}
                      alt={match.homeTeam}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="font-medium text-gray-800">{match.homeTeam}</span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                    <span>{match.homeScore}</span>
                    <span>-</span>
                    <span>{match.awayScore}</span>
                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <img
                      src={match.awayImg}
                      alt={match.awayTeam}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="font-medium text-gray-800">{match.awayTeam}</span>
                  </div>
                </div>

                {/* Match Info */}
                <p className="text-sm text-gray-500 my-2">
                  {match.stage}
                </p>

                {/* Scorers */}
                <div className="flex justify-between text-sm text-gray-800 border-t pt-4">
                  {/* Left scorers */}
                  <div className="text-left">
                    {match.homeScorers.map((scorer, i) => (
                      <p key={i}>{scorer}</p>
                    ))}
                  </div>

                  {/* Match minute */}
                  <div className="flex items-center justify-center text-green-600 text-sm">
                    <span className="font-bold">{match.minute}</span>
                  </div>

                  {/* Right scorers */}
                  <div className="text-right">
                    {match.awayScorers.map((scorer, i) => (
                      <p key={i} className="flex items-center justify-end gap-1">
                        <span className="w-3 h-3 rounded-full bg-current"></span> {scorer}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Watch button */}
                <div className="my-6">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-100 transition mx-auto">
                    🔍 Watch live
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {featuredMatches.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-2 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lịch thi đấu</h1>
        <p className="text-gray-600">Quản lý các trận đấu sắp tới</p>
      </div>
 
      {/* Matches Grid - 2 columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mx-12">
        {matches.map((match) => (
          <div
            key={match.id}
            className="group bg-white rounded-none border border-gray-200 p-3 hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-300"
            onClick={() => handleMatchClick(match)}
          >
            <div className="flex items-center justify-between">
              {/* Left side - Teams stacked vertically */}
              <div className="flex-1">
                {/* Home Team */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={match.homeImg}
                      alt={match.homeTeam}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium">{match.homeTeam}</span>
                </div>

                {/* Away Team */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={match.awayImg}
                      alt={match.awayTeam}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium">{match.awayTeam}</span>
                </div>
              </div>
              <hr className="w-px h-20 bg-gray-300 mx-4" />

              {/* Right side - Date & Time */}
              <div className="text-right mr-3">
                <div className="text-gray-500 text-xs mb-1">{match.date}</div>
                <div className="text-gray-900 font-bold text-sm">
                  {match.time}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => handleEditClick(match, e)}
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(match.id, e)}
                  className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa trận đấu"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đội chủ nhà
            </label>
            <input
              type="text"
              value={editFormData.homeTeam || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, homeTeam: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đội khách
            </label>
            <input
              type="text"
              value={editFormData.awayTeam || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, awayTeam: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày thi đấu
            </label>
            <input
              type="text"
              value={editFormData.date || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, date: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giờ thi đấu
            </label>
            <input
              type="time"
              value={editFormData.time || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, time: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết trận đấu"
      >
        {selectedMatch && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xl">{selectedMatch.homeFlag}</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {selectedMatch.homeTeam}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xl">{selectedMatch.awayFlag}</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {selectedMatch.awayTeam}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Ngày:</span>
                  <div className="text-gray-900">{selectedMatch.date}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Giờ:</span>
                  <div className="text-gray-900">{selectedMatch.time}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Trạng thái:</span>
                  <div className="text-gray-900">Sắp diễn ra</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">ID:</span>
                  <div className="text-gray-900">#{selectedMatch.id}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MatchOverview;