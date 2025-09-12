import React from "react";
import { Search, Filter, Zap, Activity, Bike, Waves, Heart, Clock } from "lucide-react";

const SearchFilter = ({
  selectedFilter,
  setSelectedFilter,
  searchTerm,
  setSearchTerm,
}) => {
  const filters = [
    { key: "all", label: "Tất cả", icon: Zap },
    { key: "five", label: "Bóng đá 5", icon: Activity },
    { key: "seven", label: "Bóng đá 7", icon: Bike },
    { key: "eleven", label: "Bóng đá 11", icon: Waves },
    { key: "joined", label: "Đã tham gia", icon: Heart },
    { key: "ongoing", label: "Đang diễn ra", icon: Clock },
  ];

  return (
    <div className="w-full mb-10">
      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3 transition-all duration-300 focus-within:shadow-xl">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm thử thách thể thao..."
          className="flex-1 px-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
        <div className="h-6 w-px bg-gray-200 mx-3" />
        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition">
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Bộ lọc</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="mt-5 flex flex-wrap gap-3">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchFilter;
