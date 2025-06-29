import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";

const Sponsors = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const tournaments = [
    {
      id: 1,
      title: "FIFA World Cup 2026",
      sport: "Football",
      date: "June 11 - July 19, 2026",
      location: "USA, Canada, Mexico",
      participants: "32 Teams",
      prize: "$440M",
      image:
        "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop",
      status: "upcoming",
      description:
        "The biggest football tournament in the world, bringing together nations from across the globe to compete for the ultimate prize in international football.",
    },
    {
      id: 2,
      title: "Tennis Masters Cup",
      sport: "Tennis",
      date: "November 10-17, 2024",
      location: "Turin, Italy",
      participants: "8 Players",
      prize: "$15M",
      image:
        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop",
      status: "live",
      description:
        "Elite tennis championship featuring the world's top 8 players competing in the season-ending tournament with round-robin format.",
    },
    {
      id: 3,
      title: "NBA Finals 2024",
      sport: "Basketball",
      date: "June 6-23, 2024",
      location: "Various Cities, USA",
      participants: "2 Teams",
      prize: "$25M",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
      status: "completed",
      description:
        "Championship series of the National Basketball Association, determining the league champion through a best-of-seven playoff series.",
    },
    {
      id: 4,
      title: "Champions League Final",
      sport: "Football",
      date: "June 1, 2024",
      location: "Wembley Stadium, London",
      participants: "2 Teams",
      prize: "$20M",
      image:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
      status: "completed",
      description:
        "Europe's premier club football competition final, showcasing the continent's best teams in the most prestigious club tournament.",
    },
    {
      id: 5,
      title: "Olympic Games 2024",
      sport: "Multi-Sport",
      date: "July 26 - Aug 11, 2024",
      location: "Paris, France",
      participants: "10,000+ Athletes",
      prize: "Glory & Medals",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
      status: "completed",
      description:
        "The world's greatest sporting celebration, uniting athletes from around the globe in the spirit of competition and excellence.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % tournaments.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tournaments.length]);

  const getStatusColor = (status) => {
    switch (status) {
      case "live":
        return "bg-red-500 text-white shadow-lg shadow-red-500/30";
      case "upcoming":
        return "bg-blue-500 text-white shadow-lg shadow-blue-500/30";
      case "completed":
        return "bg-green-500 text-white shadow-lg shadow-green-500/30";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "live":
        return "LIVE NOW";
      case "upcoming":
        return "UPCOMING";
      case "completed":
        return "COMPLETED";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="relative w-full bg-gray-50 from-gray-50 via-slate-50 to-gray-100 overflow-hidden">
      {/* Main Slider Container */}
      <div className="relative h-[500px] overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {tournaments.map((tournament, index) => (
            <div key={tournament.id} className="w-full flex-shrink-0 relative ">
              <div className="flex h-full">
                {/* Left Content Section */}
                <div className="w-1/2 flex items-center justify-center px-8 py-8">
                  <div className="max-w-md space-y-5">
                    {/* Status Badge & Sport */}
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(tournament.status)} ${tournament.status === "live" ? "animate-pulse" : ""}`}
                      >
                        {getStatusText(tournament.status)}
                      </span>
                      <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {tournament.sport}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
                        {tournament.title}
                      </h1>
                      <p className="text-gray-600 leading-relaxed">
                        {tournament.description}
                      </p>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Date
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {tournament.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Location
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {tournament.location}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Participants
                            </p>
                            <p className="text-gray-900 font-semibold text-sm">
                              {tournament.participants}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                          <div className="p-2 bg-yellow-50 rounded-lg">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Prize Pool
                            </p>
                            <p className="text-gray-900 font-semibold text-sm">
                              {tournament.prize}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Image Section */}
                <div className="w-1/2 relative overflow-hidden group">
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 z-10"></div>

                  {/* Ảnh được scale nhỏ lại mặc định, hover thì to ra */}
                  <img
                    src={tournament.image}
                    alt={tournament.title}
                    className="w-full h-full object-cover object-center transform scale-95 group-hover:scale-100 transition-transform duration-700"
                  />

                  {/* Hover overlay + button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex items-center justify-center">
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-xl hover:shadow-2xl">
                      View Tournament Details
                    </button>
                  </div>

                  {/* Sport badge */}
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-30">
                    <p className="text-sm font-bold text-gray-900">
                      {tournament.sport}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Dots Indicator (Optional - can be removed completely if not needed) */}
  {/* Indicators (Dots) dưới slider */} 
<div className="flex justify-center mt-2 mb-2">
  <div className="flex space-x-1.5">
    {tournaments.map((_, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          index === currentSlide ? "bg-blue-600 scale-125" : "bg-gray-300"
        }`}
      />
    ))}
  </div>
</div>

    </div>
  );
};

export default Sponsors;
