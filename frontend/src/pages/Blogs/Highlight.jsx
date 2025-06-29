import React, { useState } from "react";
import { Play, ChevronRight } from "lucide-react";

const HighLight = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(0);

  // Sample data
  const players = [
    {
      id: 1,
      name: "Cristiano Ronaldo",
      position: "Right Winger",
      team: "Manchester United",
      goals: 12,
      assists: 8,
      matches: 10,
      rating: 8.9,
      image:
        "https://64.media.tumblr.com/ce2593fcae04f87395953b39fadde7cc/4fb63b6344cc29de-16/s500x750/d9b220b9065c3bea7af7449d37a2dcfbd0801922.png",
      nationality: "England",
      age: 22,
      value: "£120M",
    },
  ];

  const highlights = [
    {
      id: 3,
      title: "Tottenham vs Chelsea | Derby Highlights",
      duration: "10:30",
      views: "2.1M",
      uploadTime: "1 week ago",
      youtubeId: "tUgJvUraEGI",
    },
    {
      id: 4,
      title: "Man United comeback vs Newcastle",
      duration: "6:45",
      views: "750K",
      uploadTime: "1 week ago",
      youtubeId: "ueD1ZMZvucg",
    },
  ];

  const leaderboard = [
    {
      position: 1,
      team: "Arsenal",
      mp: 10,
      w: 9,
      d: 0,
      l: 1,
      gf: 24,
      ga: 10,
      gd: "+14",
      pts: 27,
      logo: "https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png",
      lastFive: ["W", "W", "W", "W", "L"],
    },
    {
      position: 2,
      team: "Man City",
      mp: 10,
      w: 7,
      d: 2,
      l: 1,
      gf: 33,
      ga: 10,
      gd: "+23",
      pts: 23,
      logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png",
      lastFive: ["L", "W", "W", "W", "D"],
    },
    {
      position: 3,
      team: "Tottenham",
      mp: 11,
      w: 7,
      d: 2,
      l: 2,
      gf: 22,
      ga: 12,
      gd: "+10",
      pts: 23,
      logo: "https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png",
      lastFive: ["L", "W", "W", "L", "W"],
    },
    {
      position: 4,
      team: "Chelsea",
      mp: 10,
      w: 6,
      d: 2,
      l: 2,
      gf: 15,
      ga: 10,
      gd: "+5",
      pts: 20,
      logo: "https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png",
      lastFive: ["D", "W", "W", "W", "W"],
    },
    {
      position: 5,
      team: "Man United",
      mp: 10,
      w: 6,
      d: 1,
      l: 3,
      gf: 15,
      ga: 15,
      gd: "0",
      pts: 19,
      logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png",
      lastFive: ["W", "D", "W", "L", "W"],
    },
    {
      position: 6,
      team: "Newcastle",
      mp: 11,
      w: 4,
      d: 6,
      l: 1,
      gf: 18,
      ga: 9,
      gd: "+9",
      pts: 18,
      logo: "https://logos-world.net/wp-content/uploads/2020/06/Newcastle-United-Logo.png",
      lastFive: ["W", "D", "W", "W", "D"],
    },
  ];

  const currentPlayer = players[selectedPlayer];
  const currentVideo = highlights[selectedVideo];

  const getResultColor = (result) => {
    switch (result) {
      case "W":
        return "bg-green-500";
      case "L":
        return "bg-red-500";
      case "D":
        return "bg-gray-400";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Player Highlights
          </h1>
          <p className="text-gray-600 mt-1">
            Latest performances and statistics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Player Profile Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          {/* Player Profile */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Player Image */}
            <div className="flex-shrink-0">
              <img
                src={currentPlayer.image}
                alt={currentPlayer.name}
                className="w-full lg:w-80 h-80 lg:h-96 rounded-lg object-cover"
              />
            </div>

            {/* Player Info */}
            <div className="flex-1 space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {currentPlayer.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Position:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {currentPlayer.position}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Team:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {currentPlayer.team}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nationality:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {currentPlayer.nationality}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {currentPlayer.age}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Market Value:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {currentPlayer.value}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rating:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {currentPlayer.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Stats with Progress Bars */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Performance
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Goals
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round((currentPlayer.goals / 20) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentPlayer.goals / 20) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Assists
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round((currentPlayer.assists / 15) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentPlayer.assists / 15) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Match Rating
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round((currentPlayer.rating / 10) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentPlayer.rating / 10) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Consistency
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round((currentPlayer.matches / 38) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentPlayer.matches / 38) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {currentPlayer.goals}
                  </div>
                  <div className="text-xs text-gray-600">Goals</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {currentPlayer.assists}
                  </div>
                  <div className="text-xs text-gray-600">Assists</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {currentPlayer.matches}
                  </div>
                  <div className="text-xs text-gray-600">Matches</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {currentPlayer.goals + currentPlayer.assists}
                  </div>
                  <div className="text-xs text-gray-600">G+A</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Highlights Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Highlights
                </h2>
              </div>

              <div className="p-4">
                {/* Video Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highlights.map((video) => (
                    <div
                      key={video.id}
                      className="rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      {/* YouTube iframe always visible */}
                      <div className="aspect-video bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&controls=1`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="font-medium mb-2 line-clamp-2 text-sm text-gray-900">
                          {video.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{video.uploadTime}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                            {video.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* League Table */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Premier League Table
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium text-gray-700">#</th>
                      <th className="px-4 py-3 font-medium text-gray-700">
                        Club
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700 text-center">
                        MP
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700 text-center">
                        GD
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-700 text-center">
                        PTS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaderboard.map((team) => (
                      <tr key={team.position} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded ${
                              team.position <= 4
                                ? "bg-green-100 text-green-800"
                                : team.position <= 6
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {team.position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                              {team.team.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 truncate">
                              {team.team}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {team.mp}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`${team.gd.startsWith("+") ? "text-green-600" : team.gd === "0" ? "text-gray-600" : "text-red-600"}`}
                          >
                            {team.gd}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900">
                          {team.pts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Last 5 matches for top team */}
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="text-xs text-gray-600 mb-2">Form (Last 5)</div>
                <div className="flex gap-1">
                  {leaderboard[0].lastFive.map((result, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getResultColor(result)}`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighLight;
