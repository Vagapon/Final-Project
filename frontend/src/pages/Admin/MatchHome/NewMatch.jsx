import React, { useState, useEffect } from 'react';
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
  User,
  Loader2
} from 'lucide-react';
import { message } from 'antd';
import { matchScheduleApi } from '../../../api';
import { eventApi } from '../../../api';
import { teamApi } from '../../../api';
import { fieldApi } from '../../../api';

const NewMatch = () => {
  const [formData, setFormData] = useState({
    matchName: '',
    eventId: '',
    fieldType: '11',
    team1: null,
    team2: null,
    date: '',
    time: '',
    fieldId: '',
    description: '',
    isPublic: true,
    streamUrl: '',
    round: ''
  });

  const [filters, setFilters] = useState({
    eventId: '',
    searchTerm: ''
  });

  // Data from API
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fieldTypes = [
    { value: '5', label: 'Sân 5 người', icon: '⚽' },
    { value: '7', label: 'Sân 7 người', icon: '🥅' },
    { value: '11', label: 'Sân 11 người', icon: '🏟️' }
  ];

  // Fetch data from API
  useEffect(() => {
    fetchEvents();
    fetchFields();
  }, []);

  useEffect(() => {
    if (formData.eventId) {
      fetchTeamsForEvent(formData.eventId);
      // Đồng bộ filter với formData
      setFilters(prev => ({ ...prev, eventId: formData.eventId }));
      // Tìm và lưu event đã chọn
      const event = events.find(ev => ev._id === formData.eventId);
      setSelectedEvent(event || null);
    } else {
      // Nếu không chọn event, không hiển thị teams (vì cần event để biết teams nào được approve)
      setTeams([]);
      setSelectedEvent(null);
    }
  }, [formData.eventId, events]);

  const fetchEvents = async () => {
    try {
      const response = await eventApi.getAllEvents();
      const eventList = response.data?.data || [];
      setEvents(eventList);
    } catch (error) {
      message.error('Không thể tải danh sách event');
      console.error('Error fetching events:', error);
    }
  };

  const fetchTeamsForEvent = async (eventId) => {
    if (!eventId) {
      setTeams([]);
      return;
    }
    
    setLoadingTeams(true);
    try {
      // Lấy teams đã đăng ký và được approve cho event này
      const response = await matchScheduleApi.getScheduleResources(eventId);
      const eventTeams = response.data?.data?.teams || [];
      setTeams(eventTeams);
      
      if (eventTeams.length === 0) {
        message.warning('Chưa có đội nào được approve cho event này');
      }
    } catch (error) {
      message.error('Không thể tải danh sách đội đã được approve');
      console.error('Error fetching approved teams:', error);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fieldApi.getAllFields();
      const fieldList = response.data?.data || response.data || [];
      setFields(fieldList);
    } catch (error) {
      console.error('Error fetching fields:', error);
      setFields([]);
    }
  };


  const filteredTeams = teams.filter(team => {
    // Teams đã được lọc theo event rồi (chỉ lấy teams đã approve cho event đó)
    // Chỉ cần filter theo search term
    const matchesSearch = !filters.searchTerm || 
      (team.name && team.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (team.shortName && team.shortName.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    return matchesSearch;
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
    
    // Nếu filter eventId thay đổi, cập nhật formData và fetch teams
    if (name === 'eventId') {
      setFormData(prev => ({ ...prev, eventId: value }));
      if (value) {
        fetchTeamsForEvent(value);
      } else {
        setTeams([]);
      }
    }
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
    const teamId = team._id || team.id;
    
    if (position === 'team1') {
      const team2Id = formData.team2?._id || formData.team2?.id;
      if (team2Id !== teamId) {
        setFormData(prev => ({ ...prev, team1: team }));
      } else {
        message.warning('Hai đội không được giống nhau');
      }
    } else if (position === 'team2') {
      const team1Id = formData.team1?._id || formData.team1?.id;
      if (team1Id !== teamId) {
        setFormData(prev => ({ ...prev, team2: team }));
      } else {
        message.warning('Hai đội không được giống nhau');
      }
    }
  };

  const removeTeam = (position) => {
    setFormData(prev => ({ ...prev, [position]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.team1 || !formData.team2) {
      message.error('Vui lòng chọn cả hai đội thi đấu');
      return;
    }
    
    if (!formData.eventId) {
      message.error('Vui lòng chọn giải đấu');
      return;
    }
    
    if (!formData.date || !formData.time) {
      message.error('Vui lòng chọn ngày và giờ thi đấu');
      return;
    }
    
    setLoading(true);
    try {
      const selectedField = fields.find(f => f._id === formData.fieldId);
      const matchData = {
        team1Id: formData.team1._id || formData.team1.id,
        team2Id: formData.team2._id || formData.team2.id,
        fieldId: formData.fieldId || null,
        matchDate: formData.date,
        matchTime: formData.time,
        round: formData.round || 'Round 1',
        matchNumber: 1,
        duration: 90,
        address: selectedField?.address || '',
        location: selectedField?.location || selectedField?.address || ''
      };
      
      await matchScheduleApi.createSingleMatch(formData.eventId, matchData);
      message.success('Tạo trận đấu thành công!');
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể tạo trận đấu';
      message.error(errorMessage);
      console.error('Error creating match:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      matchName: '',
      eventId: '',
      fieldType: '11',
      team1: null,
      team2: null,
      date: '',
      time: '',
      fieldId: '',
      description: '',
      isPublic: true,
      streamUrl: '',
      round: ''
    });
    setFilters({
      eventId: '',
      searchTerm: ''
    });
    setSelectedEvent(null);
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
                  name="eventId"
                  value={filters.eventId}
                  onChange={handleFilterChange}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Event</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.name || event.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Removed Sport Type filter - teams không có fieldType, chỉ filter theo event */}

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
                {formData.eventId && (
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Đã được approve)
                  </span>
                )}
              </h4>
              {!formData.eventId ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p className="mb-2">Vui lòng chọn giải đấu</p>
                  <p className="text-xs text-gray-400">Chỉ hiển thị các đội đã được approve</p>
                </div>
              ) : loadingTeams ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p className="mb-2">Chưa có đội nào được approve</p>
                  <p className="text-xs text-gray-400">Vui lòng approve các đội đăng ký trước</p>
                </div>
              ) : (
                filteredTeams.map(team => (
                  <div
                    key={team._id || team.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, team)}
                    className="p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 touch-manipulation"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {team.avatar ? (
                        <img 
                          src={team.avatar} 
                          alt={team.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {(team.name || team.shortName || 'T').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                          {team.name || team.shortName}
                        </div>
                        {team.shortName && team.name && (
                          <div className="text-xs text-gray-500 truncate">
                            {team.shortName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
                    name="eventId"
                    value={formData.eventId}
                    onChange={(e) => {
                      handleInputChange(e);
                      const eventId = e.target.value;
                      setFilters(prev => ({ ...prev, eventId }));
                      
                      // Tìm và lưu event đã chọn
                      const event = events.find(ev => ev._id === eventId);
                      setSelectedEvent(event || null);
                      
                      // Nếu có event và sportTypeId, cập nhật fieldType từ sportTypeId.name
                      if (event && event.sportTypeId) {
                        const sportTypeName = typeof event.sportTypeId === 'object' 
                          ? event.sportTypeId.name 
                          : '';
                        // Tìm số trong tên (ví dụ: "Football 5", "Football 7", "Football 11")
                        const match = sportTypeName.match(/\d+/);
                        if (match) {
                          setFormData(prev => ({ ...prev, fieldType: match[0] }));
                        }
                      }
                      
                      // Fetch teams khi chọn event
                      if (eventId) {
                        fetchTeamsForEvent(eventId);
                      } else {
                        setTeams([]);
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Chọn giải đấu</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>
                        {event.name || event.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Loại sân *
                  </label>
                  {selectedEvent && selectedEvent.sportTypeId ? (
                    <div className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800">
                      {typeof selectedEvent.sportTypeId === 'object' 
                        ? selectedEvent.sportTypeId.name 
                        : 'Chưa có thông tin'}
                    </div>
                  ) : (
                    <div className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 border border-gray-300 rounded-lg sm:rounded-xl text-gray-500 italic">
                      Vui lòng chọn giải đấu
                    </div>
                  )}
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
                        {formData.team1.avatar ? (
                          <img 
                            src={formData.team1.avatar} 
                            alt={formData.team1.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                            {(formData.team1.name || formData.team1.shortName || 'T').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <button
                          onClick={() => removeTeam('team1')}
                          className="p-1 text-red-500 hover:bg-red-100 rounded touch-manipulation"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {formData.team1.name || formData.team1.shortName}
                      </div>
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
                        {formData.team2.avatar ? (
                          <img 
                            src={formData.team2.avatar} 
                            alt={formData.team2.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                            {(formData.team2.name || formData.team2.shortName || 'T').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <button
                          onClick={() => removeTeam('team2')}
                          className="p-1 text-red-500 hover:bg-red-100 rounded touch-manipulation"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {formData.team2.name || formData.team2.shortName}
                      </div>
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

            {/* Schedule, Venue & Additional Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <span className="text-base sm:text-lg">Lịch thi đấu, Địa điểm & Thông tin bổ sung</span>
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Event Time Range Info */}
                {selectedEvent && selectedEvent.startDate && selectedEvent.endDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs sm:text-sm font-semibold text-blue-800">
                        Thời gian giải đấu:
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-700 ml-6">
                      {new Date(selectedEvent.startDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })} - {new Date(selectedEvent.endDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

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
                      min={selectedEvent?.startDate ? new Date(selectedEvent.startDate).toISOString().split('T')[0] : ''}
                      max={selectedEvent?.endDate ? new Date(selectedEvent.endDate).toISOString().split('T')[0] : ''}
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
                      name="fieldId"
                      value={formData.fieldId}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Chọn sân</option>
                      {fields.map(field => (
                        <option key={field._id} value={field._id}>
                          {field.name} {field.address ? `- ${field.address}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Link trực tiếp
                    </label>
                    <input
                      type="url"
                      name="streamUrl"
                      value={formData.streamUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="https://youtube.com/live/..."
                    />
                  </div>
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
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
                disabled={loading || !formData.team1 || !formData.team2 || !formData.eventId || !formData.date || !formData.time}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base touch-manipulation"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    Tạo trận đấu
                  </>
                )}
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