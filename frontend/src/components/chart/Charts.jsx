// components/Admin/Chart.jsx
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const Chart = () => {
  const data = [
    { month: 'Jan', value: 150 },
    { month: 'Feb', value: 380 },
    { month: 'Mar', value: 200 },
    { month: 'Apr', value: 280 },
    { month: 'May', value: 180 },
    { month: 'Jun', value: 190 },
    { month: 'Jul', value: 280 },
    { month: 'Aug', value: 120 },
    { month: 'Sep', value: 200 },
    { month: 'Oct', value: 380 },
    { month: 'Nov', value: 250 },
    { month: 'Dec', value: 120 }
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Sales</h3>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="flex items-end justify-between h-64 space-x-1 overflow-x-auto">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1 min-w-0">
            <div
              className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 min-w-[20px]"
              style={{ height: `${(item.value / maxValue) * 200}px` }}
            ></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;
