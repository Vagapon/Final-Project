// components/Admin/StatsCard.jsx
import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ title, value, change, icon: Icon, trend }) => {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className={`w-4 h-4 mr-1 flex-shrink-0 ${isPositive ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0 ml-4">
          <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
