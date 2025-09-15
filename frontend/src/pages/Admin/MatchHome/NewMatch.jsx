import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Trophy,
  Settings,
  Save,
  X,
  Search,
  Filter,
  MapPin,
  Shield,
  Star,
  User
} from 'lucide-react';

const NewMatch = () => {
  const [formData, setFormData] = useState({
    matchName: '',
    tournament: '',
    fieldType: '11',
    team1: null,
    team2: null,
    date: '',
    time: '',
    venue: '',
    referee: '',
    description: '',
    isPublic: true,
    streamUrl: '',
    round: ''
  });

  const [filters, setFilters] = useState({
    tournament: '',
    fieldType: '',
    searchTerm: ''
  });

  const tournaments = [
    { id: 'vleague', name: 'V.League 1', type: '11' },
    { id: 'vleague2', name: 'V.League 2', type: '11' },
    { id: 'vcup', name: 'Cúp Quốc Gia', type: '11' },
    { id: 'futsal', name: 'Giải Futsal VĐQG', type: '5' },
    { id: 'amateur', name: 'Giải Hạng Nhì', type: '11' },
    { id: 'youth', name: 'Giải U21', type: '11' },
    { id: 'local7', name: 'Giải 7 người HN', type: '7' },
    { id: 'local5', name: 'Giải 5 người TP.HCM', type: '5' }
  ];

  const teams = [
    { id: 'hcm', name: 'CLB TP. Hồ Chí Minh', tournament: 'vleague', type: '11', logo: '🔴' },
    { id: 'hanoi', name: 'CLB Hà Nội', tournament: 'vleague', type: '11', logo: '🟣' },
    { id: 'hagl', name: 'Hoàng Anh Gia Lai', tournament: 'vleague', type: '11', logo: '🟡' },
    { id: 'slna', name: 'Sông Lam Nghệ An', tournament: 'vleague', type: '11', logo: '🟠' },
    { id: 'viettel', name: 'CLB Viettel', tournament: 'vleague', type: '11', logo: '🔵' },
    { id: 'becamex', name: 'Becamex Bình Dương', tournament: 'vleague', type: '11', logo: '⚪' },
    { id: 'thanhhoa', name: 'CLB Thanh Hóa', tournament: 'vleague2', type: '11', logo: '🟢' },
    { id: 'binhdinh', name: 'CLB Bình Định', tournament: 'vleague2', type: '11', logo: '🟤' },
    { id: 'futsal1', name: 'Thái Sơn Nam', tournament: 'futsal', type: '5', logo: '🔷' },
    { id: 'futsal2', name: 'Thái Sơn Bắc', tournament: 'futsal', type: '5', logo: '🔶' },
    { id: 'local1', name: 'Đội A Hà Nội', tournament: 'local7', type: '7', logo: '⭐' },
    { id: 'local2', name: 'Đội B Hà Nội', tournament: 'local7', type: '7', logo: '🌟' }
  ];

  const fieldTypes = [
    { value: '5', label: 'Sân 5 người', icon: '⚽' },
    { value: '7', label: 'Sân 7 người', icon: '🥅' },
    { value: '11', label: 'Sân 11 người', icon: '🏟️' }
  ];

  const venues = [
    'Sân Mỹ Đình',
    'Sân Thống Nhất',
    'Sân Hàng Đẫy',
    'Sân Pleiku',
    'Sân Vinh',
    'Sân Lạch Tray',
    'Sân Gò Đậu'
  ];

  const referees = [
    'Trọng Thư',
    'Văn Kiên',
    'Hoài Nam',
    'Xuân Trường',
    'Minh Trí'
  ];

  const filteredTeams = teams.filter(team => {
    const matchesTournament = !filters.tournament || team.tournament === filters.tournament;
    const matchesFieldType = !filters.fieldType || team.type === filters.fieldType;
    const matchesSearch = !filters.searchTerm || 
      team.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesTournament && matchesFieldType && matchesSearch;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDragStart = (e, team) => {
    e.dataTransfer.setData('application/json', JSON.stringify(team));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, position) => {
    e.preventDefault();
    const team = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (position === 'team1' && formData.team2?.id !== team.id) {
      setFormData(prev => ({ ...prev, team1: team }));
    } else if (position === 'team2' && formData.team1?.id !== team.id) {
      setFormData(prev => ({ ...prev, team2: team }));
    }
  };

  const removeTeam = (position) => {
    setFormData(prev => ({ ...prev, [position]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating match:', formData);
  };

  const resetForm = () => {
    setFormData({
      matchName: '',
      tournament: '',
      fieldType: '11',
      team1: null,
      team2: null,
      date: '',
      time: '',
      venue: '',
      referee: '',
      description: '',
      isPublic: true,
      streamUrl: '',
      round: ''
    });
  };

return (
  <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
      {/* Header */}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sidebar - Team Selection */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="text-base sm:text-lg">Filter Team</span>
            </h3>

            {/* Filters */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Giải đấu
                </label>
                <select
                  name="tournament"
                  value={filters.tournament}
                  onChange={handleFilterChange}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Event</option>
                  {tournaments.map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Sport Type
                </label>
                <select
                  name="fieldType"
                  value={filters.fieldType}
                  onChange={handleFilterChange}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All stadium</option>
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên đội..."
                  />
                </div>
              </div>
            </div>

            {/* Teams List */}
            <div className="space-y-2 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">
                Team list ({filteredTeams.length})
              </h4>
              {filteredTeams.map(team => (
                <div
                  key={team.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, team)}
                  className="p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 touch-manipulation"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl md:text-2xl">{team.logo}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-800 text-xs sm:text-sm truncate">{team.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {tournaments.find(t => t.id === team.tournament)?.name} • {team.type} người
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <span className="text-base sm:text-lg">Thông tin trận đấu</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Tên trận đấu *
                  </label>
                  <input
                    type="text"
                    name="matchName"
                    value={formData.matchName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="VD: Chung kết V.League 2024"
                    required
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Vòng đấu
                  </label>
                  <input
                    type="text"
                    name="round"
                    value={formData.round}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="VD: Vòng 26, Bán kết, Chung kết..."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Giải đấu *
                  </label>
                  <select
                    name="tournament"
                    value={formData.tournament}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Chọn giải đấu</option>
                    {tournaments.map(tournament => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Loại sân *
                  </label>
                  <select
                    name="fieldType"
                    value={formData.fieldType}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Teams Drag & Drop */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <span className="text-base sm:text-lg">Đội thi đấu - Kéo thả để chọn</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Team 1 */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'team1')}
                  className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 min-h-24 sm:min-h-32 flex items-center justify-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 touch-manipulation"
                >
                  {formData.team1 ? (
                    <div className="text-center w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl sm:text-3xl">{formData.team1.logo}</span>
                        <button
                          onClick={() => removeTeam('team1')}
                          className="p-1 text-red-500 hover:bg-red-100 rounded touch-manipulation"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">{formData.team1.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Đội 1</div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                      <div className="font-medium text-sm sm:text-base">Kéo đội vào đây</div>
                      <div className="text-xs sm:text-sm">Đội 1</div>
                    </div>
                  )}
                </div>

                {/* Team 2 */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'team2')}
                  className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 min-h-24 sm:min-h-32 flex items-center justify-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 touch-manipulation"
                >
                  {formData.team2 ? (
                    <div className="text-center w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl sm:text-3xl">{formData.team2.logo}</span>
                        <button
                          onClick={() => removeTeam('team2')}
                          className="p-1 text-red-500 hover:bg-red-100 rounded touch-manipulation"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">{formData.team2.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Đội 2</div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                      <div className="font-medium text-sm sm:text-base">Kéa đội vào đây</div>
                      <div className="text-xs sm:text-sm">Đội 2</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule & Venue */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <span className="text-base sm:text-lg">Lịch thi đấu & Địa điểm</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Ngày thi đấu *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Giờ thi đấu *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Sân vận động
                  </label>
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Chọn sân</option>
                    {venues.map(venue => (
                      <option key={venue} value={venue}>
                        {venue}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Trọng tài
                  </label>
                  <select
                    name="referee"
                    value={formData.referee}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Chọn trọng tài</option>
                    {referees.map(referee => (
                      <option key={referee} value={referee}>
                        {referee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <span className="text-base sm:text-lg">Thông tin bổ sung</span>
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Link trực tiếp
                  </label>
                  <input
                    type="url"
                    name="streamUrl"
                    value={formData.streamUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://youtube.com/live/..."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Mô tả trận đấu
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="Thông tin chi tiết về trận đấu..."
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="isPublic"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 bg-gray-50 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-0.5"
                  />
                  <label htmlFor="isPublic" className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700 font-medium leading-tight">
                    Công khai trận đấu cho người xem
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.team1 || !formData.team2 || !formData.matchName || !formData.date || !formData.time}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base touch-manipulation"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Tạo trận đấu
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 transform hover:-translate-y-0.5 text-sm sm:text-base touch-manipulation"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default NewMatch;