// components/homelayout/PageBanner.jsx
import React, { useState } from "react";
import {
  Users,
  Trophy,
  BookOpen,
  Target,
  Calendar,
  MapPin,
  Star,
  Award,
  Search,
} from "lucide-react";

const PageBanner = ({ pathname }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const getBannerConfig = (path) => {
    switch (path) {
      case "/myteam":
        return {
          title: "My Team",
          subtitle: "Quản lý đội bóng và thành viên của bạn",
          icon: Users,
          gradient: "from-gray-600 via-gray-700 to-gray-800",
          bgImage: "https://i.ytimg.com/vi/3TLYL4NFzyE/maxresdefault.jpg",
        };

      case "/challenge":
        return {
          title: "Challenge",
          subtitle: "Tham gia các giải đấu hấp dẫn",
          icon: Trophy,
          gradient: "from-gray-600 via-gray-700 to-gray-800",
          bgImage: "https://tuyetkiem.vn/wp-content/uploads/2023/04/9.jpg",
        };

      case "/blog":
        return {
          title: "Blog",
          subtitle: "Tìm kiếm tin tức", // Thay đổi subtitle để phù hợp với search
          showSearch: true, // Flag để hiển thị search box
          icon: BookOpen,
          gradient: "from-gray-600 via-gray-700 to-gray-800",
          bgImage:
            "https://kenh14cdn.com/203336854389633024/2024/5/9/photo-1-1715254733770814521774.jpg",
        };

      case "/shop":
        return {
          title: "Shop",
          subtitle: "Cửa hàng thiết bị thể thao",
          description: "Mua sắm các sản phẩm thể thao chất lượng cao",
          icon: Target,
          gradient: "from-gray-600 via-gray-700 to-gray-800",
          bgImage:
            "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1920&h=800&fit=crop",
        };

      default:
        return {
          title: "High Light",
          subtitle: "Những khoảnh khắc nổi bật",
         
          icon: Trophy,
          gradient: "from-gray-600 via-gray-700 to-gray-800",
          bgImage:
            "https://derivates.kicker.de/image/upload/c_crop%2Cx_276%2Cy_129%2Cw_3551%2Ch_1998/w_1000%2Cq_auto/v1/2022/06/03/617aa58e-7860-4611-ba9b-66f3d8912664.jpeg",
          stats: [],
        };
    }
  };

  const config = getBannerConfig(pathname);
  const IconComponent = config.icon;

  const handleSearch = (e) => {
    e.preventDefault();
    // Xử lý tìm kiếm ở đây
    console.log("Searching for:", searchQuery);
    // Có thể redirect đến trang kết quả tìm kiếm hoặc filter content
  };

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${config.bgImage})` }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-85`}
        ></div>
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Decorative circles - right side */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-20 h-20 bg-white/8 rounded-full animate-ping"></div>

        {/* Enhanced Soccer Ball - left side */}
        {/* Floating Soccer Ball - bottom right corner */}
        <div className="absolute bottom-8 right-8 animate-bounce">
          <img
            src="/image/ball.png"
            alt="Football"
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl animate-spin-slow"
          />
        </div>

        {/* Additional floating elements */}
        <div className="absolute top-20 right-20 w-6 h-6 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-4 h-4 bg-white/15 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-40 right-40 w-8 h-8 bg-white/5 rounded-full animate-ping delay-700"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
          <div className="text-center text-white">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30 shadow-lg hover:scale-110 transition-transform duration-300">
              <IconComponent className="w-10 h-10" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-5xl font-bold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 drop-shadow-lg">
                {config.title}
              </span>
            </h1>

            {/* Search Box (chỉ hiển thị ở trang blog) hoặc Subtitle */}
            {config.showSearch ? (
              <div className="max-w-xl mx-auto mb-6">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm bài viết..."
                      className="w-full px-5 py-2.5 pl-12 text-base bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                    />
                    <Search className="absolute left-4 w-5 h-5 text-gray-300" />

                    <button
                      type="submit"
                      className="absolute right-2 p-2 rounded-full bg-white/25 hover:bg-white/40 text-white transition-all duration-300 backdrop-blur-sm border border-white/20"
                      title="Tìm kiếm"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <p className="text-xl md:text-2xl text-gray-100 mb-4 max-w-3xl mx-auto font-light drop-shadow-md">
                {config.subtitle}
              </p>
            )}

            {/* Description */}
            {config.description && (
              <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto opacity-90 drop-shadow-sm">
                {config.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBanner;
