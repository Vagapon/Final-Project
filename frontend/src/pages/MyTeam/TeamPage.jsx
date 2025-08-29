import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import Formation from './Formation';
import PlayerList from './PlayerList';
import TeamInfo from './TeamInfo';
import ModalTeam from './ModalTeam';

const TeamPage = ({ teamData = null }) => {
  const [activeTab, setActiveTab] = useState('formation');
  const [availablePlayers, setAvailablePlayers] = useState([
    { id: 1, name: 'Nguyễn Văn A', position: 'GK', number: 1 },
    { id: 2, name: 'Trần Văn B', position: 'CB', number: 2 },
    { id: 3, name: 'Lê Văn C', position: 'CB', number: 3 },
    { id: 4, name: 'Phạm Văn D', position: 'LB', number: 4 },
    { id: 5, name: 'Hoàng Văn E', position: 'RB', number: 5 },
    { id: 6, name: 'Đặng Văn F', position: 'CM', number: 6 },
    { id: 7, name: 'Vũ Văn G', position: 'CM', number: 7 },
    { id: 8, name: 'Bùi Văn H', position: 'LW', number: 8 },
    { id: 9, name: 'Đỗ Văn I', position: 'RW', number: 9 },
    { id: 10, name: 'Ngô Văn J', position: 'CF', number: 10 },
    { id: 11, name: 'Cao Văn K', position: 'CF', number: 11 }
  ]);
  const handleAddPlayer = (player) => {
    setAvailablePlayers(prev => [...prev, player]);
  };

  const [team, setTeam] = useState(teamData || null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {team?.shortName || (team?.teamName ? team.teamName.substring(0, 2).toUpperCase() : 'CLB')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{team?.teamName || 'Chưa có đội'}</h1>
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
        </div>

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
                  <PlayerList
                    players={availablePlayers}
                    onAddClick={() => setActiveTab('formation')}
                  />
                )}

                {activeTab === 'info' && (
                  <TeamInfo team={team} playersCount={availablePlayers.length} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ModalTeam
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={(data) => {
          setTeam(prev => ({
            ...prev,
            teamName: data.teamName || prev?.teamName,
            shortName: data.shortName || prev?.shortName,
            description: data.description || prev?.description,
            captain: data.captain || prev?.captain,
            phone: data.phone || prev?.phone,
            email: data.email || prev?.email,
            logo: data.logo || prev?.logo
          }));
        }}
      />
    </div>
  );
};

export default TeamPage;