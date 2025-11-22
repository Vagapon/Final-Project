import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Save } from 'lucide-react';

const EditMatchModal = ({ isOpen, onClose, onSubmit, match, resources }) => {
  const [formData, setFormData] = useState({
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
    status: 'upcoming'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && match) {
      // Format date for input
      const matchDate = match.matchDate 
        ? new Date(match.matchDate).toISOString().split('T')[0]
        : '';
      
      setFormData({
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
        status: match.status || 'upcoming'
      });
      setErrors({});
    }
  }, [isOpen, match]);

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
      newErrors.team2Id = 'Hai đội không được giống nhau';
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
            Chỉnh sửa trận đấu
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
          {/* Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đội 1 <span className="text-red-500">*</span>
              </label>
              <select
                name="team1Id"
                value={formData.team1Id}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.team1Id ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.team2Id ? 'border-red-500' : 'border-gray-300'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Ngày thi đấu <span className="text-red-500">*</span>
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
                Giờ thi đấu <span className="text-red-500">*</span>
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
                Vòng đấu <span className="text-red-500">*</span>
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
                placeholder="Hoặc nhập vòng đấu mới"
                className="mt-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.round && (
                <p className="mt-1 text-sm text-red-400">{errors.round}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số thứ tự trận đấu
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
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Sân thi đấu
            </label>
            <select
              name="fieldId"
              value={formData.fieldId}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Chọn sân (tùy chọn) --</option>
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
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Address and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Địa chỉ thi đấu"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vị trí
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Vị trí chi tiết"
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
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMatchModal;

