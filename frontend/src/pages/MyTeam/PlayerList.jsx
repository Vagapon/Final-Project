import React from 'react';
import { Users, Plus, Shield, User2, Edit2, Trash2, Facebook, Instagram, Globe } from 'lucide-react';

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

const PlayerList = ({ players = [], onAddClick, onEditClick, onDeleteClick, onViewClick }) => {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {players.map((player) => (
            <div
              key={player._id}
              className="group relative rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Two-column card like the reference image */}
              <div className="grid grid-cols-1 md:grid-cols-2 md:h-44">
                {/* Left: large portrait */}
                <div className="relative h-40 md:h-full bg-white">
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-full h-full object-contain object-center"
                    />
                  ) : (
                    <div className={`w-full h-40 md:h-full ${badgeColorByPosition(player.position)} flex items-center justify-center text-white text-3xl font-bold`}>
                      {player.number || 0}
                    </div>
                  )}
                </div>

                {/* Right: details */}
                <div className="p-3 md:p-4 flex flex-col md:h-44 overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        onClick={() => onViewClick && onViewClick(player)}
                        className="text-left block text-lg md:text-xl font-extrabold tracking-tight text-gray-900 hover:text-blue-600 truncate"
                        title="Xem chi tiết"
                      >
                        {player.name}
                      </button>
                      <div className="mt-0.5 text-gray-500 font-medium text-sm truncate">
                        {player.position || 'Team Member'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

                  <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {player.bio || 'Adipiscing elit, sed do eiusmod tempor incididunt labore dolore magna aliqua.'}
                  </p>

                  {/* Social row */}
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-black" />
                    {[{Icon: Facebook, label: 'Facebook'}, {Icon: Globe, label: 'Website'}, {Icon: Instagram, label: 'Instagram'}].map(({Icon, label}) => (
                      <button
                        key={label}
                        className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-400 transition-colors"
                        title={label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  {/* Meta below */}
                  <div className="mt-2.5 text-xs text-gray-700 flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5"><Shield className="w-4 h-4 text-gray-500" />Số áo: <span className="font-semibold">{player.number || '-'}</span></span>
                    <span className="inline-flex items-center gap-1.5"><User2 className="w-4 h-4 text-gray-500" />{player.isCaptain ? 'Đội trưởng' : 'Thành viên'}</span>
                  </div>
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


