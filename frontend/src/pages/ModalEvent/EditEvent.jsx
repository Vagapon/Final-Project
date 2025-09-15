import { useState, useEffect } from 'react';
import { Upload, Calendar, Users, MapPin, Clock, Star, Heart, Save, X } from 'lucide-react';
import BaseModal from './BaseModal';
import axios from 'axios';
import { message, Spin } from 'antd';

const Edit = ({ isOpen, onClose, event, onUpdateEvent }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportTypeId: '',
    seasonId: '',
    startDate: '',
    endDate: '',
    address: '',
    location: '',
    status: 'upcoming',
    maxTeams: '',
    avatar: null
  });

  const [sportTypes, setSportTypes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch sport types and seasons
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [sportTypesRes, seasonsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/season/sport-types', { headers }),
          axios.get('http://localhost:5000/api/season', { headers })
        ]);

        setSportTypes(sportTypesRes.data?.data || []);
        setSeasons(seasonsRes.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Load event data when modal opens
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        sportTypeId: event.sportTypeId || '',
        seasonId: event.seasonId || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        address: event.address || '',
        location: event.location || '',
        status: event.status || 'upcoming',
        maxTeams: event.maxTeams || '',
        avatar: null
      });
      setImagePreview(event.avatar || null);
    }
  }, [event, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.sportTypeId || !formData.seasonId) {
      message.error('Please fill in all required fields');
      return;
    }
    if (!formData.startDate) {
      message.error("Start date is required");
      return;
    }
    if (!formData.endDate) {
      message.error("End date is required");
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      message.error("End date must be after start date");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data object (not FormData for PUT requests)
      const updateData = {
        name: formData.name,
        description: formData.description,
        sportTypeId: formData.sportTypeId,
        seasonId: formData.seasonId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        address: formData.address,
        location: formData.location,
        status: formData.status,
        maxTeams: formData.maxTeams ? parseInt(formData.maxTeams) : 0
      };

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.put(`http://localhost:5000/api/event/${event._id}`, updateData, { headers });
      
      if (response.status === 200) {
        message.success('Event updated successfully!');
        onUpdateEvent(response.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update event. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      sportTypeId: '',
      seasonId: '',
      startDate: '',
      endDate: '',
      address: '',
      location: '',
      status: 'upcoming',
      maxTeams: '',
      avatar: null
    });
    setImagePreview(null);
    onClose();
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, avatar: null }));
  };

  if (!event) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Event: ${event.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Current Event Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Current Event Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Event ID:</span>
              <span className="ml-2 text-blue-900">#{event._id}</span>
            </div>
            <div>
              <span className="text-blue-700">Created:</span>
              <span className="ml-2 text-blue-900">{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Unknown'}</span>
            </div>
            <div>
              <span className="text-blue-700">Max Teams:</span>
              <span className="ml-2 text-blue-900">{event.maxTeams || 0}</span>
            </div>
            <div>
              <span className="text-blue-700">Status:</span>
              <span className="ml-2 text-blue-900 capitalize">{event.status || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="mx-auto h-32 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload new image or keep current
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sport Type *
            </label>
            <select
              name="sportTypeId"
              value={formData.sportTypeId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select sport type</option>
              {sportTypes.map(sportType => (
                <option key={sportType._id} value={sportType._id}>
                  {sportType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season *
            </label>
            <select
              name="seasonId"
              value={formData.seasonId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select season</option>
              {seasons.map(season => (
                <option key={season._id} value={season._id}>
                  {season.name} ({new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Matches (Auto-calculated)
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {formData.maxTeams ? Math.floor((parseInt(formData.maxTeams) * (parseInt(formData.maxTeams) - 1)) / 2) : 0} matches
            </div>
            <small className="text-gray-500 mt-1 block">
              Based on round-robin tournament: n(n-1)/2
            </small>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Teams
            </label>
            <input
              type="number"
              name="maxTeams"
              value={formData.maxTeams}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spin size="small" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Event
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default Edit;