import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Search, Home, Users, Calendar, Bell, Settings, User, Camera, MapPin, Clock, Trophy, Menu, X } from 'lucide-react';

const Blog = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: "Nguyễn Văn A",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
        verified: true
      },
      content: "Tìm đội bóng đá giao hữu cuối tuần! Sân Mỹ Đình, 7h sáng chủ nhật. Còn thiếu 3 người. Liên hệ nhanh nhé!",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
      time: "2 giờ trước",
      location: "Sân Mỹ Đình, Hà Nội",
      sport: "Bóng đá",
      likes: 12,
      comments: 8,
      shares: 3,
      liked: false
    },
    {
      id: 2,
      user: {
        name: "Trần Thị B",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
        verified: false
      },
      content: "Ai muốn chơi cầu lông không? Tối nay 7h tại sân Thanh Xuân. Mình có sẵn vợt rồi, chỉ cần mang giày thể thao là được!",
      time: "4 giờ trước",
      location: "Sân cầu lông Thanh Xuân",
      sport: "Cầu lông",
      likes: 8,
      comments: 5,
      shares: 1,
      liked: true
    },
    {
      id: 3,
      user: {
        name: "Lê Văn C",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
        verified: true
      },
      content: "Giải bóng rổ sinh viên sắp diễn ra! Đăng ký ngay để không bỏ lỡ cơ hội thể hiện tài năng. Giải thưởng hấp dẫn đang chờ các bạn! 🏀",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop",
      time: "6 giờ trước",
      location: "Sân bóng rổ ĐH Bách Khoa",
      sport: "Bóng rổ",
      likes: 25,
      comments: 12,
      shares: 7,
      liked: false
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        user: {
          name: "Bạn",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          verified: false
        },
        content: newPost,
        time: "Vừa xong",
        location: "Thanh Hóa",
        sport: selectedSport || "Bóng đá",
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setSelectedSport('');
    }
  };

  const sidebarItems = [
    { icon: Home, label: "Trang chủ", active: true },
    { icon: Users, label: "Tìm đội", badge: "3" },
    { icon: Calendar, label: "Sự kiện", badge: "2" },
    { icon: Trophy, label: "Giải đấu" },
    { icon: Bell, label: "Thông báo", badge: "5" },
    { icon: Settings, label: "Cài đặt" }
  ];

  const sports = ["Bóng đá", "Cầu lông", "Bóng rổ", "Tennis", "Bóng chuyền", "Bóng bàn"];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}

      <div className="w-full">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Bạn</h3>
                    <p className="text-sm text-gray-500">Thanh Hóa</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  {sidebarItems.map((item, index) => (
                    <button
                      key={index}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                        item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="w-64 space-y-4 hidden lg:block flex-shrink-0 p-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bạn</h3>
                  <p className="text-sm text-gray-500">Thanh Hóa</p>
                </div>
              </div>
              <nav className="space-y-2">
                {sidebarItems.map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                      item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đội đã tham gia</span>
                  <span className="font-semibold text-blue-600">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trận đấu</span>
                  <span className="font-semibold text-green-600">25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm số</span>
                  <span className="font-semibold text-yellow-600">1,450</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 px-3 sm:px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Tìm đội bóng, chia sẻ trận đấu..."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    rows="3"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 space-y-3 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="px-3 py-1 border border-gray-200 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn môn thể thao</option>
                        {sports.map(sport => (
                          <option key={sport} value={sport}>{sport}</option>
                        ))}
                      </select>
                      <button className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-full">
                        <Camera className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">Ảnh</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-full">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">Vị trí</span>
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                    >
                      Đăng bài
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4 lg:space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Post Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.user.name}</h3>
                            {post.user.verified && (
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-500">
                            <span>{post.time}</span>
                            {post.location && (
                              <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                                <span className="hidden sm:inline">•</span>
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{post.location}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                              <span className="hidden sm:inline">•</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {post.sport}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1">
                        <span className="text-lg">•••</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-3 sm:p-4">
                    <p className="text-gray-900 mb-3 text-sm sm:text-base">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-3 sm:px-4 py-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
                      <span>{post.likes} lượt thích</span>
                      <div className="flex space-x-2 sm:space-x-4">
                        <span>{post.comments} bình luận</span>
                        <span>{post.shares} chia sẻ</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-100 text-xs sm:text-sm ${
                          post.liked ? 'text-red-500' : 'text-gray-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${post.liked ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Thích</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Bình luận</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Chia sẻ</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Viết bình luận..."
                          className="flex-1 px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full flex-shrink-0">
                          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <div className="w-80 space-y-4 hidden xl:block flex-shrink-0 p-4">
            {/* Sponsored Events */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Sự kiện nổi bật</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Giải bóng đá phố</h4>
                    <p className="text-sm text-gray-500">Thứ 7, 15:00</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Giao hữu cầu lông</h4>
                    <p className="text-sm text-gray-500">Chủ nhật, 8:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Đang hoạt động</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((user) => (
                  <div key={user} className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user + 10}`}
                        alt={`User ${user}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-sm text-gray-700">Người dùng {user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Join */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
              <h3 className="font-semibold mb-2">Tham gia ngay!</h3>
              <p className="text-sm opacity-90 mb-3">
                Tìm đội bóng gần bạn và tham gia ngay hôm nay
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Khám phá ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;