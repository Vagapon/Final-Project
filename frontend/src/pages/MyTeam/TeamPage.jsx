import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import Formation from './Formation';
import PlayerList from './PlayerList';
import TeamInfo from './TeamInfo';
import ModalTeam from './ModalTeam';
import PlayerModal from './PlayerModal';
import axios from 'axios';

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState('formation');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);


  useEffect(() => {
    if (team?._id) {
      fetchTeamPlayers();
    }
  }, [team?._id]);

  // Add function to fetch team players
    const fetchTeamPlayers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/member/team/${team._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const raw = response.data?.data || response.data || [];
      const normalized = raw.map((p) => ({
        ...p,
        name: p.name ?? p.nameMember ?? '',
        avatar: p.avatar ?? '',
      }));
      setAvailablePlayers(normalized);
    } catch (error) {
      console.error("Error fetching players:", error.response?.data || error.message);
    }
  };

   const handleAddPlayer = async (playerData) => {
    try {
      const token = localStorage.getItem("token");
      const hasFile = Boolean(playerData?.avatarFile);
      let body;
      let headers = { Authorization: `Bearer ${token}` };

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
        headers['Content-Type'] = 'application/json';
      }

      const response = await axios.post(
        'http://localhost:5000/api/member',
        body,
        { headers }
      );

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
    if (!window.confirm(`Xóa ${player.name}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/member/${player._id}` , {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTeamPlayers();
    } catch (error) {
      console.error("Delete player error:", error.response?.data || error.message);
      alert(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleUpsertPlayer = async (playerData) => {
    // Decide create or update based on editingPlayer
    if (editingPlayer) {
      try {
        const token = localStorage.getItem("token");
        const hasFile = Boolean(playerData?.avatarFile);
        let body;
        let headers = { Authorization: `Bearer ${token}` };

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
          headers['Content-Type'] = 'application/json';
        }

        await axios.put(`http://localhost:5000/api/member/${editingPlayer._id}`, body, { headers });
        await fetchTeamPlayers();
        setEditingPlayer(null);
        setIsPlayerModalOpen(false);
      } catch (error) {
        console.error("Update player error:", error.response?.data || error.message);
        alert(error.response?.data?.message || 'Cập nhật thất bại');
      }
      return;
    }

    // Create flow
    await handleAddPlayer(playerData);
  };

  // 🟢 Gọi API lấy team của user hiện tại
  const fetchMyTeam = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/team/myteam", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      } else if (res.status === 404) {
        setTeam(null);
      }
    } catch (err) {
      console.error("Fetch team error:", err);
    }
  };

  useEffect(() => {
    fetchMyTeam(); // load khi mở trang
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">

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
                Sơ đồ chiến thuật
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'players'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Danh sách cầu thủ
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin đội
              </button>
            </nav>
          </div>

          <div className="p-6">
            {!team ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="text-2xl font-semibold text-gray-800">Chưa có đội</div>
                <div className="text-gray-600 max-w-md">Hãy tạo đội của bạn để quản lý sơ đồ chiến thuật, danh sách cầu thủ và thông tin đội bóng.</div>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="mt-2 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Tạo đội
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
                />
              )}

              {activeTab === 'info' && (
                <TeamInfo 
                  team={team} 
                  playersCount={availablePlayers.length} 
                />
              )}

              {activeTab === 'formation' && (
                <Formation players={availablePlayers} />
              )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal tạo/chỉnh sửa đội */}
      <ModalTeam
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={() => {
          setIsTeamModalOpen(false);
          fetchMyTeam();   // 🟢 gọi lại API để refresh team thật
          setActiveTab('info');
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
