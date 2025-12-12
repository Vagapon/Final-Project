import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Save } from 'lucide-react';

const CreateMatchModal = ({ isOpen, onClose, onSubmit, eventId, resources }) => {
  const [formData, setFormData] = useState({
    team1Id: '',
    team2Id: '',
    fieldId: '',
    matchDate: '',
    matchTime: '',
    round: 'Round 1',
    matchNumber: 1,
    duration: 90,
    address: '',
    location: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        team1Id: '',
        team2Id: '',
        fieldId: '',
        matchDate: '',
        matchTime: '',
        round: 'Round 1',
        matchNumber: 1,
        duration: 90,
        address: '',
        location: ''
      });
      setErrors({});
    }
  }, [isOpen]);

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
    
    if (!formData.team1Id) {
      newErrors.team1Id = 'Vui lòng chọn đội 1';
    }
    if (!formData.team2Id) {
      newErrors.team2Id = 'Vui lòng chọn đội 2';
    }
    if (formData.team1Id === formData.team2Id) {
      newErrors.team2Id = 'Two teams cannot be the same';
    }
    if (!formData.matchDate) {
      newErrors.matchDate = 'Vui lòng chọn ngày thi đấu';
    }
    if (!formData.matchTime) {
      newErrors.matchTime = 'Vui lòng chọn giờ thi đấu';
    }
    if (!formData.round) {
      newErrors.round = 'Vui lòng nhập vòng đấu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  // Get available rounds (existing + new)
  const existingRounds = resources.existingRounds || [];
  const defaultRounds = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'];
  const allRounds = [...new Set([...existingRounds, ...defaultRounds])].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Create New Match
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
          {/* Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Đội 1 <span className="text-red-400">*</span>
              </label>
              <select
                name="team1Id"
                value={formData.team1Id}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.team1Id ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">-- Chọn đội 1 --</option>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Đội 2 <span className="text-red-400">*</span>
              </label>
              <select
                name="team2Id"
                value={formData.team2Id}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.team2Id ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">-- Chọn đội 2 --</option>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Ngày thi đấu <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="matchDate"
                value={formData.matchDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.matchDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.matchDate && (
                <p className="mt-1 text-sm text-red-400">{errors.matchDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Giờ thi đấu <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="matchTime"
                value={formData.matchTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.matchTime ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.matchTime && (
                <p className="mt-1 text-sm text-red-400">{errors.matchTime}</p>
              )}
            </div>
          </div>

          {/* Round and Match Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vòng đấu <span className="text-red-400">*</span>
              </label>
              <select
                name="round"
                value={formData.round}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.round ? 'border-red-500' : 'border-gray-600'
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
                placeholder="Hoặc nhập vòng đấu mới"
                className="mt-2 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.round && (
                <p className="mt-1 text-sm text-red-400">{errors.round}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Match Number
              </label>
              <input
                type="number"
                name="matchNumber"
                value={formData.matchNumber}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Match Field
            </label>
            <select
              name="fieldId"
              value={formData.fieldId}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select field (optional) --</option>
              {resources.fields?.map(field => (
                <option key={field._id} value={field._id}>
                  {field.name} - {field.address}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Thời gian thi đấu (phút)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="30"
              max="180"
              step="15"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Address and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Địa chỉ thi đấu"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vị trí
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Vị trí chi tiết"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatchModal;

