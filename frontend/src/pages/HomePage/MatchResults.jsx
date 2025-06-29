import React, { useEffect, useState } from 'react';
import { Calendar, Trophy, MapPin, Clock, Users, TrendingUp, Award, Star, X, Eye } from 'lucide-react';

function MatchResults() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  // Close modal when clicking outside or pressing ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const matches = [
    {
      id: 1,
      date: "July 18, 2018",
      time: "19:45",
      title: "Trận Đấu Kinh Điển",
      homeTeam: {
        name: "Manchester United",
        logo: "https://upload.wikimedia.org/wikipedia/vi/a/a1/Man_Utd_FC_.svg",
        stats: { possession: 58, shots: 14, corners: 7 }
      },
      awayTeam: {
        name: "Manchester City",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png",
        stats: { possession: 42, shots: 11, corners: 4 }
      },
      score: "1 - 1",
      result: "draw",
      league: "Premier League",
      stadium: "Old Trafford",
      attendance: "74,879",
      highlights: ["Penalty saved in 78'", "Red card 85'", "Last minute equalizer"],
      status: "Completed"
    },
    {
      id: 2,
      date: "July 11, 2018",
      time: "20:00",
      title: "Chiến Thắng Ấn Tượng",
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
        stats: { possession: 65, shots: 18, corners: 9 }
      },
      awayTeam: {
        name: "FC Barcelona",
        logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/9/91/FC_Barcelona_logo.svg/2020px-FC_Barcelona_logo.svg.png",
        stats: { possession: 35, shots: 8, corners: 3 }
      },
      score: "3 - 1",
      result: "win",
      league: "Premier League",
      stadium: "Emirates Stadium",
      attendance: "60,260",
      highlights: ["Hat-trick by Sterling", "Fantastic team play", "Dominant performance"],
      status: "Completed"
    },
    {
      id: 3,
      date: "July 25, 2018",
      time: "21:30",
      title: "Trận Cầu Kịch Tính",
      homeTeam: {
        name: "Portugal",
        logo: "https://images.vexels.com/media/users/3/152592/isolated/preview/96d97eadc822aafbc7062c6646da0c47-portugal-football-team-logo.png",
        stats: { possession: 52, shots: 16, corners: 6 }
      },
      awayTeam: {
        name: "Argentina",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Argentina_national_football_team_logo.svg/800px-Argentina_national_football_team_logo.svg.png",
        stats: { possession: 48, shots: 12, corners: 5 }
      },
      score: "2 - 3",
      result: "loss",
      league: "Premier League",
      stadium: "Stamford Bridge",
      attendance: "41,837",
      highlights: ["Amazing comeback", "Controversial VAR decision", "5 goals thriller"],
      status: "Completed"
    }
  ];

  const getResultColor = (result) => {
    switch(result) {
      case 'win': return 'from-green-600 to-emerald-700';
      case 'loss': return 'from-red-600 to-rose-700';
      case 'draw': return 'from-amber-600 to-orange-700';
      default: return 'from-gray-600 to-slate-700';
    }
  };

  const getResultIcon = (result) => {
    switch(result) {
      case 'win': return <Trophy className="w-5 h-5 text-white" />;
      case 'loss': return <TrendingUp className="w-5 h-5 rotate-180 text-white" />;
      case 'draw': return <Award className="w-5 h-5 text-white" />;
      default: return <Star className="w-5 h-5 text-white" />;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <section className="bg-gray-50 from-gray-50 via-slate-50 to-gray-100 py-10 px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-slate-200/30 to-gray-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-slate-300/20 to-gray-200/25 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
       <div className="text-center pt-8 border-t border-gray-200">
          <div className="inline-flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-lg px-6 py-3 shadow-sm">
            <Trophy className="w-5 h-5 text-gray-700" />
            <span className="text-base font-semibold text-gray-800">Theo dõi các trận đấu sắp tới</span>
          </div>
        </div>
        </div>

        {/* Match Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          {matches.map((match, index) => (
            <div
              key={match.id}
              onClick={() => openModal(match)}
              className="group bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Result Status Badge */}
              <div className={`h-1 bg-gradient-to-r ${getResultColor(match.result)}`}></div>
              
              <div className="p-6 flex flex-col justify-between h-[420px]">
                {/* Date and Time */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-semibold">{formatDate(match.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">{match.time}</span>
                  </div>
                </div>

                {/* Teams and Score */}
                <div className="flex items-center justify-between mb-6">
                  {/* Home Team */}
                  <div className="flex flex-col items-center space-y-3 flex-1">
                    <div className="w-14 h-14 transition-transform duration-200 group-hover:scale-105">
                      <img
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-bold text-gray-800 text-center text-sm leading-tight">
                      {match.homeTeam.name}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center mx-6">
                    <div className="text-2xl font-bold text-gray-900 tracking-wide">
                      {match.score}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center space-y-3 flex-1">
                    <div className="w-14 h-14 transition-transform duration-200 group-hover:scale-105">
                      <img
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-bold text-gray-800 text-center text-sm leading-tight">
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* League and Stadium */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold">{match.league}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{match.stadium}</span>
                  </div>
                </div>

                {/* Match Title */}
                <h4 className="text-lg font-bold text-center text-gray-800 mb-6 group-hover:text-gray-900 transition-colors">
                  {match.title}
                </h4>

                {/* Click to view indicator */}
                <div className="text-center text-gray-500 group-hover:text-gray-700 transition-colors">
                  <div className="flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Click để xem chi tiết</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
     {/* Modal */}
      {isModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Minimalist */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Featured Match</h3>
                  <p className="text-gray-500 text-sm">{selectedMatch.league}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-8">
              {/* Teams and Score - Clean Layout */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-8 mb-6">
                  {/* Home Team */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16">
                      <img
                        src={selectedMatch.homeTeam.logo}
                        alt={selectedMatch.homeTeam.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 text-sm">{selectedMatch.homeTeam.name}</h4>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {selectedMatch.score}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16">
                      <img
                        src={selectedMatch.awayTeam.logo}
                        alt={selectedMatch.awayTeam.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 text-sm">{selectedMatch.awayTeam.name}</h4>
                    </div>
                  </div>
                </div>

                {/* Match Details */}
                <div className="text-center text-gray-500 text-sm space-y-1">
                  <p>Group stage • Group G • Matchday 2 of 3</p>
                </div>
              </div>

              {/* Goal Scorers */}
              <div className="mb-8">
                <div className="flex justify-between items-start">
                  {/* Home Team Goals */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      {selectedMatch.highlights.slice(0, 2).map((highlight, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                          <span className="text-sm text-gray-700">{highlight}</span>
                          <span className="text-sm text-green-600 font-medium">30'</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center divider */}
                  <div className="w-px bg-gray-200 mx-6 h-16"></div>

                  {/* Away Team Goals */}
                  <div className="flex-1 text-right">
                    <div className="space-y-2">
                      {selectedMatch.highlights.slice(2, 3).map((highlight, idx) => (
                        <div key={idx} className="flex items-center justify-end space-x-2">
                          <span className="text-sm text-green-600 font-medium">25'</span>
                          <span className="text-sm text-gray-700">{highlight}</span>
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Statistics */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h5 className="text-center text-gray-700 font-medium mb-6">Thống kê trận đấu</h5>
                
                {/* Stats Grid */}
                <div className="space-y-6">
                  {/* Possession */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">{selectedMatch.homeTeam.stats.possession}%</span>
                      <span className="text-sm text-gray-500">Kiểm soát bóng</span>
                      <span className="text-lg font-semibold text-gray-900">{selectedMatch.awayTeam.stats.possession}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${selectedMatch.homeTeam.stats.possession}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Shots */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">{selectedMatch.homeTeam.stats.shots}</span>
                      <span className="text-sm text-gray-500">Cú sút</span>
                      <span className="text-lg font-semibold text-gray-900">{selectedMatch.awayTeam.stats.shots}</span>
                    </div>
                  </div>

                  {/* Corners */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">{selectedMatch.homeTeam.stats.corners}</span>
                      <span className="text-sm text-gray-500">Phạt góc</span>
                      <span className="text-lg font-semibold text-gray-900">{selectedMatch.awayTeam.stats.corners}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Watch Live Button */}
              <div className="text-center">
                <button className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  <Eye className="w-5 h-5" />
                  <span>Watch live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MatchResults;