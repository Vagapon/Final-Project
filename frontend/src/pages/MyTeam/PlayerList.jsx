import React from 'react';
import { Users, Plus, Shield, User2 } from 'lucide-react';

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

const PlayerList = ({ players = [], onAddClick }) => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {players.map((p) => (
          <div key={p.id} className="group relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${badgeColorByPosition(p.position)} text-white rounded-full flex items-center justify-center font-bold text-lg shadow`}>{p.number}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 truncate">{p.name}</h4>
                  <span className={`text-[10px] uppercase tracking-wider text-white px-2 py-0.5 rounded ${badgeColorByPosition(p.position)}`}>{p.position}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><Shield size={12} /> Số áo: {p.number}</span>
                  <span className="inline-flex items-center gap-1"><User2 size={12} /> Tên: {p.name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;


