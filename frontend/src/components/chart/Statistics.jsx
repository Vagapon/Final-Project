// components/Admin/Statistics.jsx
import React, { useState } from 'react';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('Monthly');
  const tabs = ['Monthly', 'Quarterly', 'Annually'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Target each month</p>
        </div>
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">250</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly Target</div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">$20K ↗</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
