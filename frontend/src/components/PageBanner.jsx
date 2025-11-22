// components/homelayout/PageBanner.jsx
import React, { useState } from "react";
import {
  Users,
  Trophy,
  BookOpen,
  Target,
  Search,
} from "lucide-react";

const PageBanner = ({ pathname }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const getBannerConfig = (path) => {
    switch (path) {
      case "/myteam":
        return {
          title: "My Team",
          subtitle: "Manage your team and members",
          icon: Users,
          backgroundImage: "/image/blue.jpg",
        };

      case "/challenge":
        return {
          title: "Challenge",
          subtitle: "Join exciting tournaments",
          icon: Trophy,
          backgroundImage: "/image/red.png",
        };

      case "/blog":
        return {
          title: "Blog",
          subtitle: "Search for news",
          showSearch: true,
          icon: BookOpen,
          backgroundImage: "/image/green.png",
        };

      case "/booking-history":
        return {
          title: "Lịch sử đặt sân",
          subtitle: "Theo dõi các giao dịch và lịch sử đặt sân của bạn",
          icon: BookOpen,
          backgroundImage: "/image/blue.jpg",
        };

      case "/shop":
        return {
          title: "Shop",
          subtitle: "Sports equipment store",
          description: "Shop for high-quality sports products",
          icon: Target,
          backgroundImage: "/image/green.png",
        };

      default:
        return {
          title: "Field Booking",
          subtitle: "Luxury Stadium",
          icon: Trophy,
          backgroundImage: "/image/soccer.gif",
        };
    }
  };

  const config = getBannerConfig(pathname);
  const IconComponent = config.icon;

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <div
      className="relative h-[240px] md:h-[420px] overflow-hidden"
      style={{
        backgroundImage: `url(${config.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/50" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              {config.title}
            </h1>
            {!config.showSearch && (
              <p className="text-base md:text-xl text-white/80 mt-4 max-w-3xl mx-auto font-light">
                {config.subtitle}
              </p>
            )}
          </div>
        </div>

        {config.showSearch && (
          <div className="px-4 sm:px-6 lg:px-8 mt-6">
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-5 py-2.5 pl-12 text-base bg-white/95 border border-white/60 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60"
                />
                <Search className="absolute left-4 w-5 h-5 text-gray-600" />
                <button
                  type="submit"
                  className="absolute right-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 border border-white/60"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageBanner;
