import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Settings, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { message } from 'antd';
import { matchScheduleApi } from '../../../api';
import { teamApi } from '../../../api';
import { eventApi } from '../../../api';

const CreateScheduleModal = ({ isOpen, onClose, onSuccess, eventId: initialEventId }) => {
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || '');
  const [selectedTeams, setSelectedTeams] = useState([]);
  
  const [formData, setFormData] = useState({
    startTime: '14:00',
    endTime: '18:00',
    matchDuration: 90,
    breakTime: 30,
    maxMatchesPerDay: 4
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
      if (initialEventId) {
        setSelectedEventId(initialEventId);
        fetchTeams();
      }
    }
  }, [isOpen, initialEventId]);

  useEffect(() => {
    if (selectedEventId) {
      fetchTeams();
      calculatePreview();
    }
  }, [selectedEventId, selectedTeams, formData]);

  const fetchEvents = async () => {
    try {
      const response = await eventApi.getAllEvents();
      const eventList = response.data?.data || [];
      setEvents(eventList);
    } catch (error) {
      message.error('Unable to load event list');
    }
  };

  const fetchTeams = async () => {
    if (!selectedEventId) {
      setTeams([]);
      return;
    }
    
    setLoadingTeams(true);
    try {
      // Lấy teams đã đăng ký và được approve cho event này
      const resourcesResponse = await matchScheduleApi.getScheduleResources(selectedEventId);
      const eventTeams = resourcesResponse.data?.data?.teams || [];
      setTeams(eventTeams);
      
      if (eventTeams.length === 0) {
        message.warning('No teams have been approved for this event yet. Please approve registered teams before creating a match schedule.');
      }
    } catch (error) {
      message.error('Unable to load approved teams list');
      console.error('Error fetching approved teams:', error);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const calculatePreview = () => {
    if (selectedTeams.length < 2) {
      setPreview(null);
      return;
    }

    const totalMatches = (selectedTeams.length * (selectedTeams.length - 1)) / 2;
    const totalRounds = selectedTeams.length % 2 === 0 
      ? selectedTeams.length - 1 
      : selectedTeams.length;
    
    // Tính số ngày cần thiết
    const matchesPerRound = Math.floor(selectedTeams.length / 2);
    const daysNeeded = Math.ceil(totalRounds / (formData.maxMatchesPerDay / matchesPerRound));

    setPreview({
      totalTeams: selectedTeams.length,
      totalMatches,
      totalRounds,
      daysNeeded,
      matchesPerDay: Math.min(formData.maxMatchesPerDay, matchesPerRound)
    });
  };

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    setSelectedTeams([]);
    setPreview(null);
  };

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  };

  const handleSelectAllTeams = () => {
    if (selectedTeams.length === teams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(teams.map(team => team._id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'matchDuration' || name === 'breakTime' || name === 'maxMatchesPerDay'
        ? parseInt(value) || 0
        : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!selectedEventId) {
      newErrors.eventId = 'Vui lòng chọn event';
    }
    if (selectedTeams.length < 2) {
      newErrors.teams = 'At least 2 teams are required to create a match schedule';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Vui lòng chọn giờ bắt đầu';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Vui lòng chọn giờ kết thúc';
    }
    if (formData.matchDuration < 30 || formData.matchDuration > 180) {
      newErrors.matchDuration = 'Thời gian thi đấu phải từ 30 đến 180 phút';
    }
    if (formData.maxMatchesPerDay < 1) {
      newErrors.maxMatchesPerDay = 'Số trận mỗi ngày phải lớn hơn 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const scheduleData = {
        teamIds: selectedTeams,
        startTime: formData.startTime,
        endTime: formData.endTime,
        matchDuration: formData.matchDuration,
        breakTime: formData.breakTime,
        maxMatchesPerDay: formData.maxMatchesPerDay
      };

      const response = await matchScheduleApi.createRoundRobinSchedule(selectedEventId, scheduleData);
      
      message.success('Match schedule created successfully!');
      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to create match schedule';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Create Automatic Match Schedule
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chọn Event <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.eventId ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              <option value="">-- Chọn event --</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.name || event.title}
                </option>
              ))}
            </select>
            {errors.eventId && (
              <p className="mt-1 text-sm text-red-400">{errors.eventId}</p>
            )}
            {selectedEvent && (
              <p className="mt-2 text-sm text-gray-400">
                {selectedEvent.name || selectedEvent.title} • 
                Tối đa {selectedEvent.maxTeams || 'N/A'} đội
              </p>
            )}
          </div>

          {/* Teams Selection */}
          {selectedEventId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Chọn các đội tham gia <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllTeams}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  {selectedTeams.length === teams.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
              
              {loadingTeams ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  {teams.map(team => (
                    <label
                      key={team._id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTeams.includes(team._id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team._id)}
                        onChange={() => handleTeamToggle(team._id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm truncate">
                        {team.name || team.shortName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              
              {errors.teams && (
                <p className="mt-1 text-sm text-red-400">{errors.teams}</p>
              )}
              
              {selectedTeams.length > 0 && (
                <p className="mt-2 text-sm text-gray-400">
                  Đã chọn {selectedTeams.length} đội
                </p>
              )}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                Match Schedule Preview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Number of Teams</div>
                  <div className="text-xl font-bold text-white">{preview.totalTeams}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Matches</div>
                  <div className="text-xl font-bold text-white">{preview.totalMatches}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Number of Rounds</div>
                  <div className="text-xl font-bold text-white">{preview.totalRounds}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Estimated Days</div>
                  <div className="text-xl font-bold text-white">{preview.daysNeeded}</div>
                </div>
              </div>
            </div>
          )}

          {/* Time Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Giờ bắt đầu <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-400">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Giờ kết thúc <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.endTime ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-400">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Match Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Settings className="w-4 h-4 inline mr-2" />
                Thời gian thi đấu (phút)
              </label>
              <input
                type="number"
                name="matchDuration"
                value={formData.matchDuration}
                onChange={handleChange}
                min="30"
                max="180"
                step="15"
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.matchDuration ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.matchDuration && (
                <p className="mt-1 text-sm text-red-400">{errors.matchDuration}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Settings className="w-4 h-4 inline mr-2" />
                Thời gian nghỉ (phút)
              </label>
              <input
                type="number"
                name="breakTime"
                value={formData.breakTime}
                onChange={handleChange}
                min="0"
                max="60"
                step="5"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Settings className="w-4 h-4 inline mr-2" />
                Số trận/ngày tối đa
              </label>
              <input
                type="number"
                name="maxMatchesPerDay"
                value={formData.maxMatchesPerDay}
                onChange={handleChange}
                min="1"
                max="10"
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.maxMatchesPerDay ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.maxMatchesPerDay && (
                <p className="mt-1 text-sm text-red-400">{errors.maxMatchesPerDay}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Create Match Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScheduleModal;

