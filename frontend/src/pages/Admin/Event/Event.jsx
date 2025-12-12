import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Calendar, Users, MapPin, Clock, Star, Heart, Edit, Trash2, Trophy } from 'lucide-react';
import { message, Modal, Spin } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import eventApi from '../../../api/eventManagement/eventApi';
import { useAuth } from '../../Authen/AuthContext';

// Import modals (in practice would import from separate file)
import CreateEventModal from '../../ModalEvent/CreateEvent';
import EventDetailModal from '../../ModalEvent/DetailEvent';
import EditEventModal from '../../ModalEvent/EditEvent';

const Event = () => {
  const { user } = useAuth();
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

  // Check if current user can edit/delete this event
  const canEditEvent = (event) => {
    if (!user || !event) return false;
    if (user.role === 'ADMIN') return true; // Admin can edit everything
    
    if (user.role === 'STAFF') {
      // Staff can only edit if they created it or if creator is not admin
      // If createdByRole is 'ADMIN', staff cannot edit
      if (event.createdByRole === 'ADMIN') return false; // Staff cannot edit admin's events
      // If createdByRole is undefined/null, allow edit for backward compatibility
      // If createdByRole is 'STAFF' or not 'ADMIN', allow edit
      return true; // Staff can edit their own or other staff's events
    }
    
    return false;
  };

    // Real event data from API
  const [eventData, setEventData] = useState([]);

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventApi.getAllEvents();
      setEventData(response.data?.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch events';
      message.error(errorMessage);
      setEventData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
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
  const handleCreateEvent = async (newEvent) => {
    if (!newEvent) {
      console.error('handleCreateEvent called with undefined newEvent');
      return;
    }
    
    console.log('Adding new event to state:', newEvent);
    setEventData(prev => [...prev, newEvent]);
    message.success('Event created successfully!');
    
    // Refresh the event list to ensure data consistency
    setTimeout(() => {
      fetchEvents();
    }, 1000);
  };

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      const response = await eventApi.updateEvent(updatedEvent._id, updatedEvent);
      if (response.data.success) {
        setEventData(prev => prev.map(event => 
          event._id === updatedEvent._id ? response.data.data : event
        ));
        message.success('Event updated successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while updating event';
      message.error(errorMessage);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await eventApi.deleteEvent(eventId);
      if (response.data.success) {
        setEventData(prev => prev.filter(event => event._id !== eventId));
        message.success('Event deleted successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while deleting event';
      message.error(errorMessage);
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
    
    Modal.confirm({
      title: 'Delete Event',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>Are you sure you want to delete this event?</p>
          <p className="text-gray-500 mt-2">
            <strong>Event:</strong> {event.title || event.name}
          </p>
          <p className="text-red-600 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        handleDeleteEvent(event._id);
      },
    });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Modern Header with Stats */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
           
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Event Manager
              </h1>
              <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">Event Management</span>
              </nav>
            </div>
          </div>
        </div>

        {/* Simple Stats Cards */}
       
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Summary Stats */}
       

        {/* Clean Search and Actions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Events</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your events</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Simple Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              {/* Simple Create Button */}
              <button 
                onClick={() => openModal('create')}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              return (
                <div
                  key={event._id}
                  onClick={() => handleEventClick(event)}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  {/* Clean Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.avatar || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Simple Status Badge */}
                    <div className="absolute top-3 left-3">
                      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        event.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        <span className="capitalize">{event.status}</span>
                      </div>
                    </div>
                    
                    {/* Simple Action buttons */}
                    {canEditEvent(event) && (
                      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => handleEditClick(e, event)}
                          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-md transition-colors shadow-sm"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, event)}
                          className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-md transition-colors shadow-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clean Event Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {event.description || 'No description available'}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">
                            {event.maxTeams || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Simple Event Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{event.location || 'Not specified'}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          }) : 'TBD'} - {event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'TBD'}
                        </span>
                      </div>
                    </div>

                    {/* Simple Action Button */}
                    <div className="mt-4">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Simple Empty State */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search term.' : 'Get started by creating a new event.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => openModal('create')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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