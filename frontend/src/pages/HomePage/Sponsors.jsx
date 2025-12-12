import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Trophy, Users, Loader2 } from "lucide-react";
import { eventApi } from "../../api";
import { message } from "antd";

const Sponsors = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await eventApi.getAllEvents();
        const eventsData = response.data?.data || [];
        
        // Transform API data to match UI format
        const transformedEvents = eventsData.map((event) => {
          const startDate = event.startDate ? new Date(event.startDate) : null;
          const endDate = event.endDate ? new Date(event.endDate) : null;
          
          let dateStr = '';
          if (startDate && endDate) {
            dateStr = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          } else if (startDate) {
            dateStr = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          }
          
          // Determine status based on dates
          const now = new Date();
          let status = 'upcoming';
          if (startDate && endDate) {
            if (now < startDate) {
              status = 'upcoming';
            } else if (now >= startDate && now <= endDate) {
              status = 'live';
            } else {
              status = 'completed';
            }
          } else if (startDate) {
            status = now < startDate ? 'upcoming' : 'completed';
          }
          
          const sportType = event.sportTypeId?.name || 'Football';
          const location = event.location || event.address || 'TBD';
          const participants = event.maxTeams || event.maxParticipants || 'Multiple Teams';
          const prize = event.prizePool || event.prize || 'TBD';
          
          // Get image from avatar field (Cloudinary URL)
          // CloudinaryStorage returns full URL in req.file.path format: "https://res.cloudinary.com/..."
          let eventImage = event.avatar || event.image || event.banner || '';
          
          // Clean up the image URL - remove any whitespace
          if (eventImage) {
            eventImage = eventImage.trim();
          }
          
          // Check if it's a valid URL (starts with http:// or https://)
          // If not a valid URL or empty, use default
          if (!eventImage || 
              (!eventImage.startsWith('http://') && !eventImage.startsWith('https://') && !eventImage.startsWith('//'))) {
            eventImage = 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop';
          }
          
          return {
            id: event._id,
            title: event.name || event.title || 'Tournament',
            sport: sportType,
            date: dateStr || 'TBD',
            location: location,
            participants: `${participants} ${typeof participants === 'number' ? 'Teams' : ''}`,
            prize: prize,
            image: eventImage,
            status: status,
            description: event.description || event.details || 'A competitive tournament bringing together top teams.',
            eventData: event // Keep original data
          };
        });
        
        // Sort by start date (upcoming first, then live, then completed)
        transformedEvents.sort((a, b) => {
          const statusOrder = { 'live': 0, 'upcoming': 1, 'completed': 2 };
          const aOrder = statusOrder[a.status] || 3;
          const bOrder = statusOrder[b.status] || 3;
          if (aOrder !== bOrder) return aOrder - bOrder;
          
          // Within same status, sort by date
          const aDate = a.eventData?.startDate ? new Date(a.eventData.startDate) : new Date(0);
          const bDate = b.eventData?.startDate ? new Date(b.eventData.startDate) : new Date(0);
          return bDate - aDate; // Newest first
        });
        
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        message.error('Unable to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [events.length]);

  const getStatusColor = (status) => {
    switch (status) {
      case "live":
        return "bg-red-500 text-white shadow-lg shadow-red-500/30";
      case "upcoming":
        return "bg-blue-500 text-white shadow-lg shadow-blue-500/30";
      case "completed":
        return "bg-green-500 text-white shadow-lg shadow-green-500/30";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "live":
        return "LIVE NOW";
      case "upcoming":
        return "UPCOMING";
      case "completed":
        return "COMPLETED";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="relative w-full bg-gray-50 from-gray-50 via-slate-50 to-gray-100 overflow-hidden">
      {/* Main Slider Container */}
      <div className="relative h-[500px] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No events available</p>
            </div>
          </div>
        ) : (
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {events.map((tournament, index) => (
            <div key={tournament.id} className="w-full flex-shrink-0 relative ">
              <div className="flex h-full">
                {/* Left Content Section */}
                <div className="w-1/2 flex items-center justify-center px-8 py-8">
                  <div className="max-w-md space-y-5">
                    {/* Status Badge & Sport */}
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(tournament.status)} ${tournament.status === "live" ? "animate-pulse" : ""}`}
                      >
                        {getStatusText(tournament.status)}
                      </span>
                      <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {tournament.sport}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
                        {tournament.title}
                      </h1>
                      <p className="text-gray-600 leading-relaxed">
                        {tournament.description}
                      </p>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Date
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {tournament.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Location
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {tournament.location}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Participants
                            </p>
                            <p className="text-gray-900 font-semibold text-sm">
                              {tournament.participants}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                          <div className="p-2 bg-yellow-50 rounded-lg">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Prize Pool
                            </p>
                            <p className="text-gray-900 font-semibold text-sm">
                              {tournament.prize}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Image Section */}
                <div className="w-1/2 relative overflow-hidden group">
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 z-10"></div>

                  {/* Ảnh được scale nhỏ lại mặc định, hover thì to ra */}
                  <img
                    src={tournament.image}
                    alt={tournament.title}
                    className="w-full h-full object-cover object-center transform scale-95 group-hover:scale-100 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback to default image if event image fails to load
                      e.target.src = 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop';
                    }}
                  />

                  {/* Hover overlay + button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex items-center justify-center">
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-xl hover:shadow-2xl">
                      View Tournament Details
                    </button>
                  </div>

                  {/* Sport badge */}
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-30">
                    <p className="text-sm font-bold text-gray-900">
                      {tournament.sport}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Dots Indicator (Optional - can be removed completely if not needed) */}
      {/* Indicators (Dots) dưới slider */} 
      {events.length > 0 && (
        <div className="flex justify-center mt-2 mb-2">
          <div className="flex space-x-1.5">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-blue-600 scale-125" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Sponsors;
