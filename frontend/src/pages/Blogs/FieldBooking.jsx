import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Star, Search, Filter, ChevronDown } from 'lucide-react';

const FieldBooking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fields = [
    {
      id: 1,
      name: 'Sân 5 người A1',
      subtitle: 'Sân 5 người',
      price: '300,000',
      capacity: '10 người',
      area: 'Khu A',
      status: 'available',
      features: ['Có nhân tạo', 'Đèn LED', 'Có mái che'],
      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=250&fit=crop&crop=center',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Sân 5 người A2',
      subtitle: 'Sân 5 người',
      price: '280,000',
      capacity: '10 người',
      area: 'Khu A',
      status: 'booked',
      features: ['Có nhân tạo', 'Đèn LED'],
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop&crop=center',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Sân 5 người B1',
      subtitle: 'Sân 5 người',
      price: '320,000',
      capacity: '10 người',
      area: 'Khu B',
      status: 'available',
      features: ['Có nhân tạo', 'Đèn LED', 'Có mái che', 'Điều hòa phòng thay đồ'],
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop&crop=center',
      rating: 4.9
    },
    {
      id: 4,
      name: 'Sân 7 người C1',
      subtitle: 'Sân 7 người',
      price: '450,000',
      capacity: '14 người',
      area: 'Khu C',
      status: 'available',
      features: ['Cỏ tự nhiên', 'Đèn LED', 'Có mái che'],
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop&crop=center',
      rating: 4.7
    },
    {
      id: 5,
      name: 'Sân 3 người D1',
      subtitle: 'Sân 3 người',
      price: '200,000',
      capacity: '6 người',
      area: 'Khu D',
      status: 'available',
      features: ['Có nhân tạo', 'Đèn LED'],
      image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=250&fit=crop&crop=center',
      rating: 4.4
    },
    {
      id: 6,
      name: 'Sân 5 người B2',
      subtitle: 'Sân 5 người',
      price: '310,000',
      capacity: '10 người',
      area: 'Khu B',
      status: 'available',
      features: ['Có nhân tạo', 'Đèn LED', 'Có mái che'],
      image: 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=400&h=250&fit=crop&crop=center',
      rating: 4.5
    }
  ];

  const timeSlots = ['06:00', '07:30', '09:00', '10:30', '14:00', '15:30', '17:00', '18:30', '20:00', '21:30'];
  const areas = ['Tất cả khu vực', 'Khu A', 'Khu B', 'Khu C', 'Khu D'];

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === '' || selectedArea === 'Tất cả khu vực' || field.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚽</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SportBook</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Trang chủ</a>
              <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Sân bóng</a>
              <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Liên hệ</a>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Đăng nhập
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đặt sân bóng</h2>
          <p className="text-gray-600">Chọn sân phù hợp với nhu cầu của bạn</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="">Chọn giờ</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Area */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{filteredFields.length}</span> sân bóng
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors md:hidden"
          >
            <Filter className="w-5 h-5" />
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* Field Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <div key={field.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {/* Field Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={field.image} 
                  alt={field.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    field.status === 'available' 
                      ? 'bg-white text-gray-700' 
                      : 'bg-gray-900 bg-opacity-50 text-white'
                  }`}>
                    {field.status === 'available' ? 'Còn trống' : 'Đã đặt'}
                  </div>
                </div>
              </div>

              {/* Field Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{field.name}</h3>
                    <p className="text-gray-600 text-sm">{field.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">{parseInt(field.price).toLocaleString()}đ</div>
                    <div className="text-sm text-gray-500">/ giờ</div>
                  </div>
                </div>

                {/* Capacity and Location */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{field.capacity}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{field.area}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {field.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                  {field.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{field.features.length - 3}
                    </span>
                  )}
                </div>

                {/* Book Button */}
                <button
                  disabled={field.status === 'booked'}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    field.status === 'available'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {field.status === 'available' ? 'Đặt Sân' : 'Đã được đặt'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFields.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sân bóng</h3>
            <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">⚽</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">SportBook</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Hệ thống đặt sân bóng trực tuyến hàng đầu với dịch vụ chuyên nghiệp và tiện ích hiện đại.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Liên kết</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">Về chúng tôi</a>
                <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">Dịch vụ</a>
                <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">Liên hệ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Liên hệ</h4>
              <div className="space-y-2 text-gray-600">
                <p>123 Đường ABC, Quận 1</p>
                <p>TP. Hồ Chí Minh</p>
                <p>0123 456 789</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 SportBook. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FieldBooking;