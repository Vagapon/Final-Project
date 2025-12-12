import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "../../ModalEvent/MatchModal"; // Import Modal component
import { matchScheduleApi } from "../../../api";
import { message } from "antd";

const MatchOverview = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [matches, setMatches] = useState([]);
  const [ongoingMatches, setOngoingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [elapsedTimes, setElapsedTimes] = useState({}); // Store elapsed time for each match

  // Format date to English format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${dayName}, ${day}/${month}`;
    } catch {
      return '';
    }
  };

  // Calculate elapsed time for ongoing matches
  const calculateElapsedTime = (match) => {
    if (!match.matchDate || !match.matchTime) return null;
    
    try {
      const matchDate = new Date(match.matchDate);
      const [hours, minutes] = match.matchTime.split(':').map(Number);
      matchDate.setHours(hours || 0, minutes || 0, 0, 0);
      
      const now = new Date();
      const elapsed = Math.floor((now - matchDate) / 1000 / 60); // minutes
      
      if (elapsed < 0) return null; // Match hasn't started yet
      
      return elapsed;
    } catch {
      return null;
    }
  };

  // Format elapsed time to display format (e.g., "45'")
  const formatElapsedTime = (minutes) => {
    if (minutes === null || minutes === undefined) return "0'";
    if (minutes >= 90) return "90+'";
    return `${minutes}'`;
  };

  // Fetch ongoing matches from API
  useEffect(() => {
    const fetchOngoingMatches = async () => {
      setLoading(true);
      try {
        const response = await matchScheduleApi.getAllMatches({ status: 'ongoing' });
        const matchesData = response.data?.data?.allMatches || [];
        
        // Also check matches that should be ongoing based on time
        const allMatchesResponse = await matchScheduleApi.getAllMatches({});
        const allMatches = allMatchesResponse.data?.data?.allMatches || [];
        
        // Filter matches that are actually ongoing (status ongoing or time-based)
        const ongoing = allMatches.filter(match => {
          const status = match.status || 'upcoming';
          if (status === 'ongoing') return true;
          
          // Check if match should be ongoing based on time
          if (match.matchDate && match.matchTime) {
            try {
              const matchDate = new Date(match.matchDate);
              const [hours, minutes] = match.matchTime.split(':').map(Number);
              matchDate.setHours(hours || 0, minutes || 0, 0, 0);
              
              const duration = match.duration || 90;
              const matchEndTime = new Date(matchDate.getTime() + duration * 60 * 1000);
              const now = new Date();
              
              return now >= matchDate && now < matchEndTime && status !== 'completed' && status !== 'cancelled';
            } catch {
              return false;
            }
          }
          return false;
        });
        
        // Transform API data to match UI format
        const transformedMatches = ongoing.map((match, index) => {
          const team1Name = match.team1Id?.name || match.team1Id?.shortName || 'N/A';
          const team2Name = match.team2Id?.name || match.team2Id?.shortName || 'N/A';
          const team1Avatar = match.team1Id?.avatar || match.team1Id?.logo;
          const team2Avatar = match.team2Id?.avatar || match.team2Id?.logo;
          const eventName = match.eventId?.name || 'Tournament';
          const round = match.round || '';
          
          const elapsed = calculateElapsedTime(match);
          
          return {
            id: match._id || index + 1,
            homeTeam: team1Name,
            homeTeamShort: match.team1Id?.shortName || team1Name.substring(0, 3).toUpperCase(),
            awayTeam: team2Name,
            awayTeamShort: match.team2Id?.shortName || team2Name.substring(0, 3).toUpperCase(),
            homeImg: team1Avatar,
            awayImg: team2Avatar,
            homeScore: match.score?.team1 || 0,
            awayScore: match.score?.team2 || 0,
            tournament: eventName,
            stage: round ? `${round}` : 'Match',
            homeScorers: [], // Can be populated from match data if available
            awayScorers: [], // Can be populated from match data if available
            status: 'live',
            minute: formatElapsedTime(elapsed),
            elapsedMinutes: elapsed,
            matchData: match // Keep original match data for reference
          };
        });
        
        setOngoingMatches(transformedMatches);
        
        // Initialize elapsed times
        const times = {};
        transformedMatches.forEach(match => {
          if (match.elapsedMinutes !== null && match.elapsedMinutes !== undefined) {
            times[match.id] = match.elapsedMinutes;
          }
        });
        setElapsedTimes(times);
      } catch (error) {
        console.error('Error fetching ongoing matches:', error);
        message.error('Unable to load ongoing matches');
        setOngoingMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingMatches();
    
    // Refresh every minute to update elapsed time
    const interval = setInterval(() => {
      fetchOngoingMatches();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  // Update elapsed time every second for real-time display
  useEffect(() => {
    if (ongoingMatches.length === 0) return;
    
    const interval = setInterval(() => {
      setElapsedTimes(prev => {
        const updated = { ...prev };
        ongoingMatches.forEach(match => {
          if (match.matchData) {
            const elapsed = calculateElapsedTime(match.matchData);
            if (elapsed !== null) {
              updated[match.id] = elapsed;
            }
          }
        });
        return updated;
      });
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [ongoingMatches]);

  // Fetch upcoming matches from API
  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      try {
        const response = await matchScheduleApi.getAllMatches({ status: 'upcoming' });
        const matchesData = response.data?.data?.allMatches || [];
        
        // Transform API data to match UI format
        const transformedMatches = matchesData.map((match, index) => {
          const team1Name = match.team1Id?.name || match.team1Id?.shortName || 'N/A';
          const team2Name = match.team2Id?.name || match.team2Id?.shortName || 'N/A';
          const team1Avatar = match.team1Id?.avatar || match.team1Id?.logo;
          const team2Avatar = match.team2Id?.avatar || match.team2Id?.logo;
          
          return {
            id: match._id || index + 1,
            homeTeam: team1Name,
            homeTeamShort: match.team1Id?.shortName || team1Name.substring(0, 3).toUpperCase(),
            awayTeam: team2Name,
            awayTeamShort: match.team2Id?.shortName || team2Name.substring(0, 3).toUpperCase(),
            homeImg: team1Avatar,
            awayImg: team2Avatar,
            homeFlag: team1Avatar ? null : '⚪',
            awayFlag: team2Avatar ? null : '🔴',
            date: formatDate(match.matchDate),
            time: match.matchTime || '00:00',
            status: match.status || 'scheduled',
            matchData: match // Keep original match data for reference
          };
        });
        
        setMatches(transformedMatches);
      } catch (error) {
        console.error('Error fetching upcoming matches:', error);
        setMatches([]);
      }
    };

    fetchUpcomingMatches();
  }, []);

  const handleEdit = (match) => {
    setSelectedMatch(match);
    setEditFormData(match);
    setShowEditModal(true);
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowDetailModal(true);
  };

  const handleDelete = (matchId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this match?")) {
      console.log("Delete match:", matchId);
    }
  };

  const handleEditClick = (match, e) => {
    e.stopPropagation();
    handleEdit(match);
  };

  const handleSaveEdit = () => {
    console.log("Save edit:", editFormData);
    setShowEditModal(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(ongoingMatches.length, 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(ongoingMatches.length, 1)) % Math.max(ongoingMatches.length, 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

return (
  <div className="p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-7xl mx-auto transition-colors">
    {/* Featured Matches Slider - Ongoing Matches */}
    {ongoingMatches.length > 0 ? (
      <div className="relative mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {ongoingMatches.map((match, index) => {
            const currentElapsed = elapsedTimes[match.id] !== undefined ? elapsedTimes[match.id] : match.elapsedMinutes;
            const displayMinute = formatElapsedTime(currentElapsed);
            
            return (
          <div key={match.id} className="w-full flex-shrink-0 ">
            <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-6 text-center ">
              {/* Header */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-left text-gray-900 dark:text-white">
                Featured Match
              </h2>

              {/* Subheading */}
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 text-left">
                {match.tournament}
              </p>

              {/* Teams & Score */}
              <div className="flex items-center justify-between text-center py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700">
                {/* Team 1 */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 w-1/3">
                  {match.homeImg ? (
                    <img
                      src={match.homeImg}
                      alt={match.homeTeam}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg ${match.homeImg ? 'hidden' : ''}`}
                  >
                    {(match.homeTeam || 'T').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200 text-center">
                    {match.homeTeam}
                  </span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    <span>{match.homeScore}</span>
                    <span>-</span>
                    <span>{match.awayScore}</span>
                  </div>
                  {/* Live indicator */}
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">LIVE</span>
                  </div>
                </div>

                {/* Team 2 */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 w-1/3">
                  {match.awayImg ? (
                    <img
                      src={match.awayImg}
                      alt={match.awayTeam}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg ${match.awayImg ? 'hidden' : ''}`}
                  >
                    {(match.awayTeam || 'T').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200 text-center">
                    {match.awayTeam}
                  </span>
                </div>
              </div>

              {/* Match Info */}
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 my-2">
                {match.stage}
              </p>

              {/* Scorers */}
              <div className="flex justify-between text-xs sm:text-sm text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                {/* Left scorers */}
                <div className="text-left flex-1">
                  {match.homeScorers && match.homeScorers.length > 0 ? (
                    match.homeScorers.map((scorer, i) => (
                      <p key={i} className="mb-1">{scorer}</p>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs">No goals yet</p>
                  )}
                </div>

                {/* Match minute - Real-time */}
                <div className="flex items-center justify-center text-green-600 dark:text-green-400 text-xs sm:text-sm px-2">
                  <span className="font-bold animate-pulse">{displayMinute}</span>
                </div>

                {/* Right scorers */}
                <div className="text-right flex-1">
                  {match.awayScorers && match.awayScorers.length > 0 ? (
                    match.awayScorers.map((scorer, i) => (
                      <p key={i} className="flex items-center justify-end gap-1 mb-1">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-current"></span> 
                        {scorer}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs">No goals yet</p>
                  )}
                </div>
              </div>

              {/* Watch button */}
              <div className="my-4 sm:my-6">
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition mx-auto text-gray-900 dark:text-gray-100">
                  🔍 Watch live
                </button>
              </div>
            </div>
          </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        {ongoingMatches.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full p-1.5 sm:p-2 shadow-md transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full p-1.5 sm:p-2 shadow-md transition-all z-10"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
              {ongoingMatches.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    ) : (
      <div className="relative mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl overflow-hidden p-6 sm:p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          {loading ? 'Loading ongoing matches...' : 'No ongoing matches at the moment'}
        </p>
      </div>
    )}

    {/* Header */}
    <div className="mb-2 px-3 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Match Schedule
      </h1>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
        Manage upcoming matches
      </p>
    </div>

    {/* Matches Grid - Responsive layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mx-3 sm:mx-6 md:mx-8 lg:mx-12">
      {loading ? (
        <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
          Loading data...
        </div>
      ) : matches.length === 0 ? (
        <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
          No upcoming matches
        </div>
      ) : (
        matches.map((match) => (
        <div
          key={match.id}
          className="group bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500"
          onClick={() => handleMatchClick(match)}
        >
          <div className="flex items-center justify-between">
            {/* Left side - Teams stacked vertically */}
            <div className="flex-1">
              {/* Home Team */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {match.homeImg ? (
                    <img
                      src={match.homeImg}
                      alt={match.homeTeam}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {match.homeFlag && (
                    <span className="text-lg" style={{ display: match.homeImg ? 'none' : 'flex' }}>
                      {match.homeFlag}
                    </span>
                  )}
                  {!match.homeImg && !match.homeFlag && (
                    <span className="text-xs font-bold text-gray-500" style={{ display: 'flex' }}>
                      {(match.homeTeam || 'T').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                  {match.homeTeam}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {match.awayImg ? (
                    <img
                      src={match.awayImg}
                      alt={match.awayTeam}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {match.awayFlag && (
                    <span className="text-lg" style={{ display: match.awayImg ? 'none' : 'flex' }}>
                      {match.awayFlag}
                    </span>
                  )}
                  {!match.awayImg && !match.awayFlag && (
                    <span className="text-xs font-bold text-gray-500" style={{ display: 'flex' }}>
                      {(match.awayTeam || 'T').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                  {match.awayTeam}
                </span>
              </div>
            </div>
            
            <hr className="w-px h-16 sm:h-20 bg-gray-300 dark:bg-gray-600 mx-3 sm:mx-4" />

            {/* Right side - Date & Time */}
            <div className="text-right mr-2 sm:mr-3">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                {match.date}
              </div>
              <div className="text-gray-900 dark:text-white font-bold text-sm sm:text-base">
                {match.time}
              </div>
            </div>

            {/* Action Buttons - Always visible on mobile, hover on desktop */}
            <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 ml-2">
              <button
                onClick={(e) => handleEditClick(match, e)}
                className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 p-2 sm:p-1"
                title="Edit"
              >
                <Edit className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={(e) => handleDelete(match.id, e)}
                className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 p-2 sm:p-1"
                title="Delete"
              >
                <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
        ))
      )}
    </div>

    {/* Edit Modal */}
    <Modal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      title="Edit Match"
    >
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Home Team
          </label>
          <input
            type="text"
            value={editFormData.homeTeam || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, homeTeam: e.target.value })
            }
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Away Team
          </label>
          <input
            type="text"
            value={editFormData.awayTeam || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, awayTeam: e.target.value })
            }
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Match Date
          </label>
          <input
            type="text"
            value={editFormData.date || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, date: e.target.value })
            }
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Match Time
          </label>
          <input
            type="time"
            value={editFormData.time || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, time: e.target.value })
            }
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors order-1 sm:order-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </Modal>

    {/* Detail Modal */}
    <Modal
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
      title="Match Details"
    >
      {selectedMatch && (
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg sm:text-2xl">{selectedMatch.homeFlag}</span>
                </div>
                <div className="font-semibold text-sm sm:text-base text-gray-900">
                  {selectedMatch.homeTeam}
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg sm:text-2xl">{selectedMatch.awayFlag}</span>
                </div>
                <div className="font-semibold text-sm sm:text-base text-gray-900">
                  {selectedMatch.awayTeam}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Date:</span>
                <div className="text-gray-900">{selectedMatch.date}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Time:</span>
                <div className="text-gray-900">{selectedMatch.time}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <div className="text-gray-900">Upcoming</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <div className="text-gray-900">#{selectedMatch.id}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  </div>
);
};

export default MatchOverview;