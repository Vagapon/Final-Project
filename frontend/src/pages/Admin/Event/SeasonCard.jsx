import React from 'react';
import { Edit, Eye, Trash2 } from 'lucide-react';

const SeasonCard = ({ season, onEdit, onView, onDelete }) => {
  return (
    <div 
      className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
      style={{ 
        backgroundImage: `url(${season.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Card Content */}
      <div className="relative p-4 h-48 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-xl mb-2 text-white" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '0.5px'
          }}>
            {season.name.toUpperCase()}
          </h3>
          <p className="text-white text-sm mb-3 line-clamp-3" style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            {season.description}
          </p>
        </div>
        
        <div className="text-xs text-white" style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
     <p>
    {new Date(season.startDate).toLocaleDateString("vi-VN")} - {new Date(season.endDate).toLocaleDateString("vi-VN")}
  </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded p-1 shadow-sm">
        <button
          onClick={() => onView(season)}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          title="Xem chi tiết"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() => onEdit(season)}
          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
          title="Chỉnh sửa"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={() => onDelete(season)}
          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Xóa"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 pointer-events-none"></div>
    </div>
  );
};

export default SeasonCard;