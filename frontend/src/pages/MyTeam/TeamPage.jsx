import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import Formation from './Formation';
import PlayerList from './PlayerList';
import TeamInfo from './TeamInfo';
import ModalTeam from './ModalTeam';
import PlayerModal from './PlayerModal';
import PlayerProfileModal from './PlayerProfileModal';
import teamApi from '../../api/teamManagement/teamApi';
import memberApi from '../../api/memberManagement/memberApi';

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState('formation');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [profilePlayer, setProfilePlayer] = useState(null);


  useEffect(() => {
    if (team?._id) {
      fetchTeamPlayers();
    }
  }, [team?._id]);

  // Add function to fetch team players
  const fetchTeamPlayers = async () => {
    try {
      const response = await memberApi.getTeamMembers(team._id);
      const raw = response.data?.data || response.data || [];
      const normalized = raw.map((p) => ({
        ...p,
        id: p._id || p.id, // Ensure id field exists
        name: p.name ?? p.nameMember ?? '',
        number: p.number ?? p.jerseyNumber ?? 0,
        position: p.position ?? p.preferredPosition ?? 'CF', // Default position
        avatar: p.avatar ?? '',
      }));
      setAvailablePlayers(normalized);
    } catch (error) {
      console.error("Error fetching players:", error.response?.data || error.message);
      setAvailablePlayers([]); // Set empty array on error
    }
  };

  const handleAddPlayer = async (playerData) => {
    try {
      const hasFile = Boolean(playerData?.avatarFile);
      let body;

      if (hasFile) {
        body = new FormData();
        body.append('teamId', team._id);
        body.append('nameMember', playerData.nameMember);
        body.append('number', playerData.number);
        body.append('isCaptain', playerData.isCaptain);
        body.append('avatar', playerData.avatarFile);
      } else {
        body = {
          teamId: team._id,
          nameMember: playerData.nameMember,
          number: playerData.number,
          isCaptain: playerData.isCaptain,
          avatar: playerData.avatar || ''
        };
      }

      const response = await memberApi.createMember(body);

      if (response.data?.success || response.status === 201) {
        await fetchTeamPlayers();
        setIsPlayerModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding player:", error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to add player');
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const handleDeletePlayer = async (player) => {
    if (!window.confirm(`Delete ${player.name}?`)) return;
    try {
      await memberApi.deleteMember(player._id);
      await fetchTeamPlayers();
    } catch (error) {
      console.error("Delete player error:", error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleUpsertPlayer = async (playerData) => {
    // Decide create or update based on editingPlayer
    if (editingPlayer) {
      try {
        const hasFile = Boolean(playerData?.avatarFile);
        let body;

        if (hasFile) {
          body = new FormData();
          body.append('nameMember', playerData.nameMember);
          body.append('number', playerData.number);
          body.append('isCaptain', playerData.isCaptain);
          if (playerData.avatarFile) body.append('avatar', playerData.avatarFile);
        } else {
          body = {
            nameMember: playerData.nameMember,
            number: playerData.number,
            isCaptain: playerData.isCaptain,
            avatar: playerData.avatar || ''
          };
        }

        await memberApi.updateMember(editingPlayer._id, body);
        await fetchTeamPlayers();
        setEditingPlayer(null);
        setIsPlayerModalOpen(false);
      } catch (error) {
        console.error("Update player error:", error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to update');
      }
      return;
    }

    // Create flow
    await handleAddPlayer(playerData);
  };

  // 🟢 Gọi API lấy team của user hiện tại
  const fetchMyTeam = async () => {
    try {
      // Debug: Check if user is logged in
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      // console.log('🔍 Debug - Token exists:', !!token);
      // console.log('🔍 Debug - User exists:', !!user);
      // console.log('🔍 Debug - User data:', user ? JSON.parse(user) : null);
      
      const response = await teamApi.getMyTeam();
      if (response.data) {
        setTeam(response.data);
        // console.log('✅ Team loaded successfully:', response.data.name);
      } else {
        console.log('ℹ️ No team data in response');
        setTeam(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('ℹ️ User has no team yet - this is normal for new users');
        setTeam(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('🔐 Authentication error - user may need to login again');
        setTeam(null);
      } else {
        console.error("❌ Fetch team error details:", {
          status: err.response?.status,
          message: err.response?.data?.message,
          url: err.config?.url,
          headers: err.config?.headers
        });
        console.error("❌ Fetch team error:", err);
        setTeam(null);
      }
    }
  };

  useEffect(() => {
    fetchMyTeam(); // load khi mở trang
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto pt-6">

        <div className="bg-white rounded-lg mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('formation')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'formation'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Formation
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'players'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Players
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Team Info
              </button>
            </nav>
          </div>

          <div className="p-6">
            {!team ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="text-2xl font-semibold text-gray-800">No Team Yet</div>
                <div className="text-gray-600 max-w-md">Create your team to manage formations, player lists, and team information.</div>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="mt-2 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create Team
                </button>
              </div>
            ) : (
              <>
    {activeTab === 'players' && (
                <PlayerList
                  players={availablePlayers}
                  onAddClick={() => { setEditingPlayer(null); setIsPlayerModalOpen(true); }}
                  onEditClick={handleEditPlayer}
                  onDeleteClick={handleDeletePlayer}
                  onViewClick={(p) => setProfilePlayer(p)}
                />
              )}

              {activeTab === 'info' && (
                <TeamInfo 
                  team={team} 
                  playersCount={availablePlayers.length}
                  onUpdate={async (updatedTeam) => {
                    setTeam(updatedTeam);
                    await fetchMyTeam(); // Refresh để đảm bảo data đồng bộ
                  }}
                  onDelete={async () => {
                    setTeam(null);
                    setAvailablePlayers([]);
                    // Có thể hiển thị thông báo thành công
                    alert('Team deleted successfully');
                  }}
                />
              )}

              {activeTab === 'formation' && (
                <Formation availablePlayers={availablePlayers} team={team} />
              )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal tạo/chỉnh sửa đội */}
      <PlayerProfileModal isOpen={!!profilePlayer} onClose={() => setProfilePlayer(null)} player={profilePlayer} />
      <ModalTeam
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={async (teamData) => {
          console.log('🔄 ModalTeam onSubmit called with:', teamData);
          // Update state trực tiếp nếu có teamData
          if (teamData) {
            setTeam(teamData);
            console.log('✅ Team updated in state:', teamData.name);
            setActiveTab('info');
            // Fetch players after team is set (use useEffect will handle this)
          } else {
            // Nếu không có teamData, gọi fetchMyTeam để lấy data mới
            setTimeout(async () => {
              await fetchMyTeam();
              setActiveTab('info');
            }, 3000);
          }
        }}
      />
          {team && (
        <PlayerModal
          isOpen={isPlayerModalOpen}
          onClose={() => setIsPlayerModalOpen(false)}
          onSubmit={handleUpsertPlayer}
          teamId={team._id}
          mode={editingPlayer ? 'edit' : 'create'}
          initialData={editingPlayer}
        />
      )}
    </div>
  );
};

export default TeamPage;