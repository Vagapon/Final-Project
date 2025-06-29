import { Calendar, Users, MapPin, Clock, Star, Heart, Edit, Trash2, Share2, Download } from 'lucide-react';
import BaseModal from './BaseModal';

const Detail = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  if (!event) return null;

  const handleEdit = () => {
    onEdit(event);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
      onClose();
    }
  };

  const IconComponent = event.icon;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Event Image */}
        <div className="relative h-48 w-full rounded-lg overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className={`absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg ${event.color}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>

        {/* Event Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600">{event.description || 'No description available'}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{event.count.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{event.usage}</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{event.totalSize}</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                {event.date ? new Date(event.date).toLocaleDateString() : 'Date not specified'}
              </span>
            </div>
            
            {event.time && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{event.time}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{event.location}</span>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{event.capacity} people capacity</span>
              </div>
            )}

            {event.price && (
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{event.price.toLocaleString()} VND</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Storage Usage</span>
              <span className="text-gray-900 font-medium">{event.usage}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: event.usage }}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Event Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Created:</span>
                <span className="ml-2 text-blue-900">Today</span>
              </div>
              <div>
                <span className="text-blue-700">Last Modified:</span>
                <span className="ml-2 text-blue-900">2 hours ago</span>
              </div>
              <div>
                <span className="text-blue-700">Category:</span>
                <span className="ml-2 text-blue-900 capitalize">{event.category || 'General'}</span>
              </div>
              <div>
                <span className="text-blue-700">Event ID:</span>
                <span className="ml-2 text-blue-900">#{event.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Event</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default Detail;