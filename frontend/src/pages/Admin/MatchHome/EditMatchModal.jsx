import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Save, Trophy, Settings, Globe } from 'lucide-react';
import { eventApi } from '../../../api';

const EditMatchModal = ({ isOpen, onClose, onSubmit, match, resources }) => {
  const [formData, setFormData] = useState({
    matchName: '',
    eventId: '',
    team1Id: '',
    team2Id: '',
    fieldId: '',
    matchDate: '',
    matchTime: '',
    round: '',
    matchNumber: 1,
    duration: 90,
    address: '',
    location: '',
    description: '',
    streamUrl: '',
    isPublic: true,
    status: 'upcoming',
    score: { team1: 0, team2: 0 }
  });

  const [errors, setErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getAllEvents();
        const eventList = response.data?.data || [];
        setEvents(eventList);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && match) {
      // Format date for input
      const matchDate = match.matchDate 
        ? new Date(match.matchDate).toISOString().split('T')[0]
        : '';
      
      const eventId = match.eventId?._id || match.eventId || '';
      const event = events.find(e => e._id === eventId);
      
      setFormData({
        matchName: match.matchName || '',
        eventId: eventId,
        team1Id: match.team1Id?._id || match.team1Id || '',
        team2Id: match.team2Id?._id || match.team2Id || '',
        fieldId: match.fieldId?._id || match.fieldId || '',
        matchDate: matchDate,
        matchTime: match.matchTime || '',
        round: match.round || '',
        matchNumber: match.matchNumber || 1,
        duration: match.duration || 90,
        address: match.address || '',
        location: match.location || '',
        description: match.description || '',
        streamUrl: match.streamUrl || '',
        isPublic: match.isPublic !== undefined ? match.isPublic : true,
        status: match.status || 'upcoming',
        score: match.score || { team1: 0, team2: 0 }
      });
      
      setSelectedEvent(event || null);
      setErrors({});
    }
  }, [isOpen, match, events]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.eventId) {
      newErrors.eventId = 'Please select a tournament';
    }
    if (!formData.team1Id) {
      newErrors.team1Id = 'Please select team 1';
    }
    if (!formData.team2Id) {
      newErrors.team2Id = 'Please select team 2';
    }
    if (formData.team1Id === formData.team2Id) {
      newErrors.team2Id = 'The two teams cannot be the same';
    }
    if (!formData.matchDate) {
      newErrors.matchDate = 'Please select match date';
    }
    if (!formData.matchTime) {
      newErrors.matchTime = 'Please select match time';
    }
    if (!formData.round) {
      newErrors.round = 'Please enter round';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(match._id, formData);
    }
  };

  if (!isOpen || !match) return null;

  // Get available rounds
  const existingRounds = resources.existingRounds || [];
  const defaultRounds = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'];
  const allRounds = [...new Set([...existingRounds, ...defaultRounds, formData.round])].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Edit Match
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Match Name and Event */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Settings className="w-4 h-4 inline mr-2" />
                Match Name
              </label>
              <input
                type="text"
                name="matchName"
                value={formData.matchName}
                onChange={handleChange}
                placeholder="e.g., V.League 2024 Final"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament <span className="text-red-500">*</span>
              </label>
              <select
                name="eventId"
                value={formData.eventId}
                onChange={(e) => {
                  handleChange(e);
                  const eventId = e.target.value;
                  const event = events.find(ev => ev._id === eventId);
                  setSelectedEvent(event || null);
                }}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.eventId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Select Tournament --</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.name || event.title}
                  </option>
                ))}
              </select>
              {errors.eventId && (
                <p className="mt-1 text-sm text-red-400">{errors.eventId}</p>
              )}
            </div>
          </div>

          {/* Field Type Info */}
          {selectedEvent && selectedEvent.sportTypeId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-800">Field Type:</span>
                <span className="text-sm text-blue-700">
                  {typeof selectedEvent.sportTypeId === 'object' 
                    ? selectedEvent.sportTypeId.name 
                    : 'No information'}
                </span>
              </div>
            </div>
          )}

          {/* Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team 1 <span className="text-red-500">*</span>
              </label>
              <select
                name="team1Id"
                value={formData.team1Id}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.team1Id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Select Team 1 --</option>
                {resources.teams?.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name || team.shortName}
                  </option>
                ))}
              </select>
              {errors.team1Id && (
                <p className="mt-1 text-sm text-red-400">{errors.team1Id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team 2 <span className="text-red-500">*</span>
              </label>
              <select
                name="team2Id"
                value={formData.team2Id}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.team2Id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Select Team 2 --</option>
                {resources.teams?.filter(team => team._id !== formData.team1Id).map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name || team.shortName}
                  </option>
                ))}
              </select>
              {errors.team2Id && (
                <p className="mt-1 text-sm text-red-400">{errors.team2Id}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Match Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="matchDate"
                value={formData.matchDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.matchDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.matchDate && (
                <p className="mt-1 text-sm text-red-400">{errors.matchDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Match Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="matchTime"
                value={formData.matchTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.matchTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.matchTime && (
                <p className="mt-1 text-sm text-red-400">{errors.matchTime}</p>
              )}
            </div>
          </div>

          {/* Round, Match Number, and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Round <span className="text-red-500">*</span>
              </label>
              <select
                name="round"
                value={formData.round}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.round ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {allRounds.map(round => (
                  <option key={round} value={round}>
                    {round}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="round"
                value={formData.round}
                onChange={handleChange}
                placeholder="Or enter a new round"
                className="mt-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.round && (
                <p className="mt-1 text-sm text-red-400">{errors.round}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Number
              </label>
              <input
                type="number"
                name="matchNumber"
                value={formData.matchNumber}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Match Field
            </label>
            <select
              name="fieldId"
              value={formData.fieldId}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select Field (Optional) --</option>
              {resources.fields?.map(field => (
                <option key={field._id} value={field._id}>
                  {field.name} - {field.address}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Match Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="30"
              max="180"
              step="15"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Score - Only show if status is completed or being set to completed */}
          {(formData.status === 'completed' || match?.status === 'completed') && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <Trophy className="w-4 h-4 inline mr-2 text-yellow-500" />
                Match Score
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    {match?.team1Id?.name || match?.team1Id?.shortName || 'Team 1'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.score?.team1 || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData(prev => ({
                        ...prev,
                        score: { ...prev.score, team1: value }
                      }));
                    }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    {match?.team2Id?.name || match?.team2Id?.shortName || 'Team 2'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.score?.team2 || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData(prev => ({
                        ...prev,
                        score: { ...prev.score, team2: value }
                      }));
                    }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl font-bold"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: Updating score will automatically update the ranking table.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed information about the match..."
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Stream URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Live Stream URL
            </label>
            <input
              type="url"
              name="streamUrl"
              value={formData.streamUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/live/..."
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Public Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  isPublic: e.target.checked
                }));
              }}
              className="w-4 h-4 text-green-600 bg-gray-50 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-0.5"
            />
            <label htmlFor="isPublic" className="ml-3 text-sm text-gray-700 font-medium leading-tight">
              Make match public for viewers
            </label>
          </div>

          {/* Address and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Match address"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Detailed location"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMatchModal;

