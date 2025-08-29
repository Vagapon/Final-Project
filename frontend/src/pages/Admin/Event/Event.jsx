import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Calendar, Users, MapPin, Clock, Star, Heart, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

// Import modals (trong thực tế sẽ import từ file riêng)
import CreateEventModal from '../../ModalEvent/CreateEvent';
import EventDetailModal from '../../ModalEvent/DetailEvent';
import EditEventModal from '../../ModalEvent/EditEvent';

const Event = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [modals, setModals] = useState({
    create: false,
    detail: false,
    edit: false
  });
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

    // Real event data from API
  const [eventData, setEventData] = useState([]);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get('http://localhost:5000/api/event', { headers });
        setEventData(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const itemsPerSlide = 6;
  const maxSlides = Math.ceil(eventData.length / itemsPerSlide);

  // Modal handlers
  const openModal = (type, event = null) => {
    setSelectedEvent(event);
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: false }));
    setSelectedEvent(null);
  };

  // Event handlers
  const handleCreateEvent = (newEvent) => {
    if (!newEvent) {
      console.error('handleCreateEvent called with undefined newEvent');
      return;
    }
    
    // Add the new event to the list
    setEventData(prev => [...prev, newEvent]);
  };

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`http://localhost:5000/api/event/${updatedEvent._id}`, updatedEvent, { headers });
      
      if (response.status === 200) {
        setEventData(prev => prev.map(event => 
          event._id === updatedEvent._id ? response.data : event
        ));
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.delete(`http://localhost:5000/api/event/${eventId}`, { headers });
      
      if (response.status === 200) {
        setEventData(prev => prev.filter(event => event._id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleEventClick = (event) => {
    openModal('detail', event);
  };

  const handleEditClick = (e, event) => {
    e.stopPropagation();
    openModal('edit', event);
  };

  const handleDeleteClick = (e, event) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${event.title || event.name}"?`)) {
      handleDeleteEvent(event._id);
    }
  };

  // Slider navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  // Filter events based on search
  const filteredEvents = eventData.filter(event =>
    (event.title || event.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Manager</h1>
            <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">Event Manager</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {eventData.length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-200">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">234.5 GB</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg transition-colors duration-200">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{eventData.length}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg transition-colors duration-200">
                <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg transition-colors duration-200">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Upload Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Events</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-colors duration-200"
              />
            </div>
            <button 
              onClick={() => openModal('create')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              return (
                <div
                  key={event._id}
                  onClick={() => handleEventClick(event)}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
                >
                  {/* Event Image */}
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={event.avatar || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        event.status === 'upcoming' ? 'bg-blue-500/90 text-white' :
                        event.status === 'ongoing' ? 'bg-green-500/90 text-white' :
                        event.status === 'completed' ? 'bg-gray-500/90 text-white' :
                        'bg-gray-500/90 text-white'
                      }`}>
                        {event.status === 'upcoming' && <Calendar className="w-3 h-3 mr-1" />}
                        {event.status === 'ongoing' && <Clock className="w-3 h-3 mr-1" />}
                        {event.status === 'completed' && <Star className="w-3 h-3 mr-1" />}
                        <span className="capitalize">{event.status}</span>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditClick(e, event)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors backdrop-blur-sm"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, event)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors backdrop-blur-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {event.name}
                        </h3>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {/* <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-800 text-center"> */}
                          <div className="flex items-center justify-center">
                            <Users className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1" />
                            <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                              {event.maxTeams || 0}
                            </span>
                          </div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {event.location || 'Not specified'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            }) : 'TBD'} - {event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'TBD'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No events found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search term.' : 'Get started by creating a new event.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => openModal('create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        onCreateEvent={handleCreateEvent}
      />

      <EventDetailModal
        isOpen={modals.detail}
        onClose={() => closeModal('detail')}
        event={selectedEvent}
        onEdit={(event) => {
          closeModal('detail');
          openModal('edit', event);
        }}
        onDelete={handleDeleteEvent}
      />

      <EditEventModal
        isOpen={modals.edit}
        onClose={() => closeModal('edit')}
        event={selectedEvent}
        onUpdateEvent={handleUpdateEvent}
      />
    </div>
  );
};

export default Event;