import React, { useState } from 'react';
import { Trophy, Users, MapPin, Calendar, Clock, Star, Filter, Search, Plus, Medal, Flame, Target, ChevronRight } from 'lucide-react';

const Challenge = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const challenges = [
    {
      id: 1,
      title: "Giải Bóng Đá Mùa Hè 2025",
      format: "11v11",
      status: "ongoing",
      participants: 128,
      maxParticipants: 128,
      prize: "10,000,000đ",
      location: "Sân Mỹ Đình, Hà Nội",
      date: "25/06 - 15/07",
      time: "19:00",
      difficulty: "Pro",
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=200&fit=crop",
      joined: true,
      featured: true
    },
    {
      id: 2,
      title: "Cup Vàng Phố Cổ",
      format: "7v7",
      status: "upcoming",
      participants: 45,
      maxParticipants: 64,
      prize: "5,000,000đ",
      location: "Sân Phố Cổ, Hà Nội",
      date: "28/06 - 05/07",
      time: "18:30",
      difficulty: "Amateur",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop",
      joined: false,
      featured: true
    },
    {
      id: 3,
      title: "Giải Nhanh Cuối Tuần",
      format: "5v5",
      status: "upcoming",
      participants: 32,
      maxParticipants: 32,
      prize: "2,000,000đ",
      location: "Sân Thể Thao Thanh Xuân",
      date: "29/06",
      time: "08:00",
      difficulty: "Open",
      image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=200&fit=crop",
      joined: false,
      featured: false
    },
    {
      id: 4,
      title: "Giải Đấu Sinh Viên",
      format: "11v11",
      status: "registration",
      participants: 89,
      maxParticipants: 96,
      prize: "8,000,000đ",
      location: "Sân Bách Khoa, Hà Nội",
      date: "01/07 - 20/07",
      time: "16:00",
      difficulty: "Semi-Pro",
      image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400&h=200&fit=crop",
      joined: false,
      featured: false
    },
    {
      id: 5,
      title: "Champions League Mini",
      format: "7v7",
      status: "ongoing",
      participants: 24,
      maxParticipants: 32,
      prize: "15,000,000đ",
      location: "Sân Phủ Lý Stadium",
      date: "20/06 - 10/07",
      time: "20:00",
      difficulty: "Pro",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=200&fit=crop",
      joined: true,
      featured: true
    },
    {
      id: 6,
      title: "Futsal Challenge",
      format: "5v5",
      status: "upcoming",
      participants: 16,
      maxParticipants: 24,
      prize: "3,000,000đ",
      location: "Nhà Thi Đấu Quần Ngựa",
      date: "02/07",
      time: "19:30",
      difficulty: "Amateur",
      image: "https://images.unsplash.com/photo-1546608235-65ad1baa66d6?w=400&h=200&fit=crop",
      joined: false,
      featured: false
    }
  ];

  const formatOptions = [
    { value: 'all', label: 'Tất Cả', count: challenges.length },
    { value: '5v5', label: '5 vs 5', count: challenges.filter(c => c.format === '5v5').length },
    { value: '7v7', label: '7 vs 7', count: challenges.filter(c => c.format === '7v7').length },
    { value: '11v11', label: '11 vs 11', count: challenges.filter(c => c.format === '11v11').length }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất Cả', color: 'bg-gray-100 text-gray-800' },
    { value: 'ongoing', label: 'Đang Diễn Ra', color: 'bg-green-100 text-green-800' },
    { value: 'upcoming', label: 'Sắp Diễn Ra', color: 'bg-blue-100 text-blue-800' },
    { value: 'registration', label: 'Đang Mở Đăng Ký', color: 'bg-purple-100 text-purple-800' }
  ];

  const getStatusColor = (status) => {
    const statusMap = {
      ongoing: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      registration: 'bg-purple-100 text-purple-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyMap = {
      'Open': 'bg-gray-900 text-white',
      'Amateur': 'bg-green-600 text-white',
      'Semi-Pro': 'bg-yellow-500 text-white',
      'Pro': 'bg-red-600 text-white'
    };
    return difficultyMap[difficulty] || 'bg-gray-600 text-white';
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'joined' && challenge.joined) ||
      (activeTab === 'available' && !challenge.joined);
    
    const matchesFormat = selectedFormat === 'all' || challenge.format === selectedFormat;
    
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesFormat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header Section */}


      {/* Stats Section */}
  

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'Tất Cả Giải', count: challenges.length },
              { key: 'joined', label: 'Đã Tham Gia', count: challenges.filter(c => c.joined).length },
              { key: 'available', label: 'Có Thể Tham Gia', count: challenges.filter(c => !c.joined).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm giải đấu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {formatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
              
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Challenges */}
        {activeTab === 'all' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Giải Đấu Nổi Bật
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.filter(c => c.featured).slice(0, 3).map(challenge => (
                <div key={challenge.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                  <div className="relative">
                    <img src={challenge.image} alt={challenge.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                        {statusOptions.find(s => s.value === challenge.status)?.label}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    {challenge.joined && (
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Đã tham gia
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {challenge.format}
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {challenge.prize}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{challenge.title}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {challenge.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {challenge.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {challenge.time}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {challenge.participants}/{challenge.maxParticipants} người
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(challenge.participants / challenge.maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                    
                    <button 
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        challenge.joined 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {challenge.joined ? 'Đã tham gia' : 'Tham gia ngay'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Challenges */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'all' ? 'Tất Cả Giải Đấu' : 
               activeTab === 'joined' ? 'Giải Đã Tham Gia' : 'Giải Có Thể Tham Gia'}
            </h2>
            <div className="text-sm text-gray-600">
              {filteredChallenges.length} giải đấu
            </div>
          </div>

          <div className="grid gap-6">
            {filteredChallenges.map(challenge => (
              <div key={challenge.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="md:flex">
                  <div className="md:w-80 h-48 md:h-auto">
                    <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                          {statusOptions.find(s => s.value === challenge.status)?.label}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {challenge.format}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{challenge.prize}</div>
                        {challenge.joined && (
                          <div className="text-xs text-green-600 font-medium">Đã tham gia</div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{challenge.title}</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {challenge.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {challenge.date}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {challenge.time}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {challenge.participants}/{challenge.maxParticipants} người tham gia
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Đã đăng ký</span>
                        <span>{Math.round((challenge.participants / challenge.maxParticipants) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(challenge.participants / challenge.maxParticipants) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          challenge.joined 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {challenge.joined ? 'Đã tham gia' : 'Tham gia ngay'}
                      </button>
                      <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                        Chi tiết
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy giải đấu</h3>
              <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Create Challenge CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Tạo Giải Đấu Của Riêng Bạn</h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Bạn muốn tổ chức một giải đấu? Tạo ngay giải đấu của riêng bạn và mời bạn bè tham gia!
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Tạo Giải Đấu Mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default Challenge;