import React, { useMemo, useState } from 'react';
import { Plus, Save, X } from 'lucide-react';

const Formation = ({ availablePlayers = [], onAddPlayer }) => {
  const [selectedPlayerCount, setSelectedPlayerCount] = useState('11');
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [fieldPlayers, setFieldPlayers] = useState({});
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: 'CF', number: '' });

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại sân</label>
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
            Formation: {selectedFormation} | 0/{selectedPlayerCount} vị trí
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
              placeholder="Tên cầu thủ"
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
                Lưu
              </button>
              <button
                onClick={() => setIsAddingPlayer(false)}
                className="flex-1 bg-gray-500 text-white px-2 py-2 rounded text-sm hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {availablePlayers.map((player) => (
            <div
              key={player.id}
              draggable
              onDragStart={(e) => handleDragStart(e, player)}
              className="flex items-center gap-3 p-2 bg-white rounded-lg border cursor-move hover:shadow-md transition-shadow"
            >
              <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow">
                {player.number}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">{player.name}</div>
                <div className="text-xs text-gray-500">{player.position}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Formation;


