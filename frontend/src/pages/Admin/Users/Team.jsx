import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Trophy, Calendar, Filter } from 'lucide-react';

const Team = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Real Madrid',
      logo: '🏆',
      coach: 'Carlo Ancelotti',
      players: 25,
      founded: 1902,
      league: 'La Liga',
      status: 'Hoạt động',
      wins: 15,
      draws: 3,
      losses: 2
    },
    {
      id: 2,
      name: 'Barcelona',
      logo: '⚽',
      coach: 'Xavi Hernandez',
      players: 23,
      founded: 1899,
      league: 'La Liga',
      status: 'Hoạt động',
      wins: 12,
      draws: 5,
      losses: 3
    },
    {
      id: 3,
      name: 'Manchester United',
      logo: '🔴',
      coach: 'Erik ten Hag',
      players: 26,
      founded: 1878,
      league: 'Premier League',
      status: 'Tạm ngưng',
      wins: 10,
      draws: 4,
      losses: 6
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    coach: '',
    players: '',
    founded: '',
    league: '',
    status: 'Hoạt động'
  });

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.league.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Tất cả' || team.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddTeam = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      logo: '⚽',
      coach: '',
      players: '',
      founded: '',
      league: '',
      status: 'Hoạt động'
    });
    setShowModal(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      logo: team.logo,
      coach: team.coach,
      players: team.players.toString(),
      founded: team.founded.toString(),
      league: team.league,
      status: team.status
    });
    setShowModal(true);
  };

  const handleDeleteTeam = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đội bóng này?')) {
      setTeams(teams.filter(team => team.id !== id));
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.coach || !formData.players || !formData.founded || !formData.league) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }
    
    if (editingTeam) {
      setTeams(teams.map(team => 
        team.id === editingTeam.id 
          ? {
              ...team,
              ...formData,
              players: parseInt(formData.players),
              founded: parseInt(formData.founded)
            }
          : team
      ));
    } else {
      const newTeam = {
        id: Math.max(...teams.map(t => t.id)) + 1,
        ...formData,
        players: parseInt(formData.players),
        founded: parseInt(formData.founded),
        wins: Math.floor(Math.random() * 20),
        draws: Math.floor(Math.random() * 10),
        losses: Math.floor(Math.random() * 10)
      };
      setTeams([...teams, newTeam]);
    }
    
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    return status === 'Hoạt động' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
<div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Quản Lý Đội Bóng</h1>
        <p className="text-gray-600 dark:text-gray-300">Quản lý thông tin các đội bóng tham gia giải đấu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng đội bóng</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {teams.filter(t => t.status === 'Hoạt động').length}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tạm ngưng</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {teams.filter(t => t.status === 'Tạm ngưng').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng cầu thủ</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {teams.reduce((sum, team) => sum + team.players, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm đội bóng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Tạm ngưng">Tạm ngưng</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAddTeam}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm đội bóng
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Đội bóng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Huấn luyện viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Giải đấu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{team.logo}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Thành lập: {team.founded}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{team.players} cầu thủ</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{team.coach}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{team.league}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>Thắng: <span className="font-medium text-green-600 dark:text-green-400">{team.wins}</span></div>
                      <div>Hòa: <span className="font-medium text-yellow-600 dark:text-yellow-400">{team.draws}</span></div>
                      <div>Thua: <span className="font-medium text-red-600 dark:text-red-400">{team.losses}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(team.status)}`}>
                      {team.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {filteredTeams.map((team) => (
            <div key={team.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{team.logo}</div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{team.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{team.league}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(team.status)}`}>
                  {team.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">HLV:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{team.coach}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Cầu thủ:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{team.players}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Thành lập:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{team.founded}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Thống kê:</p>
                  <p className="font-medium">
                    <span className="text-green-600 dark:text-green-400">{team.wins}T</span> - 
                    <span className="text-yellow-600 dark:text-yellow-400">{team.draws}H</span> - 
                    <span className="text-red-600 dark:text-red-400">{team.losses}B</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTeam(team)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không tìm thấy đội bóng</h3>
            <p className="text-gray-500 dark:text-gray-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingTeam ? 'Sửa thông tin đội bóng' : 'Thêm đội bóng mới'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên đội bóng *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Nhập tên đội bóng"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData({...formData, logo: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="⚽"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Huấn luyện viên *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.coach}
                      onChange={(e) => setFormData({...formData, coach: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Nhập tên HLV"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số cầu thủ *
                    </label>
                    <input
                      type="number"
                      required
                      min="11"
                      max="50"
                      value={formData.players}
                      onChange={(e) => setFormData({...formData, players: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Năm thành lập *
                    </label>
                    <input
                      type="number"
                      required
                      min="1800"
                      max="2025"
                      value={formData.founded}
                      onChange={(e) => setFormData({...formData, founded: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="1902"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giải đấu *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.league}
                      onChange={(e) => setFormData({...formData, league: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Premier League"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm ngưng">Tạm ngưng</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    {editingTeam ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;





