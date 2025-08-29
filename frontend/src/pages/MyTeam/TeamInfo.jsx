import React from 'react';
import { Trophy, Phone, Mail } from 'lucide-react';

const StatCard = ({ value, label, colorClass }) => (
  <div className="text-center rounded-xl bg-white border p-4 shadow-sm">
    <div className={`text-3xl font-extrabold ${colorClass}`}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const InfoSection = ({ title, children, icon }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

const TeamInfo = ({ team, playersCount }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoSection title="Thông tin đội bóng" icon={<Trophy className="text-green-500" />}> 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500">Tên đội</div>
              <div className="mt-1 text-gray-900 font-semibold">{team.teamName}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Tên viết tắt</div>
              <div className="mt-1 text-gray-900">{team.shortName || 'Chưa có'}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-gray-500">Mô tả</div>
              <div className="mt-1 text-gray-900">{team.description || 'Chưa có mô tả'}</div>
            </div>
          </div>
        </InfoSection>

        <InfoSection title="Thông tin liên hệ" icon={<Phone className="text-green-500" />}> 
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-gray-500">Đội trưởng</div>
              <div className="mt-1 text-gray-900 font-semibold">{team.captain}</div>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-green-500" />
              <div>
                <div className="text-xs font-medium text-gray-500">Điện thoại</div>
                <div className="text-gray-900">{team.phone}</div>
              </div>
            </div>
            {team.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-green-500" />
                <div>
                  <div className="text-xs font-medium text-gray-500">Email</div>
                  <div className="text-gray-900">{team.email}</div>
                </div>
              </div>
            )}
          </div>
        </InfoSection>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={playersCount} label="Cầu thủ" colorClass="text-emerald-600" />
        <StatCard value={0} label="Trận đấu" colorClass="text-blue-600" />
        <StatCard value={0} label="Thắng" colorClass="text-amber-600" />
        <StatCard value={0} label="Thua" colorClass="text-rose-600" />
      </div>
    </div>
  );
};

export default TeamInfo;


