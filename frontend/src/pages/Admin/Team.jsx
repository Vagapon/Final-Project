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
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Quản Lý Đội Bóng</h1>
        <p className="text-gray-600">Quản lý thông tin các đội bóng tham gia giải đấu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đội bóng</p>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {teams.filter(t => t.status === 'Hoạt động').length}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tạm ngưng</p>
              <p className="text-2xl font-bold text-red-600">
                {teams.filter(t => t.status === 'Tạm ngưng').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng cầu thủ</p>
              <p className="text-2xl font-bold text-purple-600">
                {teams.reduce((sum, team) => sum + team.players, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đội bóng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Tạm ngưng">Tạm ngưng</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAddTeam}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm đội bóng
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đội bóng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Huấn luyện viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giải đấu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{team.logo}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{team.name}</div>
                        <div className="text-sm text-gray-500">Thành lập: {team.founded}</div>
                        <div className="text-sm text-gray-500">{team.players} cầu thủ</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{team.coach}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{team.league}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Thắng: <span className="font-medium text-green-600">{team.wins}</span></div>
                      <div>Hòa: <span className="font-medium text-yellow-600">{team.draws}</span></div>
                      <div>Thua: <span className="font-medium text-red-600">{team.losses}</span></div>
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div key={team.id} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{team.logo}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.league}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(team.status)}`}>
                  {team.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-500">HLV:</p>
                  <p className="font-medium">{team.coach}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cầu thủ:</p>
                  <p className="font-medium">{team.players}</p>
                </div>
                <div>
                  <p className="text-gray-500">Thành lập:</p>
                  <p className="font-medium">{team.founded}</p>
                </div>
                <div>
                  <p className="text-gray-500">Thống kê:</p>
                  <p className="font-medium">
                    <span className="text-green-600">{team.wins}T</span> - 
                    <span className="text-yellow-600">{team.draws}H</span> - 
                    <span className="text-red-600">{team.losses}B</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTeam(team)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
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
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đội bóng</h3>
            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingTeam ? 'Sửa thông tin đội bóng' : 'Thêm đội bóng mới'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đội bóng *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên đội bóng"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData({...formData, logo: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="⚽"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Huấn luyện viên *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.coach}
                      onChange={(e) => setFormData({...formData, coach: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên HLV"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số cầu thủ *
                    </label>
                    <input
                      type="number"
                      required
                      min="11"
                      max="50"
                      value={formData.players}
                      onChange={(e) => setFormData({...formData, players: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm thành lập *
                    </label>
                    <input
                      type="number"
                      required
                      min="1800"
                      max="2025"
                      value={formData.founded}
                      onChange={(e) => setFormData({...formData, founded: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1902"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giải đấu *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.league}
                      onChange={(e) => setFormData({...formData, league: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Premier League"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm ngưng">Tạm ngưng</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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





