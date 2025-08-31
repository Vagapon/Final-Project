import React, { useEffect, useState } from "react";
import {
  Trophy,
  Phone,
  Mail,
  Users,
  Target,
  TrendingUp,
  Award,
  Shield,
} from "lucide-react";

const StatCard = ({ value, label, colorClass, icon: Icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-purple-300 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
          {value}
        </div>
      </div>
    </div>
    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
      {label}
    </div>
  </div>
);

const TeamInfo = () => {
  const [team, setTeam] = useState(null);
  const [playersCount, setPlayersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = window.localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/team/myteam", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setTeam(null);
          } else {
            throw new Error("Không thể tải dữ liệu team");
          }
        } else {
          const data = await res.json();
          console.log("Team data:", data); // 👈 log đúng ở đây
          console.log("ManagerId:", data.managerId);
          setTeam(data);
          setPlayersCount(data?.players?.length || 0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading team data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-16 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );

  if (!team)
    return (
      <div className="text-center py-16 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Team Found
            </h3>
            <p className="text-gray-600">You haven't created a team yet.</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Premier League Style */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Team Logo */}
            <div className="relative">
              {team.avatar ? (
                <img
                  src={team.avatar}
                  alt="Team Logo"
                  className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
                  <span className="text-purple-600 text-4xl font-bold">
                    {team.name?.charAt(0).toUpperCase() || "T"}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>

            {/* Team Info */}
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                {team.name || "Team Name"}
              </h1>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {team.shortName || "N/A"}
                </span>
                <span className="text-purple-200 text-lg">
                  Founded • {new Date().getFullYear()}
                </span>
              </div>
              <p className="text-purple-100 text-lg max-w-2xl leading-relaxed">
                {team.description ||
                  "Professional football club competing at the highest level."}
              </p>
            </div>

            {/* Manager Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[280px]">
              <div className="mb-4">
                {team?.managerId && (
                  <div className="flex flex-col items-center">
                    <img
                      src={team.managerId.avatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-full mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* <h3 className="text-lg font-bold mb-1">Manager</h3> */}
              <p className="text-purple-100 font-medium mb-3">
                {team.managerId?.name || "N/A"}
              </p>
              <div className="space-y-2 text-sm">
                {team.managerId?.phone && (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{team.managerId.phone}</span>
                  </div>
                )}
                {team.managerId?.email && (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{team.managerId.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            value={playersCount}
            label="Squad Size"
            colorClass="bg-emerald-500"
            icon={Users}
          />
          <StatCard
            value={0}
            label="Matches Played"
            colorClass="bg-blue-500"
            icon={Target}
          />
          <StatCard
            value={0}
            label="Wins"
            colorClass="bg-green-500"
            icon={TrendingUp}
          />
          <StatCard
            value={0}
            label="Losses"
            colorClass="bg-red-500"
            icon={Award}
          />
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {/* Club Information */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                Club Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {team.name || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Short Name
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {team.shortName || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  About
                </label>
                <p className="text-gray-700 leading-relaxed">
                  {team.description || "No description available."}
                </p>
              </div>
            </div>
          </div>

          {/* Management */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Management
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {team.managerId?.avatar ? (
                    <img
                      src={team.managerId.avatar}
                      alt="Manager"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center border border-gray-200">
                      <span className="text-purple-600 text-xl font-bold">
                        {team.managerId?.name?.charAt(0).toUpperCase() || "M"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {team.managerId?.name || "Manager Name"}
                  </h3>
                  <p className="text-purple-600 font-medium text-sm mb-4">
                    Team Manager
                  </p>
                  <div className="space-y-3">
                    {team.managerId?.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {team.managerId.phone_number}
                        </span>
                      </div>
                    )}
                    {team.managerId?.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700 font-medium break-all">
                          {team.managerId.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamInfo;
