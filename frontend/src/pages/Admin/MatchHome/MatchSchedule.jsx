import React, { useState } from 'react';
import { 
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Clock,
  Users,
  GamepadIcon,
  MoreVertical,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

const MatchSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGame, setFilterGame] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState([]);

  const matches = [
    {
      id: 1,
      name: 'Chung kết mùa xuân 2024',
      team1: 'Team Alpha',
      team2: 'Team Beta',
      game: 'League of Legends',
      date: '2024-06-25',
      time: '19:30',
      status: 'scheduled',
      viewers: null,
      format: 'BO5',
      map: 'Summoner\'s Rift'
    },
    {
      id: 2,
      name: 'Bán kết Valorant Championship',
      team1: 'Phoenix Squad',
      team2: 'Dragon Force',
      game: 'Valorant',
      date: '2024-06-23',
      time: '20:00',
      status: 'live',
      viewers: 1250,
      format: 'BO3',
      map: 'Haven'
    },
    {
      id: 3,
      name: 'Tứ kết CS2 Major',
      team1: 'Storm Elite',
      team2: 'Fire Legion',
      game: 'Counter-Strike 2',
      date: '2024-06-22',
      time: '18:00',
      status: 'finished',
      viewers: 890,
      format: 'BO3',
      map: 'Dust2'
    },
    {
      id: 4,
      name: 'Giao hữu Dota 2',
      team1: 'Thunder Wolves',
      team2: 'Ice Ravens',
      game: 'Dota 2',
      date: '2024-06-24',
      time: '21:00',
      status: 'cancelled',
      viewers: null,
      format: 'BO1',
      map: 'Default'
    }
  ];

  const statusConfig = {
    scheduled: { 
      label: 'Sắp diễn ra', 
      color: 'bg-yellow-500 text-white',
      icon: Clock
    },
    live: { 
      label: 'Đang diễn ra', 
      color: 'bg-red-500 text-white',
      icon: Play
    },
    finished: { 
      label: 'Đã kết thúc', 
      color: 'bg-gray-500 text-white',
      icon: Pause
    },
    cancelled: { 
      label: 'Đã hủy', 
      color: 'bg-red-800 text-white',
      icon: AlertCircle
    }
  };

  const games = ['League of Legends', 'Valorant', 'Counter-Strike 2', 'Dota 2'];

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.team1.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.team2.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || match.status === filterStatus;
    const matchesGame = filterGame === 'all' || match.game === filterGame;
    
    return matchesSearch && matchesStatus && matchesGame;
  });

  const handleSelectMatch = (matchId) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMatches.length === filteredMatches.length) {
      setSelectedMatches([]);
    } else {
      setSelectedMatches(filteredMatches.map(match => match.id));
    }
  };

  const getActionButtons = (match) => {
    switch (match.status) {
      case 'scheduled':
        return (
          <>
            <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors">
              <Play className="w-4 h-4" />
            </button>
          </>
        );
      case 'live':
        return (
          <>
            <button className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded-lg transition-colors">
              <Pause className="w-4 h-4" />
            </button>
          </>
        );
      case 'finished':
        return (
          <button className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6" />
          Quản lý trận đấu
        </h2>
        <p className="text-purple-200">
          Quản lý và theo dõi tất cả các trận đấu
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm trận đấu, đội..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Bộ lọc
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-gray-800">Tất cả</option>
                  <option value="scheduled" className="bg-gray-800">Sắp diễn ra</option>
                  <option value="live" className="bg-gray-800">Đang diễn ra</option>
                  <option value="finished" className="bg-gray-800">Đã kết thúc</option>
                  <option value="cancelled" className="bg-gray-800">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Game
                </label>
                <select
                  value={filterGame}
                  onChange={(e) => setFilterGame(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-gray-800">Tất cả</option>
                  {games.map(game => (
                    <option key={game} value={game} className="bg-gray-800">
                      {game}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedMatches.length > 0 && (
        <div className="mb-4 p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-white">
              Đã chọn {selectedMatches.length} trận đấu
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                Chỉnh sửa hàng loạt
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                Xóa đã chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matches Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {/* Table Header */}
        <div className="bg-white/5 p-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedMatches.length === filteredMatches.length && filteredMatches.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
            />
            <div className="grid grid-cols-12 gap-4 flex-1 text-sm font-medium text-purple-200">
              <div className="col-span-4 lg:col-span-3">Trận đấu</div>
              <div className="col-span-3 lg:col-span-2 hidden sm:block">Đội</div>
              <div className="col-span-2 hidden lg:block">Game</div>
              <div className="col-span-2">Thời gian</div>
              <div className="col-span-2 lg:col-span-1">Trạng thái</div>
              <div className="col-span-1">Thao tác</div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/10">
          {filteredMatches.map((match) => {
            const StatusIcon = statusConfig[match.status].icon;
            return (
              <div
                key={match.id}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedMatches.includes(match.id)}
                    onChange={() => handleSelectMatch(match.id)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  
                  <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                    {/* Match Name */}
                    <div className="col-span-4 lg:col-span-3">
                      <div className="text-white font-medium mb-1">
                        {match.name}
                      </div>
                      <div className="text-sm text-purple-300 flex items-center gap-1">
                        <GamepadIcon className="w-3 h-3" />
                        {match.format} • {match.map}
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="col-span-3 lg:col-span-2 hidden sm:block">
                      <div className="text-white text-sm">
                        {match.team1}
                      </div>
                      <div className="text-purple-300 text-xs">vs</div>
                      <div className="text-white text-sm">
                        {match.team2}
                      </div>
                    </div>

                    {/* Game */}
                    <div className="col-span-2 hidden lg:block">
                      <span className="text-purple-200 text-sm">
                        {match.game}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="col-span-2">
                      <div className="text-white text-sm">
                        {new Date(match.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-purple-300 text-xs">
                        {match.time}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 lg:col-span-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[match.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {statusConfig[match.status].label}
                        </span>
                      </span>
                      {match.viewers && (
                        <div className="text-xs text-purple-300 mt-1 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {match.viewers}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        {getActionButtons(match)}
                        <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-colors lg:hidden">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <GamepadIcon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy trận đấu
          </h3>
          <p className="text-purple-200 mb-4">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300">
            Tạo trận đấu mới
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredMatches.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-purple-200">
            Hiển thị {filteredMatches.length} trận đấu
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm border border-white/20">
              Trước
            </button>
            <span className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm">
              1
            </span>
            <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm border border-white/20">
              Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchSchedule;