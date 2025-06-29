import React, { useState } from 'react';
import { Trophy, Award, Medal, Star, Calendar, Users, Target, Crown, Goal } from 'lucide-react';

const GoalStars = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dữ liệu thành tích
  const achievements = [
    {
      id: 1,
      title: 'Giải Vô Địch Quốc Gia Golf 2024',
      category: 'championship',
      year: '2024',
      type: 'Vô Địch',
      description: 'Giải đấu golf lớn nhất năm với sự tham gia của 200+ golfer chuyên nghiệp',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
      icon: Crown,
      color: 'from-yellow-400 to-amber-500',
      participants: 200,
      prize: '500.000.000 VNĐ'
    },
    {
      id: 2,
      title: 'Giải Golf Mở Rộng Hà Nội',
      category: 'regional',
      year: '2024',
      type: 'Á Quân',
      description: 'Giải đấu khu vực miền Bắc quy tụ các golfer hàng đầu',
      image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=400&fit=crop',
      icon: Trophy,
      color: 'from-gray-400 to-gray-600',
      participants: 150,
      prize: '200.000.000 VNĐ'
    },
    {
      id: 3,
      title: 'Cúp Golf Doanh Nghiệp 2023',
      category: 'corporate',
      year: '2023',
      type: 'Vô Địch',
      description: 'Giải đấu golf dành cho các doanh nghiệp và tập đoàn lớn',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      icon: Award,
      color: 'from-blue-400 to-blue-600',
      participants: 100,
      prize: '300.000.000 VNĐ'
    },
    {
      id: 4,
      title: 'Giải Golf Thiện Nguyện',
      category: 'charity',
      year: '2023',
      type: 'Á Quân',
      description: 'Giải đấu gây quỹ từ thiện hỗ trợ trẻ em vùng cao',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      icon: Medal,
      color: 'from-green-400 to-emerald-500',
      participants: 80,
      prize: 'Từ thiện'
    },
    {
      id: 5,
      title: 'Giải Golf Quốc Tế Việt Nam',
      category: 'international',
      year: '2022',
      type: 'Top 5',
      description: 'Giải đấu quốc tế với sự tham gia của golfer từ nhiều quốc gia',
      image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop',
      icon: Star,
      color: 'from-purple-400 to-purple-600',
      participants: 300,
      prize: '1.000.000.000 VNĐ'
    },
    {
      id: 6,
      title: 'Cúp Golf Mùa Xuân 2022',
      category: 'seasonal',
      year: '2022',
      type: 'Vô Địch',
      description: 'Giải đấu thường niên chào mừng mùa xuân mới',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      icon: Trophy,
      color: 'from-pink-400 to-rose-500',
      participants: 120,
      prize: '150.000.000 VNĐ'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất Cả', icon: Trophy },
    { id: 'championship', name: 'Vô Địch', icon: Crown },
    { id: 'regional', name: 'Khu Vực', icon: Award },
    { id: 'corporate', name: 'Doanh Nghiệp', icon: Target },
    { id: 'charity', name: 'Thiện Nguyện', icon: Medal },
    { id: 'international', name: 'Quốc Tế', icon: Star }
  ];

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === activeCategory);

  // Reset slide khi filter thay đổi
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredAchievements.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredAchievements.length) % filteredAchievements.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Stats
  const totalTrophies = achievements.length;
  const championshipWins = achievements.filter(a => a.type === 'Vô Địch').length;
  const totalParticipants = achievements.reduce((sum, a) => sum + a.participants, 0);

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-8 shadow-xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent mb-6">
            Thành Tích
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent mb-8">
            Đạt Được
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Những chiến thắng và thành tích đáng tự hào trong hành trình phát triển của chúng tôi
          </p>
        </div>

        {/* Stats Overview - Horizontal Layout */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-800 mb-2">{totalTrophies}</h3>
              <p className="text-lg font-semibold text-gray-600">Tổng Số Cup</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-800 mb-2">{championshipWins}</h3>
              <p className="text-lg font-semibold text-gray-600">Chức Vô Địch</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-800 mb-2">{totalParticipants}+</h3>
              <p className="text-lg font-semibold text-gray-600">Đấu Thủ Tham Gia</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-yellow-200 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl hover:scale-105 border border-gray-200'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-lg">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Achievement Slider - Wider and Balanced */}
        <div className="relative max-w-8xl mx-auto">
          {filteredAchievements.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Current Achievement */}
              <div className="relative">
                {(() => {
                  const achievement = filteredAchievements[currentSlide];
                  const IconComponent = achievement.icon;
                  
                  return (
                    <div className="flex flex-col lg:flex-row min-h-[600px]">
                      {/* Image Section - Equal width */}
                      <div className="w-full lg:w-1/2 relative overflow-hidden group">
                        <img
                          src={achievement.image}
                          alt={achievement.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ minHeight: '600px' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        
                        {/* Floating Badges */}
                        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-full font-bold text-xl shadow-lg">
                          {achievement.year}
                        </div>
                        
                        <div className={`absolute top-8 right-8 bg-gradient-to-r ${achievement.color} text-white px-6 py-3 rounded-full font-black text-xl shadow-lg`}>
                          {achievement.type}
                        </div>
                      </div>

                      {/* Content Section - Equal width */}
                      <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center space-y-8">
                        <div className="flex items-center space-x-6">
                          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${achievement.color} rounded-2xl shadow-lg`}>
                            <IconComponent className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-3xl lg:text-4xl font-black text-gray-800 leading-tight">
                            {achievement.title}
                          </h3>
                        </div>
                        
                        <p className="text-xl text-gray-600 leading-relaxed">
                          {achievement.description}
                        </p>
                        
                        {/* Details */}
                        <div className="grid grid-cols-1 gap-8">
                          <div className="flex items-center space-x-4 text-gray-700">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-black text-2xl">{achievement.participants}</p>
                              <p className="text-lg text-gray-500">Người tham gia</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-gray-700">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                              <Trophy className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                              <p className="font-black text-2xl">{achievement.prize}</p>
                              <p className="text-lg text-gray-500">Giải thưởng</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {filteredAchievements.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:scale-110 transition-all duration-300 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:scale-110 transition-all duration-300 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {filteredAchievements.length > 1 && (
            <div className="flex justify-center mt-10 space-x-4">
              {filteredAchievements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-20 pt-16 border-t border-gray-200">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-full px-12 py-6 shadow-lg">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <span className="text-xl font-bold text-gray-800">Hành trình chinh phục những đỉnh cao mới vẫn tiếp tục...</span>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalStars;