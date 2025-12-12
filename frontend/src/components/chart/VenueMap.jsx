import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Calendar, Users, Trophy, Navigation, Activity, Maximize2, Filter } from 'lucide-react';
import fieldBookingService from '../../api/fieldBooking/fieldBookingService';
import { eventApi } from '../../api/eventManagement';
import dayjs from 'dayjs';

const VenueMap = () => {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const venueCountControlRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fieldsRes, eventsRes] = await Promise.allSettled([
          fieldBookingService.getFields({ page: 1, limit: 500 }),
          eventApi.getAllEvents({ page: 1, limit: 500 }),
        ]);

        // Handle fields response structure
        let fields = [];
        if (fieldsRes.status === 'fulfilled' && fieldsRes.value) {
          if (Array.isArray(fieldsRes.value)) {
            fields = fieldsRes.value;
          } else if (fieldsRes.value.data) {
            fields = Array.isArray(fieldsRes.value.data) ? fieldsRes.value.data : [];
          }
        }

        // Handle events response structure
        let events = [];
        if (eventsRes.status === 'fulfilled' && eventsRes.value) {
          const eventData = eventsRes.value.data || eventsRes.value;
          if (Array.isArray(eventData)) {
            events = eventData;
          } else if (eventData?.data && Array.isArray(eventData.data)) {
            events = eventData.data;
          }
        }

        const eventsByField = {};
        events.forEach((ev) => {
          const fid = ev.fieldId || ev.field || ev.field_id;
          const key = fid?._id || fid;
          if (!key) return;
          eventsByField[key] = eventsByField[key] || [];
          eventsByField[key].push(ev);
        });

        const colorMap = {
          football: '#3B82F6',
          basketball: '#10B981',
          tennis: '#F59E0B',
          swimming: '#8B5CF6',
          mixed: '#EF4444',
        };

        const mapped = fields.map((f) => {
          // Try multiple ways to get coordinates
          const lat = Number(f.latitude ?? f.lat ?? f.location?.lat);
          const lng = Number(f.longitude ?? f.lng ?? f.location?.lng);
          
          // Skip if no valid coordinates
          if (Number.isNaN(lat) || Number.isNaN(lng) || lat === 0 || lng === 0) {
            return null;
          }
          
          const evs = eventsByField[f._id] || [];
          const nextEvent = evs.length
            ? evs
                .map((e) => e.startDate || e.start_time || e.createdAt)
                .filter(Boolean)
                .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())[0]
            : null;
          
          // Better sport type detection
          const sportName = (f.sportTypeId?.code || f.sportTypeId?.name || f.sportType || '').toLowerCase();
          let type = 'mixed';
          
          if (sportName.includes('football') || sportName.includes('5') || sportName.includes('7') || sportName.includes('11')) {
            type = 'football';
          } else if (sportName.includes('basketball')) {
            type = 'basketball';
          } else if (sportName.includes('tennis')) {
            type = 'tennis';
          } else if (sportName.includes('swimming') || sportName.includes('swim')) {
            type = 'swimming';
          }
          
          return {
            id: f._id,
            name: f.name || 'Unnamed field',
            type,
            location: { lat, lng },
            address: f.address || f.location || '',
            events: evs.length,
            capacity: f.capacity || 0,
            status: f.status || 'active',
            nextEvent,
            color: colorMap[type] || '#3B82F6',
            description: f.description || '',
          };
        }).filter(Boolean);

        setVenues(mapped);
      } catch (err) {
        console.error('Venue map data error:', err);
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sportTypes = [
    { key: 'all', label: 'All Sports', icon: Activity, color: '#6B7280' },
    { key: 'football', label: 'Football', icon: Trophy, color: '#3B82F6' },
    { key: 'basketball', label: 'Basketball', icon: Activity, color: '#10B981' },
    { key: 'tennis', label: 'Tennis', icon: Activity, color: '#F59E0B' },
    { key: 'swimming', label: 'Swimming', icon: Activity, color: '#8B5CF6' },
    { key: 'mixed', label: 'Mixed', icon: Activity, color: '#EF4444' }
  ];

  const filteredVenues = useMemo(() => {
    return activeFilter === 'all' 
      ? venues 
      : venues.filter(venue => venue.type === activeFilter);
  }, [venues, activeFilter]);

  // Initialize map using vanilla Leaflet (since we can't install react-leaflet)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create Leaflet map instance
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      // Initialize map
      const map = window.L.map(mapRef.current, {
        center: [10.7769, 106.6951], // Ho Chi Minh City
        zoom: 13,
        zoomControl: true
      });

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Add custom control for venue count (will be updated dynamically)
      const VenueCountControl = window.L.Control.extend({
        options: { position: 'topright' },
        onAdd: function() {
          const container = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          container.style.backgroundColor = 'white';
          container.style.padding = '5px';
          container.id = 'venue-count-control';
          venueCountControlRef.current = container;
          return container;
        }
      });
      
      const control = new VenueCountControl();
      map.addControl(control);
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update venue count control when filtered venues change
  useEffect(() => {
    if (venueCountControlRef.current) {
      venueCountControlRef.current.innerHTML = `
        <div style="font-size: 12px; font-weight: bold; color: #374151;">
          ${filteredVenues.length} venues
        </div>
      `;
    }
  }, [filteredVenues]);

  // Update markers when filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    filteredVenues.forEach(venue => {
      const customIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${venue.color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            ${venue.status === 'active' ? 'animation: pulse 2s infinite;' : ''}
          ">
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = window.L.marker([venue.location.lat, venue.location.lng], {
        icon: customIcon
      }).addTo(mapInstanceRef.current);

      // Add popup
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #111827;">
            ${venue.name}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">
            ${venue.address}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 12px 0;">
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: ${venue.color};">
                ${venue.events}
              </div>
              <div style="font-size: 10px; color: #9CA3AF;">Events</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: ${venue.color};">
                ${venue.capacity.toLocaleString()}
              </div>
              <div style="font-size: 10px; color: #9CA3AF;">Capacity</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 12px; font-weight: bold; color: ${venue.status === 'active' ? '#10B981' : '#F59E0B'};">
                ${venue.status}
              </div>
              <div style="font-size: 10px; color: #9CA3AF;">Status</div>
            </div>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #6B7280; font-style: italic;">
            ${venue.description}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        setSelectedVenue(venue);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (filteredVenues.length > 0) {
      const group = new window.L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [filteredVenues, mapLoaded]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50' : 'p-6'
    }`}>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px 16px;
        }
      `}</style>

      <div className={`${isFullscreen ? 'p-6' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Venue Locations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interactive map of sports facilities</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">{filteredVenues.length} venues</span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Sport Type Filters */}
        <div className="flex items-center space-x-1 mb-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
          {sportTypes.map((sport) => {
            const Icon = sport.icon;
            const count = sport.key === 'all' ? venues.length : venues.filter(v => v.type === sport.key).length;
            
            return (
              <button
                key={sport.key}
                onClick={() => setActiveFilter(sport.key)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  activeFilter === sport.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{sport.label}</span>
                <span className="bg-black bg-opacity-20 text-xs px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Map Container */}
        <div className={`relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
        }`}>
          <div ref={mapRef} className="w-full h-full z-10" />
          
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Venue Details */}
        {selectedVenue && (
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{selectedVenue.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedVenue.address}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedVenue.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedVenue.status)}`}>
                {selectedVenue.status}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-1">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Events</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedVenue.events}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-1">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedVenue.capacity.toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-1">
                  <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Next Event</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedVenue.nextEvent ? dayjs(selectedVenue.nextEvent).format('MMM D') : 'N/A'}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-1">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{selectedVenue.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{venues.filter(v => v.status === 'active').length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{venues.reduce((acc, v) => acc + v.events, 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">
              {venues.length ? Math.round(venues.reduce((acc, v) => acc + (v.capacity || 0), 0)) : 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">
              {venues.length ? Math.round(venues.reduce((acc, v) => acc + (v.capacity || 0), 0) / venues.length) : 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Capacity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueMap;