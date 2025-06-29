import React, { useState } from 'react';
import { 
  User, 
  Trophy, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Star, 
  Medal, 
  Target,
  Settings,
  Camera,
  Edit3
} from 'lucide-react';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample user data
  const [userData, setUserData] = useState({
    name: "Nguyễn Văn Nam",
    email: "nam.nguyen@email.com",
    phone: "+84 901 234 567",
    location: "Hà Nội, Việt Nam",
    joinDate: "Tháng 3, 2023",
    bio: "Đam mê chạy bộ và các môn thể thao ngoài trời. Tham gia nhiều giải marathon trong nước.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  });

  const stats = [
    { label: "Sự kiện tham gia", value: "24", icon: Calendar, color: "text-blue-500" },
    { label: "Huy chương", value: "8", icon: Medal, color: "text-yellow-500" },
    { label: "Điểm thành tích", value: "2,840", icon: Target, color: "text-green-500" },
    { label: "Xếp hạng", value: "#127", icon: Trophy, color: "text-purple-500" }
  ];

  const recentEvents = [
    { name: "Marathon Hà Nội 2024", date: "15/11/2024", result: "Huy chương Đồng", status: "completed" },
    { name: "Giải chạy Hồ Gươm", date: "22/10/2024", result: "Top 20", status: "completed" },
    { name: "Trail Running Sa Pa", date: "28/12/2024", result: "Đã đăng ký", status: "upcoming" },
  ];

  const achievements = [
    { title: "Marathon Finisher", description: "Hoàn thành 5 marathon", icon: "🏃‍♂️" },
    { title: "Speed Demon", description: "Đạt top 10 trong 3 giải", icon: "⚡" },
    { title: "Consistent Runner", description: "Tham gia sự kiện 12 tháng liên tiếp", icon: "📅" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-colors duration-300 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6 transition-colors duration-300">
          {/* Cover Background */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6">
              {/* Avatar */}
              <div className="relative -mt-12 sm:-mt-16 mb-4 lg:mb-0 self-center lg:self-auto">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-gray-700 p-1 shadow-xl">
                  <img 
                    src={userData.avatar} 
                    alt={userData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">{userData.name}</h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">{userData.bio}</p>
                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center lg:justify-start gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{userData.location}</span>
                      </div>
                      <div className="flex items-center justify-center lg:justify-start gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Tham gia từ {userData.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
                <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4 sm:mb-6 transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex px-4 sm:px-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'events', label: 'Sự kiện' },
                { id: 'achievements', label: 'Thành tích' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Thông tin liên hệ</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                      <span className="break-all">{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                      <span>{userData.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Sở thích thể thao</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Chạy bộ', 'Marathon', 'Trail Running', 'Cycling', 'Bơi lội'].map((sport, index) => (
                      <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Sự kiện gần đây</h3>
                <div className="space-y-4">
                  {recentEvents.map((event, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{event.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{event.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
                          event.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {event.result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Thành tích đạt được</h3>
                <div className="grid gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl sm:text-3xl flex-shrink-0">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{achievement.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;