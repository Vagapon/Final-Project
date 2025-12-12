import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Save, X, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { rankingApi, matchScheduleApi, eventApi } from '../../api';
import { message } from 'antd';

const Formation = ({ availablePlayers = [], onAddPlayer, team }) => {
  const [selectedPlayerCount, setSelectedPlayerCount] = useState('11');
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [fieldPlayers, setFieldPlayers] = useState({});
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: 'CF', number: '' });
  
  // Rankings and matches state
  const [rankings, setRankings] = useState([]);
  const [teamMatches, setTeamMatches] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [teamEvents, setTeamEvents] = useState([]);

  const formations = useMemo(() => ({
    '5': {
      '3-1-1': [
        { id: 'gk', position: 'GK', x: 50, y: 85 },
        { id: 'cb1', position: 'CB', x: 25, y: 60 },
        { id: 'cb2', position: 'CB', x: 50, y: 60 },
        { id: 'cb3', position: 'CB', x: 75, y: 60 },
        { id: 'cm', position: 'CM', x: 50, y: 40 },
        { id: 'cf', position: 'CF', x: 50, y: 20 }
      ],
      '2-2-1': [
        { id: 'gk', position: 'GK', x: 50, y: 85 },
        { id: 'cb1', position: 'CB', x: 35, y: 65 },
        { id: 'cb2', position: 'CB', x: 65, y: 65 },
        { id: 'cm1', position: 'CM', x: 35, y: 40 },
        { id: 'cm2', position: 'CM', x: 65, y: 40 },
        { id: 'cf', position: 'CF', x: 50, y: 20 }
      ]
    },
    '7': {
      '3-2-2': [
        { id: 'gk', position: 'GK', x: 50, y: 90 },
        { id: 'cb1', position: 'CB', x: 25, y: 70 },
        { id: 'cb2', position: 'CB', x: 50, y: 70 },
        { id: 'cb3', position: 'CB', x: 75, y: 70 },
        { id: 'cm1', position: 'CM', x: 35, y: 45 },
        { id: 'cm2', position: 'CM', x: 65, y: 45 },
        { id: 'cf1', position: 'CF', x: 35, y: 20 },
        { id: 'cf2', position: 'CF', x: 65, y: 20 }
      ],
      '2-3-2': [
        { id: 'gk', position: 'GK', x: 50, y: 90 },
        { id: 'cb1', position: 'CB', x: 35, y: 70 },
        { id: 'cb2', position: 'CB', x: 65, y: 70 },
        { id: 'cm1', position: 'CM', x: 25, y: 45 },
        { id: 'cm2', position: 'CM', x: 50, y: 45 },
        { id: 'cm3', position: 'CM', x: 75, y: 45 },
        { id: 'cf1', position: 'CF', x: 35, y: 20 },
        { id: 'cf2', position: 'CF', x: 65, y: 20 }
      ]
    },
    '11': {
      '4-4-2': [
        { id: 'gk', position: 'GK', x: 50, y: 90 },
        { id: 'lb', position: 'LB', x: 15, y: 70 },
        { id: 'cb1', position: 'CB', x: 35, y: 70 },
        { id: 'cb2', position: 'CB', x: 65, y: 70 },
        { id: 'rb', position: 'RB', x: 85, y: 70 },
        { id: 'lm', position: 'LM', x: 15, y: 45 },
        { id: 'cm1', position: 'CM', x: 35, y: 45 },
        { id: 'cm2', position: 'CM', x: 65, y: 45 },
        { id: 'rm', position: 'RM', x: 85, y: 45 },
        { id: 'cf1', position: 'CF', x: 35, y: 20 },
        { id: 'cf2', position: 'CF', x: 65, y: 20 }
      ],
      '4-3-3': [
        { id: 'gk', position: 'GK', x: 50, y: 90 },
        { id: 'lb', position: 'LB', x: 15, y: 70 },
        { id: 'cb1', position: 'CB', x: 35, y: 70 },
        { id: 'cb2', position: 'CB', x: 65, y: 70 },
        { id: 'rb', position: 'RB', x: 85, y: 70 },
        { id: 'cm1', position: 'CM', x: 25, y: 45 },
        { id: 'cm2', position: 'CM', x: 50, y: 45 },
        { id: 'cm3', position: 'CM', x: 75, y: 45 },
        { id: 'lw', position: 'LW', x: 20, y: 20 },
        { id: 'cf', position: 'CF', x: 50, y: 20 },
        { id: 'rw', position: 'RW', x: 80, y: 20 }
      ]
    }
  }), []);

  const currentFormation = formations[selectedPlayerCount][selectedFormation] || [];

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.number) return;
    const player = {
      id: Date.now(),
      name: newPlayer.name,
      position: newPlayer.position,
      number: parseInt(newPlayer.number)
    };
    onAddPlayer?.(player);
    setNewPlayer({ name: '', position: 'CF', number: '' });
    setIsAddingPlayer(false);
  };

  const handleDragStart = (e, player) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(player));
  };

  const handleDrop = (e, fieldPosition) => {
    e.preventDefault();
    const playerData = JSON.parse(e.dataTransfer.getData('text/plain'));
    setFieldPlayers(prev => ({
      ...prev,
      [fieldPosition.id]: playerData
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removePlayerFromField = (positionId) => {
    setFieldPlayers(prev => {
      const newPlayers = { ...prev };
      delete newPlayers[positionId];
      return newPlayers;
    });
  };

  // Fetch events that team has joined (by checking rankings and matches)
  const fetchTeamEvents = async () => {
    if (!team?._id) return;
    
    try {
      // Get all events
      const eventsResponse = await eventApi.getAllEvents();
      const allEvents = eventsResponse.data?.data || [];
      
      const eventIdsSet = new Set();
      
      // Method 1: Get events from rankings
      try {
        const rankingsResponse = await rankingApi.getAllRankings();
        const allRankings = rankingsResponse.data?.data || [];
        
        const teamRankings = allRankings.filter(ranking => {
          const rankingTeamId = ranking.teamId?._id || ranking.teamId;
          return rankingTeamId === team._id;
        });
        
        teamRankings.forEach(r => {
          const eventId = r.eventId?._id || r.eventId;
          if (eventId) eventIdsSet.add(eventId.toString());
        });
      } catch (err) {
        console.error('Error fetching rankings for events:', err);
      }
      
      // Method 2: Get events from matches (team may have matches but no ranking yet)
      try {
        // Get all matches and find events where team has matches
        for (const event of allEvents) {
          try {
            const matchesResponse = await matchScheduleApi.getEventMatches(event._id, { teamId: team._id });
            const matches = matchesResponse.data?.data || matchesResponse.data || [];
            let hasMatches = false;
            
            if (Array.isArray(matches) && matches.length > 0) {
              hasMatches = true;
            } else if (matches.matchesByRound) {
              // Check if any round has matches
              hasMatches = Object.values(matches.matchesByRound).some(roundMatches => 
                Array.isArray(roundMatches) && roundMatches.length > 0
              );
            }
            
            if (hasMatches) {
              eventIdsSet.add(event._id?.toString());
            }
          } catch (err) {
            // Skip events that error (may not have matches endpoint or permission)
            console.debug(`Could not fetch matches for event ${event._id}:`, err.message);
          }
        }
      } catch (err) {
        console.error('Error fetching matches for events:', err);
      }
      
      // Get events that team is participating in
      const participatingEvents = allEvents.filter(event => 
        eventIdsSet.has(event._id?.toString())
      );
      
      // Transform to match expected format
      const events = participatingEvents.map(event => ({
        _id: event._id,
        name: event.name,
        startDate: event.startDate,
        status: event.status,
        location: event.location || event.address
      }));
      
      setTeamEvents(events);
      
      // Auto-select first event if no event is selected or selected event is not in the list
      if (events.length > 0) {
        if (selectedEvent === 'all' || !events.find(e => e._id === selectedEvent)) {
          setSelectedEvent(events[0]._id);
        }
      } else {
        setSelectedEvent('all');
      }
    } catch (error) {
      console.error('Error fetching team events:', error);
      setTeamEvents([]);
    }
  };

  // Fetch rankings for selected event
  const fetchRankings = async () => {
    if (!team?._id || !selectedEvent || selectedEvent === 'all') {
      setRankings([]);
      return;
    }
    
    setLoadingRankings(true);
    try {
      const response = await rankingApi.getRankingByEvent(selectedEvent);
      const rankingsData = response.data?.data || [];
      
      // Transform and filter to show only current team's ranking
      const transformedData = rankingsData
        .map((ranking, index) => {
          const teamData = ranking.teamId || {};
          const eventData = ranking.eventId || {};
          
          // Check if this ranking belongs to current team
          const isCurrentTeam = teamData._id === team._id || teamData === team._id;
          
          return {
            id: ranking._id || index + 1,
            team: teamData.name || teamData.shortName || 'N/A',
            img: teamData.avatar || teamData.logo,
            event: eventData._id || eventData,
            eventName: eventData.name,
            mp: (ranking.win || 0) + (ranking.draw || 0) + (ranking.loss || 0),
            w: ranking.win || 0,
            d: ranking.draw || 0,
            l: ranking.loss || 0,
            gf: ranking.gf || 0,
            ga: ranking.ga || 0,
            gd: ranking.gd || 0,
            pts: ranking.point || 0,
            form: ranking.form || [],
            isCurrentTeam
          };
        })
        .sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });
      
      setRankings(transformedData);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      message.error('Unable to load rankings');
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  };

  // Fetch matches for team
  const fetchTeamMatches = async () => {
    if (!team?._id) {
      setTeamMatches([]);
      return;
    }
    
    setLoadingMatches(true);
    try {
      // Get all events first
      const eventsResponse = await eventApi.getAllEvents();
      const allEvents = eventsResponse.data?.data || [];
      
      // Also get events from rankings (for events that have rankings)
      const eventIdsSet = new Set();
      try {
        const rankingsResponse = await rankingApi.getAllRankings();
        const allRankings = rankingsResponse.data?.data || [];
        
        const teamRankings = allRankings.filter(ranking => {
          const rankingTeamId = ranking.teamId?._id || ranking.teamId;
          return rankingTeamId === team._id;
        });
        
        teamRankings.forEach(r => {
          const eventId = r.eventId?._id || r.eventId;
          if (eventId) eventIdsSet.add(eventId.toString());
        });
      } catch (err) {
        console.error('Error fetching rankings:', err);
      }
      
      // Add all event IDs to check
      allEvents.forEach(event => {
        if (event._id) eventIdsSet.add(event._id.toString());
      });
      
      if (eventIdsSet.size === 0) {
        setTeamMatches([]);
        setLoadingMatches(false);
        return;
      }
      
      // Fetch matches from each event with teamId filter
      const allMatches = [];
      for (const eventId of eventIdsSet) {
        try {
          const response = await matchScheduleApi.getEventMatches(eventId, { teamId: team._id });
          const matches = response.data?.data || response.data || [];
          
          if (Array.isArray(matches)) {
            // Filter matches where team is team1Id or team2Id
            const teamMatches = matches.filter(match => {
              const team1Id = match.team1Id?._id || match.team1Id;
              const team2Id = match.team2Id?._id || match.team2Id;
              return team1Id === team._id || team2Id === team._id;
            });
            allMatches.push(...teamMatches);
          } else if (matches.matchesByRound) {
            // If matches are grouped by round, flatten them
            Object.values(matches.matchesByRound).forEach(roundMatches => {
              if (Array.isArray(roundMatches)) {
                const teamMatches = roundMatches.filter(match => {
                  const team1Id = match.team1Id?._id || match.team1Id;
                  const team2Id = match.team2Id?._id || match.team2Id;
                  return team1Id === team._id || team2Id === team._id;
                });
                allMatches.push(...teamMatches);
              }
            });
          }
        } catch (err) {
          // Skip events that error (may not have matches or permission)
          console.debug(`Error fetching matches for event ${eventId}:`, err.message);
        }
      }
      
      // Sort by date (newest first)
      allMatches.sort((a, b) => {
        const dateA = new Date(a.matchDate || a.date || 0);
        const dateB = new Date(b.matchDate || b.date || 0);
        return dateB - dateA;
      });
      
      setTeamMatches(allMatches);
    } catch (error) {
      console.error('Error fetching team matches:', error);
      message.error('Unable to load matches');
      setTeamMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (team?._id) {
      fetchTeamEvents();
      fetchTeamMatches();
    }
  }, [team?._id]);

  useEffect(() => {
    if (selectedEvent && selectedEvent !== 'all' && team?._id) {
      fetchRankings();
    } else {
      setRankings([]);
    }
  }, [selectedEvent, team?._id]);

  // Render form indicators
  const renderForm = (form) => {
    if (!form || form.length === 0) return <span className="text-xs text-gray-400">No matches</span>;
    return form.map((result, index) => (
      <div
        key={index}
        className={`w-5 h-5 rounded-full text-xs font-semibold text-white flex items-center justify-center ${
          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-gray-400' : 'bg-red-500'
        }`}
        title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
      >
        {result === 'W' ? '✓' : result === 'D' ? '−' : '✗'}
      </div>
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Formation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
          <select
            value={selectedPlayerCount}
            onChange={(e) => {
              setSelectedPlayerCount(e.target.value);
              setSelectedFormation(Object.keys(formations[e.target.value])[0]);
              setFieldPlayers({});
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="5">Sân 5 người</option>
            <option value="7">Sân 7 người</option>
            <option value="11">Sân 11 người</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Formation</label>
          <select
            value={selectedFormation}
            onChange={(e) => {
              setSelectedFormation(e.target.value);
              setFieldPlayers({});
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {Object.keys(formations[selectedPlayerCount]).map(formation => (
              <option key={formation} value={formation}>{formation}</option>
            ))}
          </select>
        </div>

        <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          Kéo thả cầu thủ từ danh sách vào sân để xếp đội hình
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="relative rounded-xl aspect-[3/4] max-w-md mx-auto border-4 border-white shadow-xl overflow-hidden"
             style={{
               backgroundImage: 'linear-gradient(180deg, rgba(16,185,129,0.85), rgba(16,185,129,1))'
             }}>
          <div className="absolute inset-2 border-2 border-white/80 rounded">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80"></div>
            <div className="absolute top-0 left-1/4 right-1/4 h-8 border-2 border-white border-t-0"></div>
            <div className="absolute bottom-0 left-1/4 right-1/4 h-8 border-2 border-white border-b-0"></div>
          </div>

          {currentFormation.map((position) => (
            <div
              key={position.id}
              className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onDrop={(e) => handleDrop(e, position)}
              onDragOver={handleDragOver}
            >
              {fieldPlayers[position.id] ? (
                <div className="relative group">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg">
                    {fieldPlayers[position.id].number}
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {fieldPlayers[position.id].name}
                  </div>
                  <button
                    onClick={() => removePlayerFromField(position.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center text-gray-700 font-bold text-xs border-2 border-dashed border-white">
                  {position.position}
                </div>
              )}
            </div>
          ))}

          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            Formation: {selectedFormation} | {Object.keys(fieldPlayers).length}/{selectedPlayerCount} positions
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Cầu thủ</h3>
          <button
            onClick={() => setIsAddingPlayer(true)}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors text-sm shadow"
          >
            <Plus size={16} />
            <span>Thêm</span>
          </button>
        </div>

        {isAddingPlayer && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 border">
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-2 py-2 border rounded text-sm"
            />
            <div className="flex gap-2">
              <select
                value={newPlayer.position}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                className="flex-1 px-2 py-2 border rounded text-sm"
              >
                {['GK','CB','LB','RB','CM','LM','RM','LW','RW','CF'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Số"
                value={newPlayer.number}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, number: e.target.value }))}
                className="w-20 px-2 py-2 border rounded text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddPlayer}
                className="flex-1 bg-green-500 text-white px-2 py-2 rounded text-sm hover:bg-green-600"
              >
                <Save size={12} className="inline mr-1" />
                Save
              </button>
              <button
                onClick={() => setIsAddingPlayer(false)}
                className="flex-1 bg-gray-500 text-white px-2 py-2 rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {availablePlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No players available. Add players from the Players tab.
            </div>
          ) : (
            availablePlayers.map((player) => (
              <div
                key={player.id || player._id}
                draggable
                onDragStart={(e) => handleDragStart(e, player)}
                className="flex items-center gap-3 p-2 bg-white rounded-lg border cursor-move hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow">
                  {player.number || '?'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">{player.name || 'Unnamed'}</div>
                  <div className="text-xs text-gray-500">{player.position || 'N/A'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>

      {/* Rankings Section */}
      {team && teamEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Team Rankings
            </h2>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              {teamEvents.map(event => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {loadingRankings ? (
            <div className="text-center py-8 text-gray-500">Loading rankings...</div>
          ) : selectedEvent === 'all' ? (
            <div className="text-center py-8 text-gray-500">Please select an event to view rankings</div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No rankings available for this event</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pos</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Team</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">MP</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">W</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">D</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">L</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">GF</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">GA</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">GD</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">Pts</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rankings.map((ranking, index) => (
                    <tr
                      key={ranking.id}
                      className={`hover:bg-gray-50 ${ranking.isCurrentTeam ? 'bg-green-50 font-semibold' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {ranking.img ? (
                            <img
                              src={ranking.img}
                              alt={ranking.team}
                              className="w-6 h-6 object-contain rounded-full"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                              {(ranking.team || 'T').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{ranking.team}</span>
                          {ranking.isCurrentTeam && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Your Team</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">{ranking.mp}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">{ranking.w}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">{ranking.d}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">{ranking.l}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">{ranking.gf}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">{ranking.ga}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {ranking.gd > 0 ? '+' : ''}{ranking.gd}
                      </td>
                      <td className="px-3 py-3 text-center text-sm font-bold text-gray-900">{ranking.pts}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {renderForm(ranking.form)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Matches Section */}
      {team && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Team Matches
            </h2>
          </div>

          {loadingMatches ? (
            <div className="text-center py-8 text-gray-500">Loading matches...</div>
          ) : teamMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No matches found for this team</div>
          ) : (
            <div className="space-y-3">
              {teamMatches.map((match) => {
                const team1 = match.team1Id || {};
                const team2 = match.team2Id || {};
                const event = match.eventId || {};
                const isTeam1 = (team1._id || team1) === team._id;
                const opponent = isTeam1 ? team2 : team1;
                const opponentName = opponent.name || opponent.shortName || 'TBD';
                const opponentAvatar = opponent.avatar || opponent.logo;
                const teamScore = isTeam1 ? (match.score?.team1 || 0) : (match.score?.team2 || 0);
                const opponentScore = isTeam1 ? (match.score?.team2 || 0) : (match.score?.team1 || 0);
                const hasScore = match.score && (match.score.team1 !== undefined || match.score.team2 !== undefined);
                
                // Determine match result for current team
                let result = '';
                if (hasScore && match.status === 'completed') {
                  if (teamScore > opponentScore) result = 'W';
                  else if (teamScore < opponentScore) result = 'L';
                  else result = 'D';
                }

                return (
                  <div
                    key={match._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center min-w-[80px]">
                        <div className="text-xs text-gray-500">{formatDate(match.matchDate || match.date)}</div>
                        <div className="text-xs text-gray-400">{formatTime(match.matchDate || match.date)}</div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-semibold text-gray-900">{team.name || team.shortName}</span>
                          {team.avatar && (
                            <img
                              src={team.avatar}
                              alt={team.name}
                              className="w-8 h-8 object-contain rounded-full"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 px-4">
                          {hasScore ? (
                            <>
                              <span className={`text-lg font-bold ${result === 'W' ? 'text-green-600' : result === 'L' ? 'text-red-600' : 'text-gray-600'}`}>
                                {teamScore}
                              </span>
                              <span className="text-gray-400">-</span>
                              <span className="text-lg font-bold text-gray-600">{opponentScore}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">VS</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1">
                          {opponentAvatar && (
                            <img
                              src={opponentAvatar}
                              alt={opponentName}
                              className="w-8 h-8 object-contain rounded-full"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="font-semibold text-gray-900">{opponentName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      {event.name && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {event.name}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        match.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                        match.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                        match.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {match.status || 'TBD'}
                      </span>
                      {result && (
                        <span className={`w-6 h-6 rounded-full text-xs font-semibold text-white flex items-center justify-center ${
                          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-gray-400' : 'bg-red-500'
                        }`}>
                          {result === 'W' ? '✓' : result === 'D' ? '−' : '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Formation;


