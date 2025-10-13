import { Calendar, Users, MapPin, Clock, Star, Heart, Edit, Trash2, Share2, Download, Trophy, Target, Award } from 'lucide-react';
import BaseModal from '../../components/Modal/BaseModal';

const Detail = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  if (!event) return null;

  const handleEdit = () => {
    onEdit(event);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event._id);
      onClose();
    }
  };

  // Calculate number of matches for display
  const calculatedMatches = event.maxTeams ? Math.floor((parseInt(event.maxTeams) * (parseInt(event.maxTeams) - 1)) / 2) : 0;

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'ongoing': return 'bg-green-50 text-green-600 border-green-200';
      case 'completed': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <Calendar className="w-3 h-3" />;
      case 'ongoing': return <Target className="w-3 h-3" />;
      case 'completed': return <Trophy className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Hero Section with Image - Compact */}
        <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
          <img 
            src={event.avatar || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div className="absolute top-4 right-4">
            <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              {getStatusIcon(event.status)}
              <span className="ml-2 text-xs font-medium capitalize text-white">{event.status}</span>
            </div>
          </div>
        </div>

        {/* Event Details - Compact Layout */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-4 h-4 text-blue-500 mr-2" />
            Event Information
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                  <Star className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500">Event Name</div>
                  <div className="text-sm font-semibold text-gray-900">{event.name}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500">Description</div>
                  <div className="text-sm text-gray-900">{event.description || 'No description available'}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500">Event Period</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'TBD'} - {event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'TBD'}
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500">Location</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{event.location}</div>
                  </div>
                </div>
              )}

              {event.address && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500">Address</div>
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2">{event.address}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                  <Users className="w-3 h-3 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500">Team Capacity</div>
                  <div className="text-sm font-semibold text-gray-900">{event.maxTeams || 0} teams max</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
                  <Clock className="w-3 h-3 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500">Matches</div>
                  <div className="text-sm font-semibold text-gray-900">{calculatedMatches} matches</div>
                  <div className="text-xs text-gray-500">Round-robin format</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                  <Star className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-500">Status</div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(event.status)}`}>
                    {getStatusIcon(event.status)}
                    <span className="ml-1 capitalize">{event.status || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Statistics - Compact */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-4 h-4 text-gray-600 mr-2" />
            Statistics
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">Created</div>
              <div className="text-sm font-semibold text-gray-900">
                {event.createdAt ? new Date(event.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'Unknown'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">Modified</div>
              <div className="text-sm font-semibold text-gray-900">
                {event.updatedAt ? new Date(event.updatedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'Unknown'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">Event ID</div>
              <div className="text-sm font-mono text-gray-900">#{event._id?.slice(-6)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">Format</div>
              <div className="text-sm font-semibold text-gray-900">Round Robin</div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 px-4 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default Detail;