import React from 'react';
import { Users, Plus, Shield, User2, Edit2, Trash2 } from 'lucide-react';

const badgeColorByPosition = (pos) => {
  const map = {
    GK: 'bg-amber-500',
    CB: 'bg-blue-600',
    LB: 'bg-cyan-600',
    RB: 'bg-cyan-600',
    CM: 'bg-emerald-600',
    LM: 'bg-emerald-600',
    RM: 'bg-emerald-600',
    LW: 'bg-pink-600',
    RW: 'bg-pink-600',
    CF: 'bg-violet-600'
  };
  return map[pos] || 'bg-gray-600';
};

const PlayerList = ({ players = [], onAddClick, onEditClick, onDeleteClick }) => {
  // Check if there are no players
  const isEmpty = players.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-green-500" />
          Danh sách cầu thủ
          <span className="text-sm font-medium text-gray-500">({players.length})</span>
        </h3>
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow"
        >
          <Plus size={16} /> Thêm cầu thủ
        </button>
      </div>

      {isEmpty ? (
        // Empty state
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Chưa có thành viên</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng việc thêm thành viên vào đội của bạn.</p>
          <div className="mt-6">
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow"
            >
              <Plus size={16} />
              Thêm thành viên mới
            </button>
          </div>
        </div>
      ) : (
        // Player grid when there are players
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {players.map((player) => (
            <div 
              key={player._id} 
              className="group relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-14 h-14 rounded-full object-cover shadow border"
                  />
                ) : (
                  <div className={`w-14 h-14 ${badgeColorByPosition(player.position)} text-white rounded-full flex items-center justify-center font-bold text-lg shadow`}>
                    {player.number}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 truncate">{player.name}</h4>
                    {player.isCaptain && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                        Đội trưởng
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Shield size={12} /> Số áo: {player.number}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User2 size={12} /> {player.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditClick && onEditClick(player)}
                    className="p-2 rounded-md border text-gray-600 hover:text-blue-600 hover:border-blue-200"
                    title="Sửa"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteClick && onDeleteClick(player)}
                    className="p-2 rounded-md border text-gray-600 hover:text-red-600 hover:border-red-200"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerList;


