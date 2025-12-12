import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, TrendingUp } from 'lucide-react';
import { rankingApi, seasonApi, eventApi } from '../../../api';
import { message } from 'antd';

const Ranking = () => {
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Dữ liệu thực từ API
  const [seasons, setSeasons] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([
    { 
      id: 1, 
      team: 'Arsenal', 
      img: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/800px-Arsenal_FC.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 9, 
      d: 0, 
      l: 1, 
      gf: 24, 
      ga: 10, 
      gd: 14, 
      pts: 27, 
      form: ['W', 'W', 'W', 'W', 'L'] 
    },
    { 
      id: 2, 
      team: 'Man City', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/1/1d/Manchester_City_FC_logo.svg/2048px-Manchester_City_FC_logo.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 7, 
      d: 2, 
      l: 1, 
      gf: 33, 
      ga: 10, 
      gd: 23, 
      pts: 23, 
      form: ['L', 'W', 'W', 'W', 'D'] 
    },
    { 
      id: 3, 
      team: 'Tottenham', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/b/bd/Tottenham_Hotspur_FC.svg/1200px-Tottenham_Hotspur_FC.svg.png', 
      event: 'premier-league', 
      mp: 11, 
      w: 7, 
      d: 2, 
      l: 2, 
      gf: 22, 
      ga: 12, 
      gd: 10, 
      pts: 23, 
      form: ['L', 'W', 'W', 'L', 'W'] 
    },
    { 
      id: 4, 
      team: 'Chelsea', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/5/5c/Chelsea_crest.svg/1200px-Chelsea_crest.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 6, 
      d: 2, 
      l: 2, 
      gf: 15, 
      ga: 10, 
      gd: 5, 
      pts: 20, 
      form: ['D', 'W', 'W', 'W', 'W'] 
    },
    { 
      id: 5, 
      team: 'Man United', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/a/a1/Man_Utd_FC_.svg/2021px-Man_Utd_FC_.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 6, 
      d: 1, 
      l: 3, 
      gf: 15, 
      ga: 15, 
      gd: 0, 
      pts: 19, 
      form: ['W', 'D', 'W', 'L', 'W'] 
    },
    { 
      id: 6, 
      team: 'Newcastle', 
      img: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png', 
      event: 'premier-league', 
      mp: 11, 
      w: 4, 
      d: 6, 
      l: 1, 
      gf: 18, 
      ga: 9, 
      gd: 9, 
      pts: 18, 
      form: ['W', 'D', 'W', 'W', 'D'] 
    },
    { 
      id: 7, 
      team: 'Liverpool', 
      img: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/800px-Liverpool_FC.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 4, 
      d: 4, 
      l: 2, 
      gf: 22, 
      ga: 12, 
      gd: 10, 
      pts: 16, 
      form: ['W', 'W', 'L', 'D', 'D'] 
    },
    { 
      id: 8, 
      team: 'Brighton', 
      img: 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/1200px-Brighton_%26_Hove_Albion_logo.svg.png', 
      event: 'premier-league', 
      mp: 10, 
      w: 4, 
      d: 3, 
      l: 3, 
      gf: 14, 
      ga: 11, 
      gd: 3, 
      pts: 15, 
      form: ['D', 'L', 'L', 'D', 'W'] 
    }
  ]);

  // Fetch seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await seasonApi.getAllSeasons();
        const seasonsData = response.data?.data || [];
        setSeasons(seasonsData);
        if (seasonsData.length > 0 && !selectedSeason) {
          setSelectedSeason(seasonsData[0]._id);
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };
    fetchSeasons();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getAllEvents();
        const eventsData = response.data?.data || [];
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on selected season
  useEffect(() => {
    if (selectedSeason && events.length > 0) {
      const filtered = events.filter(event => {
        // Check if event has seasonId matching selectedSeason
        const eventSeasonId = event.seasonId?._id || event.seasonId;
        return eventSeasonId === selectedSeason;
      });
      setFilteredEvents(filtered);
      
      // Reset selectedEvent if current selection is not in filtered list
      if (selectedEvent !== 'all' && !filtered.find(e => e._id === selectedEvent)) {
        setSelectedEvent('all');
      }
    } else {
      setFilteredEvents([]);
      // Reset to 'all' when no season is selected
      if (selectedEvent !== 'all') {
        setSelectedEvent('all');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason, events]);

  // Fetch rankings
  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedSeason) return;
      
      setLoading(true);
      try {
        const params = { seasonId: selectedSeason };
        if (selectedEvent !== 'all') {
          params.eventId = selectedEvent;
        }
        
        const response = await rankingApi.getAllRankings(params);
        const rankingsData = response.data?.data || [];
        
        // Transform API data to match UI format
        const transformedData = rankingsData.map((ranking, index) => {
          const team = ranking.teamId || {};
          const event = ranking.eventId || {};
          
          return {
            id: ranking._id || index + 1,
            team: team.name || team.shortName || 'N/A',
            img: team.avatar || team.logo,
            event: event._id || event,
            eventName: event.name,
            mp: (ranking.win || 0) + (ranking.draw || 0) + (ranking.loss || 0),
            w: ranking.win || 0,
            d: ranking.draw || 0,
            l: ranking.loss || 0,
            gf: ranking.gf || 0,
            ga: ranking.ga || 0,
            gd: ranking.gd || 0,
            pts: ranking.point || 0,
            form: ranking.form || [] // Form từ API
          };
        });
        
        // Sort by points, goal difference, goals for
        transformedData.sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });
        
        setLeaderboardData(transformedData);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        message.error('Unable to load rankings');
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [selectedSeason, selectedEvent]);

  // Filter dữ liệu
  const filteredData = leaderboardData.filter(team => {
    const matchesEvent = selectedEvent === 'all' || team.event === selectedEvent || team.event?.toString() === selectedEvent;
    const matchesSearch = team.team.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  // Hàm để hiển thị form gần đây
  const renderForm = (form) => {
    return form.map((result, index) => (
      <div
        key={index}
        className={`w-6 h-6 rounded-full text-xs font-semibold text-white flex items-center justify-center ${
          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-gray-400' : 'bg-red-500'
        }`}
        title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
      >
        {result === 'W' ? '✓' : result === 'D' ? '−' : '✗'}
      </div>
    ));
  };

  return (
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 lg:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Football Rankings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Manage and track tournament rankings</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Season Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Season
              </label>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(e.target.value);
                    // Reset event filter when season changes
                    setSelectedEvent('all');
                  }}
                  className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-blue-600 dark:text-blue-400 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors duration-300"
                >
                  {seasons.length === 0 ? (
                    <option value="">Loading seasons...</option>
                  ) : (
                    seasons.map(season => (
                      <option key={season._id} value={season._id}>
                        {season.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 dark:text-blue-400 pointer-events-none" />
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Event Type
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={!selectedSeason || filteredEvents.length === 0}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">All Events</option>
                {selectedSeason ? (
                  filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                      <option key={event._id} value={event._id}>
                        {event.name || event.title}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No events in this season</option>
                  )
                ) : (
                  <option value="" disabled>Please select a season first</option>
                )}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Enter team name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors duration-300"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Club</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">MP</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">W</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">D</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">L</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">GF</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">GA</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">GD</th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pts</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last 5</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading rankings...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No rankings found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((team, index) => (
                  <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 mr-3">
                          <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">{index + 1}</span>
                        </div>
                        <div className="flex items-center">
                            {team.img ? (
                              <img 
                                src={team.img} 
                                alt={`${team.team} logo`}
                                className="w-6 h-6 mr-3 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.nextElementSibling;
                                  if (fallback) fallback.style.display = 'inline-block';
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-6 h-6 mr-3 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                              style={{ display: team.img ? 'none' : 'inline-block' }}
                            >
                              {(team.team || 'T').charAt(0).toUpperCase()}
                            </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{team.team}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">{team.mp}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">{team.w}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">{team.d}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">{team.l}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">{team.gf}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100">{team.ga}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <span className={team.gd >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-gray-100'}>
                        {team.gd > 0 ? '+' : ''}{team.gd}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900 dark:text-white">{team.pts}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-1">
                        {team.form && team.form.length > 0 ? renderForm(team.form) : (
                          <span className="text-xs text-gray-400">No matches</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tablet Table */}
        <div className="hidden md:block lg:hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Club</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">MP</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">W</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">D</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">L</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">GD</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Pts</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Form</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      Loading rankings...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      No rankings found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((team, index) => (
                  <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">{index + 1}</span>
                        {team.img ? (
                          <img 
                            src={team.img} 
                            alt={`${team.team} logo`}
                            className="w-6 h-6 mr-2 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.style.display = 'inline-block';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-6 h-6 mr-2 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                          style={{ display: team.img ? 'none' : 'inline-block' }}
                        >
                          {(team.team || 'T').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{team.team}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-gray-100">{team.mp}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-gray-100">{team.w}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-gray-100">{team.d}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-gray-100">{team.l}</td>
                    <td className="px-3 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                      {team.gd > 0 ? '+' : ''}{team.gd}
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">{team.pts}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-1">
                        {team.form && team.form.length > 0 ? renderForm(team.form.slice(-3)) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {filteredData.map((team, index) => (
            <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3">{index + 1}</span>
                  <span className="text-xl mr-2">{team.logo}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{team.team}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{team.pts}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Pts</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-3 text-center">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{team.mp}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">MP</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{team.w}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">W</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{team.d}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">D</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{team.l}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">L</div>
                </div>
              </div>

              {/* Goals and Form */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">GF: <span className="font-medium text-gray-900 dark:text-gray-100">{team.gf}</span></span>
                  <span className="text-gray-600 dark:text-gray-400">GA: <span className="font-medium text-gray-900 dark:text-gray-100">{team.ga}</span></span>
                  <span className="text-gray-600 dark:text-gray-400">GD: <span className="font-medium text-gray-900 dark:text-gray-100">{team.gd > 0 ? '+' : ''}{team.gd}</span></span>
                </div>
                <div className="flex space-x-1">
                  {team.form && team.form.length > 0 ? renderForm(team.form.slice(-3)) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-300">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try changing filters or search keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;