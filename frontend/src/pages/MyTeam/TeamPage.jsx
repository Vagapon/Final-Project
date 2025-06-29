import React, { useState } from 'react';
import { Users, Trophy, Phone, Mail, Edit, Plus, X, Save } from 'lucide-react';

const TeamPage = ({ teamData = null }) => {
  const [activeTab, setActiveTab] = useState('formation');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState('11');
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [fieldPlayers, setFieldPlayers] = useState({});
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
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: 'CF', number: '' });

  const formations = {
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
  };

  const defaultTeam = {
    teamName: 'FC Example',
    shortName: 'FCE',
    description: 'Đội bóng mẫu với đội hình mạnh mẽ',
    captain: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'captain@example.com',
    logo: null
  };

  const team = teamData || defaultTeam;

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.number) return;
    
    const player = {
      id: Date.now(),
      name: newPlayer.name,
      position: newPlayer.position,
      number: parseInt(newPlayer.number)
    };
    
    setAvailablePlayers([...availablePlayers, player]);
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

  const currentFormation = formations[selectedPlayerCount][selectedFormation] || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {team.shortName || team.teamName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{team.teamName}</h1>
                <p className="text-gray-600">{team.description}</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <Edit size={16} />
              <span>Chỉnh sửa</span>
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
            {activeTab === 'formation' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại sân
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sơ đồ
                    </label>
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

                {/* Football Field */}
                <div className="lg:col-span-2">
                  <div className="relative bg-green-500 rounded-lg aspect-[3/4] max-w-md mx-auto border-4 border-white shadow-lg">
                    {/* Field markings */}
                    <div className="absolute inset-2 border-2 border-white rounded">
                      {/* Center circle */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>
                      
                      {/* Center line */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
                      
                      {/* Goal areas */}
                      <div className="absolute top-0 left-1/4 right-1/4 h-8 border-2 border-white border-t-0"></div>
                      <div className="absolute bottom-0 left-1/4 right-1/4 h-8 border-2 border-white border-b-0"></div>
                    </div>

                    {/* Player positions */}
                    {currentFormation.map((position) => (
                      <div
                        key={position.id}
                        className="absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`
                        }}
                        onDrop={(e) => handleDrop(e, position)}
                        onDragOver={handleDragOver}
                      >
                        {fieldPlayers[position.id] ? (
                          <div className="relative group">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg">
                              {fieldPlayers[position.id].number}
                            </div>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
                          <div className="w-12 h-12 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs border-2 border-dashed border-white">
                            {position.position}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Formation label */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Formation: {selectedFormation} | 0/{selectedPlayerCount} vị trí
                    </div>
                  </div>
                </div>

                {/* Available Players */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Cầu thủ</h3>
                    <button
                      onClick={() => setIsAddingPlayer(true)}
                      className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      <span>Thêm</span>
                    </button>
                  </div>

                  {isAddingPlayer && (
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <input
                        type="text"
                        placeholder="Tên cầu thủ"
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                      <div className="flex space-x-2">
                        <select
                          value={newPlayer.position}
                          onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        >
                          <option value="GK">GK</option>
                          <option value="CB">CB</option>
                          <option value="LB">LB</option>
                          <option value="RB">RB</option>
                          <option value="CM">CM</option>
                          <option value="LM">LM</option>
                          <option value="RM">RM</option>
                          <option value="LW">LW</option>
                          <option value="RW">RW</option>
                          <option value="CF">CF</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Số"
                          value={newPlayer.number}
                          onChange={(e) => setNewPlayer(prev => ({ ...prev, number: e.target.value }))}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleAddPlayer}
                          className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                        >
                          <Save size={12} className="inline mr-1" />
                          Lưu
                        </button>
                        <button
                          onClick={() => setIsAddingPlayer(false)}
                          className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availablePlayers.map((player) => (
                      <div
                        key={player.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, player)}
                        className="flex items-center space-x-3 p-2 bg-white rounded-lg border cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {player.number}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{player.name}</div>
                          <div className="text-xs text-gray-500">{player.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'players' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="text-green-500" />
                    Danh sách cầu thủ ({availablePlayers.length})
                  </h3>
                  <button
                    onClick={() => setIsAddingPlayer(true)}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Thêm cầu thủ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePlayers.map((player) => (
                    <div key={player.id} className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {player.number}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{player.name}</h4>
                          <p className="text-sm text-gray-600">Vị trí: {player.position}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Trophy className="text-green-500" />
                      Thông tin đội bóng
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tên đội:</label>
                        <p className="text-gray-800">{team.teamName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tên viết tắt:</label>
                        <p className="text-gray-800">{team.shortName || 'Chưa có'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Mô tả:</label>
                        <p className="text-gray-800">{team.description || 'Chưa có mô tả'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Đội trưởng:</label>
                        <p className="text-gray-800">{team.captain}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-green-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Điện thoại:</label>
                          <p className="text-gray-800">{team.phone}</p>
                        </div>
                      </div>
                      {team.email && (
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-green-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email:</label>
                            <p className="text-gray-800">{team.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê đội bóng</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{availablePlayers.length}</div>
                      <div className="text-sm text-gray-600">Cầu thủ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">0</div>
                      <div className="text-sm text-gray-600">Trận đấu</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">0</div>
                      <div className="text-sm text-gray-600">Thắng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">0</div>
                      <div className="text-sm text-gray-600">Thua</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;