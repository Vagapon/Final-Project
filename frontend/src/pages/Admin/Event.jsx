import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Calendar, Users, MapPin, Clock, Star, Heart, Edit, Trash2 } from 'lucide-react';

// Import modals (trong thực tế sẽ import từ file riêng)
import BaseModal from '../ModalEvent/BaseModal';
import CreateEventModal from '../ModalEvent/Create';
import EventDetailModal from '../ModalEvent/Detail';
import EditEventModal from '../ModalEvent/Edit';

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

  // Sample event data
  const [eventData, setEventData] = useState([
    {
      id: 1,
      title: 'Music Festival',
      count: 245,
      usage: '17%',
      totalSize: '26.40 GB',
      icon: Calendar,
      color: 'text-teal-600 dark:text-teal-400',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      category: 'music',
      description: 'An amazing music festival featuring top artists',
      location: 'Central Park, NYC',
      date: '2024-12-25',
      time: '18:00',
      capacity: 5000,
      price: 150000
    },
    {
      id: 2,
      title: 'Tech Conference',
      count: 245,
      usage: '22%', 
      totalSize: '26.40 GB',
      icon: Users,
      color: 'text-pink-600 dark:text-pink-400',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      category: 'tech',
      description: 'Latest technology trends and innovations',
      location: 'Convention Center',
      date: '2024-12-30',
      time: '09:00',
      capacity: 1000,
      price: 250000
    },
    {
      id: 3,
      title: 'Art Exhibition',
      count: 830,
      usage: '23%',
      totalSize: '18.90 GB', 
      icon: Star,
      color: 'text-blue-600 dark:text-blue-400',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      category: 'art',
      description: 'Contemporary art from emerging artists',
      location: 'Modern Art Gallery',
      date: '2025-01-15',
      time: '10:00',
      capacity: 200,
      price: 50000
    },
    {
      id: 4,
      title: 'Food Festival',
      count: 1200,
      usage: '65%',
      totalSize: '85.30 GB',
      icon: Heart,
      color: 'text-orange-600 dark:text-orange-400',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      category: 'food',
      description: 'Culinary delights from around the world',
      location: 'Food Plaza',
      date: '2025-01-20',
      time: '11:00',
      capacity: 2000,
      price: 75000
    },
    {
      id: 5,
      title: 'Sport Events',
      count: 78,
      usage: '10%',
      totalSize: '5.40 GB',
      icon: MapPin,
      color: 'text-yellow-600 dark:text-yellow-400',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
      category: 'sport',
      description: 'Annual sports competition championship',
      location: 'Sports Complex',
      date: '2025-02-01',
      time: '14:00',
      capacity: 10000,
      price: 100000
    },
    {
      id: 6, 
      title: 'Wedding Events',
      count: 245,
      usage: '16%',
      totalSize: '26.40 GB',
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop',
      category: 'wedding',
      description: 'Elegant wedding ceremony services',
      location: 'Grand Ballroom',
      date: '2025-02-14',
      time: '16:00',
      capacity: 300,
      price: 500000
    }
  ]);

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
    setEventData(prev => [...prev, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEventData(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handleDeleteEvent = (eventId) => {
    setEventData(prev => prev.filter(event => event.id !== eventId));
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
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      handleDeleteEvent(event.id);
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
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                  {eventData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const IconComponent = event.icon;
            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
              >
                {/* Event Image */}
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                  <div className={`absolute top-3 left-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg ${event.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditClick(e, event)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, event)}
                      className="p-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {event.usage} Used
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {event.count.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {event.totalSize}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full transition-all duration-300"
                      style={{ width: event.usage }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
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