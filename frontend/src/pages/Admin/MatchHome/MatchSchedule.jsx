import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  Plus,
  Loader2,
  Trophy
} from 'lucide-react';
import { message, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { matchScheduleApi } from '../../../api';
import { eventApi } from '../../../api';
import EditMatchModal from './EditMatchModal';

const MatchSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRound, setFilterRound] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Event và Match data
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [matches, setMatches] = useState([]);
  const [resources, setResources] = useState({ teams: [], fields: [], existingRounds: [] });
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const statusConfig = {
    upcoming: { 
      label: 'Chưa diễn ra', 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-500',
      borderColor: 'border-blue-200'
    },
    ongoing: { 
      label: 'Đang diễn ra', 
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500',
      borderColor: 'border-red-200'
    },
    completed: { 
      label: 'Đã kết thúc', 
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      dotColor: 'bg-green-500',
      borderColor: 'border-green-200'
    },
    cancelled: { 
      label: 'Đã hủy', 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      dotColor: 'bg-gray-500',
      borderColor: 'border-gray-200'
    }
  };

  const filterShortcuts = [
    { value: 'all', label: 'Tất cả' },
    { value: 'upcoming', label: 'Sắp diễn ra' },
    { value: 'ongoing', label: 'Đang diễn ra' },
    { value: 'completed', label: 'Đã kết thúc' }
  ];

  // Hàm tính toán trạng thái dựa trên thời gian
  const calculateMatchStatus = (match) => {
    // Nếu đã bị hủy, giữ nguyên
    if (match.status === 'cancelled') {
      return 'cancelled';
    }

    if (!match.matchDate) {
      return match.status || 'upcoming';
    }

    const now = new Date();
    const matchDate = new Date(match.matchDate);
    
    // Nếu có matchTime, kết hợp với matchDate
    let matchStartTime = new Date(matchDate);
    if (match.matchTime) {
      const [hours, minutes] = match.matchTime.split(':').map(Number);
      matchStartTime.setHours(hours || 0, minutes || 0, 0, 0);
    }

    // Tính thời gian kết thúc (matchStartTime + duration)
    const duration = match.duration || 90; // Mặc định 90 phút
    const matchEndTime = new Date(matchStartTime.getTime() + duration * 60 * 1000);

    // So sánh với thời gian hiện tại
    if (now < matchStartTime) {
      return 'upcoming'; // Chưa đến giờ bắt đầu
    } else if (now >= matchStartTime && now < matchEndTime) {
      return 'ongoing'; // Đang diễn ra
    } else {
      return 'completed'; // Đã kết thúc
    }
  };

  // Hàm cập nhật trạng thái cho tất cả các trận đấu
  const updateMatchesStatus = useCallback(async () => {
    if (!selectedEventId || matches.length === 0) return;

    const matchesToUpdate = [];
    
    matches.forEach(match => {
      const calculatedStatus = calculateMatchStatus(match);
      // Chỉ cập nhật nếu trạng thái thay đổi và không phải cancelled
      if (calculatedStatus !== match.status && match.status !== 'cancelled') {
        matchesToUpdate.push({
          matchId: match._id,
          newStatus: calculatedStatus
        });
      }
    });

    // Cập nhật tất cả các trận đấu cần thay đổi
    if (matchesToUpdate.length > 0) {
      try {
        await Promise.all(
          matchesToUpdate.map(({ matchId, newStatus }) =>
            matchScheduleApi.updateSingleMatch(matchId, { status: newStatus })
          )
        );
        // Sau khi cập nhật, fetch lại danh sách bằng cách gọi trực tiếp
        // Không dùng fetchMatches để tránh circular dependency
        setLoading(true);
        try {
          const params = {};
          if (filterStatus !== 'all') params.status = filterStatus;
          if (filterRound !== 'all') params.round = filterRound;
          
          const response = await matchScheduleApi.getEventMatches(selectedEventId, params);
          const matchesData = response.data?.data?.allMatches || [];
          setMatches(matchesData);
        } catch (error) {
          message.error('Không thể tải danh sách trận đấu');
          console.error('Error fetching matches:', error);
          setMatches([]);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error updating match statuses:', error);
      }
    }
  }, [selectedEventId, matches, filterStatus, filterRound]);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const response = await eventApi.getAllEvents();
      const eventList = response.data?.data || [];
      setEvents(eventList);
      if (eventList.length > 0 && !selectedEventId) {
        setSelectedEventId(eventList[0]._id);
      }
    } catch (error) {
      message.error('Không thể tải danh sách event');
      console.error('Error fetching events:', error);
    }
  };

  const fetchMatches = useCallback(async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterRound !== 'all') params.round = filterRound;
      
      const response = await matchScheduleApi.getEventMatches(selectedEventId, params);
      const matchesData = response.data?.data?.allMatches || [];
      setMatches(matchesData);
    } catch (error) {
      message.error('Không thể tải danh sách trận đấu');
      console.error('Error fetching matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, filterStatus, filterRound]);

  const fetchResources = async () => {
    if (!selectedEventId) return;
    
    try {
      const response = await matchScheduleApi.getScheduleResources(selectedEventId);
      const data = response.data?.data || {};
      setResources({
        teams: data.teams || [],
        fields: data.fields || [],
        existingRounds: data.existingRounds || []
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch matches when event is selected
  useEffect(() => {
    if (selectedEventId) {
      fetchMatches();
      fetchResources();
    } else {
      setMatches([]);
    }
  }, [selectedEventId, fetchMatches]);

  // Tự động cập nhật trạng thái trận đấu mỗi phút
  useEffect(() => {
    if (!selectedEventId || matches.length === 0) return;

    // Cập nhật ngay lập tức (sau một chút delay để tránh conflict)
    const timeoutId = setTimeout(() => {
      updateMatchesStatus();
    }, 2000); // Đợi 2 giây sau khi matches được load

    // Thiết lập interval để cập nhật mỗi phút
    const interval = setInterval(() => {
      updateMatchesStatus();
    }, 60000); // 60 giây = 1 phút

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [selectedEventId, matches.length, updateMatchesStatus]);

  const filteredMatches = matches.filter(match => {
    const team1Name = match.team1Id?.name || '';
    const team2Name = match.team2Id?.name || '';
    const matchName = `${team1Name} vs ${team2Name}`;
    
    const matchesSearch = matchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team1Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team2Name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Sử dụng trạng thái đã tính toán để filter
    const calculatedStatus = calculateMatchStatus(match);
    const matchesStatus = filterStatus === 'all' || calculatedStatus === filterStatus;
    const matchesRound = filterRound === 'all' || match.round === filterRound;
    
    return matchesSearch && matchesStatus && matchesRound;
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
      setSelectedMatches(filteredMatches.map(match => match._id));
    }
  };


  const handleEditMatch = (match) => {
    setSelectedMatch(match);
    setShowEditModal(true);
  };

  const handleUpdateMatch = async (matchId, matchData) => {
    try {
      await matchScheduleApi.updateSingleMatch(matchId, matchData);
      message.success('Cập nhật trận đấu thành công!');
      setShowEditModal(false);
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật trận đấu';
      message.error(errorMessage);
    }
  };

  const handleDeleteMatch = (matchId) => {
    Modal.confirm({
      title: 'Xóa trận đấu',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc chắn muốn xóa trận đấu này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await matchScheduleApi.deleteSingleMatch(matchId);
          message.success('Xóa trận đấu thành công!');
          fetchMatches();
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Không thể xóa trận đấu';
          message.error(errorMessage);
        }
      }
    });
  };

  const handleUpdateStatus = async (matchId, newStatus) => {
    try {
      await matchScheduleApi.updateSingleMatch(matchId, { status: newStatus });
      message.success('Cập nhật trạng thái thành công!');
      fetchMatches();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái';
      message.error(errorMessage);
    }
  };

  const handleBulkDelete = () => {
    if (selectedMatches.length === 0) return;
    
    Modal.confirm({
      title: 'Xóa nhiều trận đấu',
      icon: <ExclamationCircleFilled />,
      content: `Bạn có chắc chắn muốn xóa ${selectedMatches.length} trận đấu đã chọn?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await Promise.all(selectedMatches.map(id => matchScheduleApi.deleteSingleMatch(id)));
          message.success(`Đã xóa ${selectedMatches.length} trận đấu!`);
          setSelectedMatches([]);
          fetchMatches();
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa trận đấu');
        }
      }
    });
  };

  const getActionButtons = (match) => {
    // Sử dụng trạng thái đã tính toán để hiển thị nút phù hợp
    const currentStatus = calculateMatchStatus(match);
    
    switch (currentStatus) {
      case 'upcoming':
        return (
          <>
            <button 
              onClick={() => handleEditMatch(match)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleUpdateStatus(match._id, 'ongoing')}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="Bắt đầu"
            >
              <Play className="w-4 h-4" />
            </button>
          </>
        );
      case 'ongoing':
        return (
          <>
            <button 
              onClick={() => handleUpdateStatus(match._id, 'completed')}
              className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              title="Kết thúc"
            >
              <Pause className="w-4 h-4" />
            </button>
          </>
        );
      case 'completed':
        return (
          <button 
            onClick={() => handleEditMatch(match)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
        );
      case 'cancelled':
        return (
          <button 
            onClick={() => handleEditMatch(match)}
            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
        );
      default:
        return null;
    }
  };

  const selectedEvent = events.find(e => e._id === selectedEventId);
  const rounds = [...new Set(matches.map(m => m.round))].sort();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              Quản lý trận đấu
            </h2>
            <p className="text-gray-600 text-sm">
              Quản lý và theo dõi tất cả các trận đấu trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:justify-end gap-3">
            <div className="relative w-full md:w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm trận đấu, đội..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full md:w-12 h-12 inline-flex items-center justify-center bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm ${
                showFilters ? 'ring-2 ring-blue-500' : ''
              }`}
              aria-label="Bộ lọc nâng cao"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filters */}
  

          {/* Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    <option value="">-- Chọn event --</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>
                        {event.name || event.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      fetchMatches();
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    <option value="all">Tất cả</option>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vòng đấu
                  </label>
                  <select
                    value={filterRound}
                    onChange={(e) => {
                      setFilterRound(e.target.value);
                      fetchMatches();
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    <option value="all">Tất cả</option>
                    {rounds.map(round => (
                      <option key={round} value={round}>
                        {round}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhanh
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterRound('all');
                        fetchMatches();
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchMatches()}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Bulk Actions */}
        {selectedMatches.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-800 font-semibold">
                  Đã chọn {selectedMatches.length} trận đấu
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Xóa đã chọn
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Matches Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedMatches.length === filteredMatches.length && filteredMatches.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div className="grid grid-cols-12 gap-4 flex-1 text-sm font-semibold text-gray-700">
                <div className="col-span-5 lg:col-span-4">Trận đấu</div>
                <div className="col-span-2 hidden lg:block">Vòng đấu</div>
                <div className="col-span-2">Thời gian</div>
                <div className="col-span-2 lg:col-span-2">Trạng thái</div>
                <div className="col-span-1">Thao tác</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredMatches.map((match) => {
              // Tính toán trạng thái dựa trên thời gian (chỉ để hiển thị, không cập nhật DB ngay)
              const displayStatus = calculateMatchStatus(match);
              const team1Name = match.team1Id?.name || match.team1Id?.shortName || 'N/A';
              const team2Name = match.team2Id?.name || match.team2Id?.shortName || 'N/A';
              const team1Avatar = match.team1Id?.avatar || match.team1Id?.logo;
              const team2Avatar = match.team2Id?.avatar || match.team2Id?.logo;
              const fieldName = match.fieldId?.name || 'Chưa chọn sân';
              
              return (
                <div
                  key={match._id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedMatches.includes(match._id)}
                      onChange={() => handleSelectMatch(match._id)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    
                    <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                      {/* Match with Teams */}
                      <div className="col-span-5 lg:col-span-4">
                        <div className="flex items-center gap-2">
                          {/* Team 1 */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {team1Avatar ? (
                              <img 
                                src={team1Avatar} 
                                alt={team1Name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.nextElementSibling;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-gray-200 bg-blue-500 ${team1Avatar ? 'hidden' : ''}`}
                            >
                              {(team1Name || 'T').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-900 font-semibold text-sm truncate">
                                {team1Name}
                              </div>
                            </div>
                          </div>

                          {/* VS */}
                          <div className="text-gray-400 text-xs font-medium px-1.5 flex-shrink-0">
                            vs
                          </div>

                          {/* Team 2 */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="min-w-0 flex-1 text-right">
                              <div className="text-gray-900 font-semibold text-sm truncate">
                                {team2Name}
                              </div>
                            </div>
                            {team2Avatar ? (
                              <img 
                                src={team2Avatar} 
                                alt={team2Name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.nextElementSibling;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-gray-200 bg-green-500 ${team2Avatar ? 'hidden' : ''}`}
                            >
                              {(team2Name || 'T').charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Round */}
                      <div className="col-span-2 hidden lg:block">
                        <span className="text-gray-700 text-sm font-medium">
                          {match.round}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="col-span-2">
                        <div className="text-gray-900 text-sm font-medium">
                          {match.matchDate ? new Date(match.matchDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {match.matchTime || 'N/A'}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 lg:col-span-2">
                        {statusConfig[displayStatus] && (
                          <div className="flex flex-col gap-2">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusConfig[displayStatus].bgColor} ${statusConfig[displayStatus].textColor} ${statusConfig[displayStatus].borderColor} w-fit`}>
                              <div className={`w-2 h-2 rounded-full ${statusConfig[displayStatus].dotColor}`}></div>
                              <span>{statusConfig[displayStatus].label}</span>
                            </div>
                            {match.score && (
                              <div className="text-xs text-gray-700 font-semibold bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block w-fit">
                                {match.score.team1} - {match.score.team2}
                              </div>
                            )}
                            {/* Hiển thị cảnh báo nếu trạng thái hiển thị khác với DB */}
                            {displayStatus !== match.status && match.status !== 'cancelled' && (
                              <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 inline-block w-fit" title="Trạng thái sẽ được cập nhật tự động">
                                ⚠ Đang cập nhật...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          {getActionButtons(match)}
                          <button 
                            onClick={() => handleDeleteMatch(match._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* Empty State */}
      {!loading && filteredMatches.length === 0 && selectedEventId && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <GamepadIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {matches.length === 0 ? 'Chưa có trận đấu nào' : 'Không tìm thấy trận đấu'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {matches.length === 0 
              ? 'Hãy tạo trận đấu mới từ trang "Tạo trận đấu" để bắt đầu quản lý các trận đấu cho event này' 
              : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm trận đấu bạn cần'}
          </p>
        </div>
      )}

      {/* No Event Selected */}
      {!selectedEventId && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Chưa chọn event
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Vui lòng chọn một event từ danh sách ở trên để bắt đầu quản lý trận đấu
          </p>
        </div>
      )}

      {/* Modals */}
      {showEditModal && selectedMatch && (
        <EditMatchModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMatch(null);
          }}
          onSubmit={handleUpdateMatch}
          match={selectedMatch}
          resources={resources}
        />
      )}
    </div>
  );
};

export default MatchSchedule;
