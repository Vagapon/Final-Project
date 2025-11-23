import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Star, Search, Filter, ChevronDown, Loader2, Eye } from 'lucide-react';
import { fieldBookingService } from '../../api';
import { message } from 'antd';
import { useAuth } from '../Authen/AuthContext';
import ModernFieldDetailModal from '../ModalBooking/ModernFieldDetailModal';

const FieldBooking = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFieldDetail, setSelectedFieldDetail] = useState(null);
  const [fieldDetailLoading, setFieldDetailLoading] = useState(false);
  const { user } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });

  // Load fields on component mount
  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      const response = await fieldBookingService.getFields({
        status: 'active',
        limit: 20
      });
      setFields(response || []);
    } catch (error) {
      console.error('Error loading fields:', error);
      messageApi.error('Không thể tải danh sách sân');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (fieldId) => {
    try {
      const response = await fieldBookingService.getTimeSlots(fieldId);
      setTimeSlots(response || []);
    } catch (error) {
      console.error('Error loading time slots:', error);
      messageApi.error('Không thể tải khung giờ');
    }
  };

  const handleFieldSelect = async (field) => {
    try {
      // Load time slots for the field first
      await loadTimeSlots(field._id);
      
      // Use the first available time slot or create a default one
      const defaultTimeSlot = timeSlots[0] || { 
        _id: 'default', 
        startTime: '18:00', 
        endTime: '19:30', 
        timeType: 'ca_toi',
        multiplier: 1.5
      };
      const bookingDate = selectedDate || new Date().toISOString().split('T')[0];
      
      navigate(`/booking/${field._id}/${defaultTimeSlot._id}/${bookingDate}`);
    } catch (error) {
      console.error('Error loading time slots:', error);
      messageApi.error('Không thể tải khung giờ');
    }
  };

  const handleViewDetail = async (field) => {
    try {
      setFieldDetailLoading(true);
      setSelectedFieldDetail(field);
      setShowDetailModal(true);
      
      // Load detailed field information
      const response = await fieldBookingService.getFieldDetails(field._id);
      setSelectedFieldDetail(response);
    } catch (error) {
      console.error('Error loading field details:', error);
      messageApi.error('Không thể tải chi tiết sân');
    } finally {
      setFieldDetailLoading(false);
    }
  };

  const getCategoryLabel = (field) => {
    if (!field) return 'Khác';
    if (field.capacity) {
      if (typeof field.capacity === 'number') {
        return `Sân ${field.capacity} người`;
      }
      const match = field.capacity.toString().match(/\d+/);
      if (match) {
        return `Sân ${match[0]} người`;
      }
      return field.capacity;
    }
    if (field.purpose === 'event') return 'Sân giải đấu';
    if (field.purpose === 'rental') return 'Sân thuê';
    return 'Khác';
  };

  const priceStats = useMemo(() => {
    if (!fields.length) return { min: 0, max: 0 };
    const prices = fields
      .map((field) => Number(field.pricePerHour) || 0)
      .filter((price) => !Number.isNaN(price));
    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [fields]);

  useEffect(() => {
    if (!fields.length) return;
    setPriceFilter((prev) => ({
      min: prev.min === '' ? priceStats.min.toString() : prev.min,
      max: prev.max === '' ? priceStats.max.toString() : prev.max,
    }));
  }, [fields, priceStats]);

  const categoryOptions = useMemo(() => {
    const counts = {};
    fields.forEach((field) => {
      const label = getCategoryLabel(field);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [fields]);

  const locationOptions = useMemo(() => {
    const counts = {};
    fields.forEach((field) => {
      const label = field.location?.trim() || 'Khác';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [fields]);

  const featureOptions = useMemo(() => {
    const counts = {};
    fields.forEach((field) => {
      if (Array.isArray(field.features)) {
        field.features.forEach((feature) => {
          counts[feature] = (counts[feature] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [fields]);

  const handlePriceChange = (key, value) => {
    setPriceFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleFeature = (feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((item) => item !== feature)
        : [...prev, feature]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedFeatures([]);
    setShowActiveOnly(false);
    setPriceFilter({
      min: priceStats.min.toString(),
      max: priceStats.max.toString(),
    });
  };


  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryLabel = getCategoryLabel(field);
    const matchesCategory = selectedCategory === 'all' || categoryLabel === selectedCategory;
    const priceValue = Number(field.pricePerHour) || 0;
    const minPriceValue = priceFilter.min === '' ? null : Number(priceFilter.min);
    const maxPriceValue = priceFilter.max === '' ? null : Number(priceFilter.max);
    const matchesPrice =
      (minPriceValue === null || priceValue >= minPriceValue) &&
      (maxPriceValue === null || priceValue <= maxPriceValue);
    const locationLabel = field.location?.trim() || 'Khác';
    const matchesLocation = selectedLocation === 'all' || locationLabel === selectedLocation;
    const matchesActive = !showActiveOnly || field.status === 'active';
    const fieldFeatures = Array.isArray(field.features) ? field.features : [];
    const matchesFeatures =
      selectedFeatures.length === 0 ||
      selectedFeatures.every((feature) => fieldFeatures.includes(feature));

    return matchesSearch && matchesCategory && matchesPrice && matchesLocation && matchesActive && matchesFeatures;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'booked': return 'Đã đặt';
      case 'maintenance': return 'Bảo trì';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {contextHolder}
      

      {/* Search Section */}
      <div className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
          <div className="text-center">
            <div className="max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm sân bóng, địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-32 py-4 text-base border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group/btn">
                  <Search className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4 font-medium">Find the perfect field for your needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky top-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Filter & Refine</h2>
              
              {/* Category Filter */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Field Type</h3>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-left transition-colors rounded ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">All</span>
                    <span className="text-xs text-gray-500">({fields.length})</span>
                  </button>
                  {categoryOptions.map((category) => (
                    <button
                      key={category.label}
                      onClick={() => setSelectedCategory(category.label)}
                      className={`w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-left transition-colors rounded ${
                        selectedCategory === category.label
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium">{category.label}</span>
                      <span className="text-xs text-gray-500">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Price</h3>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={priceFilter.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <span className="text-gray-500 text-xs sm:text-sm">-</span>
                  <input
                    type="number"
                    min="0"
                    value={priceFilter.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <span className="text-xs text-gray-500">đ/khung</span>
                </div>
              </div>

              {/* Active Filter */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Status</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active-only"
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <label htmlFor="active-only" className="text-xs sm:text-sm text-gray-600">
                    Show only active fields
                  </label>
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Location</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedLocation('all')}
                    className={`w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-left transition-colors rounded ${
                      selectedLocation === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">All Areas</span>
                    <span className="text-xs text-gray-500">({fields.length})</span>
                  </button>
                  {locationOptions.map((area) => (
                    <button
                      key={area.label}
                      onClick={() => setSelectedLocation(area.label)}
                      className={`w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-left transition-colors rounded ${
                        selectedLocation === area.label
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium">{area.label}</span>
                      <span className="text-xs text-gray-500">({area.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features Filter */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Features</h3>
                <div className="space-y-2">
                  {featureOptions.length === 0 && (
                    <p className="text-xs text-gray-500">No features data available</p>
                  )}
                  {featureOptions.map((feature) => (
                    <div key={feature.label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={feature.label}
                          checked={selectedFeatures.includes(feature.label)}
                          onChange={() => toggleFeature(feature.label)}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                        />
                        <label htmlFor={feature.label} className="text-xs sm:text-sm text-gray-600">
                          {feature.label}
                        </label>
                      </div>
                      <span className="text-xs text-gray-500">({feature.count})</span>
                    </div>
                  ))}
                </div>
              </div>
                  </div>
                </div>

          {/* Right Content - Field Cards */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-gray-600">{loading ? 'Loading...' : `${filteredFields.length} items`}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600">Term: </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      'sport booking'
                    </span>
                    <button className="text-xs text-gray-500 hover:text-gray-700">Clear all</button>
                  </div>
                  </div>
                </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Sort Options */}
                <div className="flex flex-wrap items-center gap-1">
                  {['Best match', 'Best sellers', 'Newest', 'Best rated', 'Trending'].map((option, index) => (
                    <button
                      key={option}
                      className={`px-2 py-1 text-xs sm:text-sm rounded transition-colors ${
                        index === 0 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  <button className="px-2 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center space-x-1">
                    Price
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 border-r border-gray-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => navigate('/booking-history')}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Booking History
                </button>
              </div>
        </div>

            {/* Fields Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                <span className="ml-2 text-gray-600">Loading fields...</span>
            </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFields.map((field) => (
                  <div key={field._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
                    {/* Image Section */}
                    <div className="relative h-40 sm:h-48 lg:h-44 xl:h-48 overflow-hidden">
                      <img
                        src={field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=300&fit=crop&crop=center'}
                        alt={field.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Sale Badge */}
                      {Math.random() > 0.7 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          SALE
                        </div>
                      )}
                      {/* Price Tag */}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded text-xs sm:text-sm font-semibold">
                        {formatPrice(field.pricePerHour)}/slot
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{field.name}</h3>
                        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm text-gray-600">{field.rating || 4}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                        {field.description || 'Professional football field with modern facilities and excellent maintenance...'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <span>{field.capacity}</span>
                          <span>•</span>
                          <span className="truncate">{field.location}</span>
                        </div>
                        <span className="hidden sm:inline">Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">{Math.floor(Math.random() * 500) + 50} Sales</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleViewDetail(field)}
                            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleFieldSelect(field)}
                            disabled={field.status !== 'active'}
                            className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded transition-colors ${
                              field.status === 'active'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {field.status === 'active' ? 'Book Now' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredFields.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
            </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No fields found</h3>
                <p className="text-gray-600">Try changing filters or search keywords</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Field Detail Modal */}
        <ModernFieldDetailModal
          visible={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
          field={selectedFieldDetail}
          loading={fieldDetailLoading}
          onBookField={() => {
            setShowDetailModal(false);
            handleFieldSelect(selectedFieldDetail);
          }}
        />
    </div>
  );
};

export default FieldBooking;