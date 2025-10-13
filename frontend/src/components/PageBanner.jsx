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
        };

      case "/challenge":
        return {
          title: "Challenge",
          subtitle: "Join exciting tournaments",
          icon: Trophy,
        };

      case "/blog":
        return {
          title: "Blog",
          subtitle: "Search for news",
          showSearch: true,
          icon: BookOpen,
        };

      case "/shop":
        return {
          title: "Shop",
          subtitle: "Sports equipment store",
          description: "Shop for high-quality sports products",
          icon: Target,
        };

      default:
        return {
          title: "Field Booking",
          subtitle: "Luxury Stadium",
          icon: Trophy,
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
    <div className="relative h-[200px] md:h-[400px] overflow-hidden bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">

      {/* Content */}
   {/* Content */}
<div className="relative h-full flex flex-col justify-between">
  <div className="flex-1 flex items-center">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="text-center text-gray-900">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900">
            {config.title}
          </span>
        </h1>

        {/* Subtitle (only show if NOT blog) */}
        {!config.showSearch && (
          <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-3xl mx-auto font-light">
            {config.subtitle}
          </p>
        )}
      </div>
    </div>
  </div>

  {/* Separate Search Box for Blog, positioned at bottom */}
  {config.showSearch && (
    <div className="px-4 sm:px-6 lg:px-8 pb-6">
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full px-5 py-2.5 pl-12 text-base bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
          />
          <Search className="absolute left-4 w-5 h-5 text-gray-600" />
          <button
            type="submit"
            className="absolute right-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300"
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
