import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import Formation from './Formation';
import PlayerList from './PlayerList';
import TeamInfo from './TeamInfo';
import ModalTeam from './ModalTeam';

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState('formation');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleAddPlayer = (player) => {
    setAvailablePlayers(prev => [...prev, player]);
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
    <div className="min-h-screen bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {team?.shortName || (team?.name ? team.name.substring(0, 2).toUpperCase() : 'CLB')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{team?.name || 'Chưa có đội'}</h1>
                <p className="text-gray-600">{team?.description || 'Hãy tạo đội để bắt đầu quản lý.'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Edit size={16} />
              <span>{team ? 'Chỉnh sửa' : 'Tạo đội'}</span>
            </button>
          </div>
        </div> */}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
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
                {activeTab === 'formation' && (
                  <Formation
                    availablePlayers={availablePlayers}
                    onAddPlayer={handleAddPlayer}
                  />
                )}

                {activeTab === 'players' && (
                  availablePlayers.length > 0 ? (
                    <PlayerList
                      players={availablePlayers}
                      onAddClick={() => setActiveTab('formation')}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500 text-lg">
                      Chưa có thành viên nào
                    </div>
                  )
                )}

                {activeTab === 'info' && (
                  <TeamInfo team={team} playersCount={availablePlayers.length} />
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
    </div>
  );
};

export default TeamPage;
