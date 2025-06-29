import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, TrendingUp } from 'lucide-react';

const Ranking = () => {
  const [selectedSeason, setSelectedSeason] = useState('2024-25');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dữ liệu mẫu cho các mùa giải
  const seasons = [
    { id: '2024-25', name: '2024-25' },
    { id: '2023-24', name: '2023-24' },
    { id: '2022-23', name: '2022-23' },
    { id: '2021-22', name: '2021-22' }
  ];

  // Dữ liệu mẫu cho các loại giải đấu
  const eventTypes = [
    { id: 'all', name: 'Tất cả giải đấu' },
    { id: 'premier-league', name: 'Premier League' },
    { id: 'champions-league', name: 'Champions League' },
    { id: 'la-liga', name: 'La Liga' },
    { id: 'serie-a', name: 'Serie A' }
  ];

  // Dữ liệu mẫu cho bảng xếp hạng (theo style của ảnh)
  const [leaderboardData, setLeaderboardData] = useState([
    { 
      id: 1, 
      team: 'Arsenal', 
      img: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/800px-Arsenal_FC.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 9, 
      d: 0, 
      l: 1, 
      gf: 24, 
      ga: 10, 
      gd: 14, 
      pts: 27, 
      form: ['W', 'W', 'W', 'W', 'L'] 
    },
    { 
      id: 2, 
      team: 'Man City', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/1/1d/Manchester_City_FC_logo.svg/2048px-Manchester_City_FC_logo.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 7, 
      d: 2, 
      l: 1, 
      gf: 33, 
      ga: 10, 
      gd: 23, 
      pts: 23, 
      form: ['L', 'W', 'W', 'W', 'D'] 
    },
    { 
      id: 3, 
      team: 'Tottenham', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/b/bd/Tottenham_Hotspur_FC.svg/1200px-Tottenham_Hotspur_FC.svg.png', 
      event: 'premier-league', 
      mp: 11, 
      w: 7, 
      d: 2, 
      l: 2, 
      gf: 22, 
      ga: 12, 
      gd: 10, 
      pts: 23, 
      form: ['L', 'W', 'W', 'L', 'W'] 
    },
    { 
      id: 4, 
      team: 'Chelsea', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/5/5c/Chelsea_crest.svg/1200px-Chelsea_crest.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 6, 
      d: 2, 
      l: 2, 
      gf: 15, 
      ga: 10, 
      gd: 5, 
      pts: 20, 
      form: ['D', 'W', 'W', 'W', 'W'] 
    },
    { 
      id: 5, 
      team: 'Man United', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/a/a1/Man_Utd_FC_.svg/2021px-Man_Utd_FC_.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 6, 
      d: 1, 
      l: 3, 
      gf: 15, 
      ga: 15, 
      gd: 0, 
      pts: 19, 
      form: ['W', 'D', 'W', 'L', 'W'] 
    },
    { 
      id: 6, 
      team: 'Newcastle', 
      img: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png', 
      event: 'premier-league', 
      mp: 11, 
      w: 4, 
      d: 6, 
      l: 1, 
      gf: 18, 
      ga: 9, 
      gd: 9, 
      pts: 18, 
      form: ['W', 'D', 'W', 'W', 'D'] 
    },
    { 
      id: 7, 
      team: 'Liverpool', 
      img: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/800px-Liverpool_FC.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 4, 
      d: 4, 
      l: 2, 
      gf: 22, 
      ga: 12, 
      gd: 10, 
      pts: 16, 
      form: ['W', 'W', 'L', 'D', 'D'] 
    },
    { 
      id: 8, 
      team: 'Brighton', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/1200px-Brighton_%26_Hove_Albion_logo.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 4, 
      d: 3, 
      l: 3, 
      gf: 14, 
      ga: 11, 
      gd: 3, 
      pts: 15, 
      form: ['D', 'L', 'L', 'D', 'W'] 
    }
  ]);

  // Filter dữ liệu
  const filteredData = leaderboardData.filter(team => {
    const matchesEvent = selectedEvent === 'all' || team.event === selectedEvent;
    const matchesSearch = team.team.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  // Hàm để hiển thị form gần đây
  const renderForm = (form) => {
    return form.map((result, index) => (
      <div
        key={index}
        className={`w-6 h-6 rounded-full text-xs font-semibold text-white flex items-center justify-center ${
          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-gray-400' : 'bg-red-500'
        }`}
        title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
      >
        {result === 'W' ? '✓' : result === 'D' ? '−' : '✗'}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Bảng Xếp Hạng Bóng Đá
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Quản lý và theo dõi bảng xếp hạng các giải đấu</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Season Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-blue-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {seasons.map(season => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Loại giải đấu
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {eventTypes.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Nhập tên đội..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Club</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">MP</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">W</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">D</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">L</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">GF</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">GA</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">GD</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Last 5</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((team, index) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 mr-3">
                          <span className="text-lg font-semibold text-gray-500">{index + 1}</span>
                        </div>
                        <div className="flex items-center">
                            <img 
                            src={team.img} 
                            alt={`${team.team} logo`}
                            className="w-6 h-6 mr-3 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'inline-block';
                            }}
                          />
                          <span className="text-sm font-medium text-gray-900">{team.team}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{team.mp}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{team.w}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{team.d}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{team.l}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{team.gf}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{team.ga}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <span className={team.gd >= 0 ? 'text-gray-900' : 'text-gray-900'}>
                        {team.gd > 0 ? '+' : ''}{team.gd}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">{team.pts}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-1">
                        {renderForm(team.form)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tablet Table */}
        <div className="hidden md:block lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Club</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 uppercase">MP</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 uppercase">W</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 uppercase">D</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 uppercase">L</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 uppercase">GD</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 uppercase">Pts</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase">Form</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((team, index) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 mr-2">{index + 1}</span>
                        <span className="text-lg mr-2">{team.logo}</span>
                        <span className="text-sm font-medium text-gray-900">{team.team}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900">{team.mp}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900">{team.w}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900">{team.d}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900">{team.l}</td>
                    <td className="px-3 py-3 text-center text-sm font-medium text-gray-900">
                      {team.gd > 0 ? '+' : ''}{team.gd}
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-gray-900">{team.pts}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-1">
                        {renderForm(team.form.slice(-3))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {filteredData.map((team, index) => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-3">{index + 1}</span>
                  <span className="text-xl mr-2">{team.logo}</span>
                  <span className="text-sm font-medium text-gray-900">{team.team}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{team.pts}</div>
                  <div className="text-xs text-gray-500">Pts</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-3 text-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">{team.mp}</div>
                  <div className="text-xs text-gray-500">MP</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{team.w}</div>
                  <div className="text-xs text-gray-500">W</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{team.d}</div>
                  <div className="text-xs text-gray-500">D</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{team.l}</div>
                  <div className="text-xs text-gray-500">L</div>
                </div>
              </div>

              {/* Goals and Form */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-xs">
                  <span className="text-gray-600">GF: <span className="font-medium text-gray-900">{team.gf}</span></span>
                  <span className="text-gray-600">GA: <span className="font-medium text-gray-900">{team.ga}</span></span>
                  <span className="text-gray-600">GD: <span className="font-medium text-gray-900">{team.gd > 0 ? '+' : ''}{team.gd}</span></span>
                </div>
                <div className="flex space-x-1">
                  {renderForm(team.form.slice(-3))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;