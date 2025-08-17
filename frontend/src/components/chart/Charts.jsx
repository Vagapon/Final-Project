import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const Charts = () => {
  const [activeChart, setActiveChart] = useState('events');

  // Dữ liệu mẫu cho biểu đồ events
  const eventsData = [
    { month: 'Jan', events: 45, participants: 1200, revenue: 8500 },
    { month: 'Feb', events: 52, participants: 1450, revenue: 9200 },
    { month: 'Mar', events: 48, participants: 1300, revenue: 8800 },
    { month: 'Apr', events: 61, participants: 1680, revenue: 11200 },
    { month: 'May', events: 55, participants: 1520, revenue: 10500 },
    { month: 'Jun', events: 67, participants: 1850, revenue: 12800 },
    { month: 'Jul', events: 73, participants: 2100, revenue: 14200 },
    { month: 'Aug', events: 69, participants: 1950, revenue: 13500 },
    { month: 'Sep', events: 58, participants: 1680, revenue: 11800 },
    { month: 'Oct', events: 64, participants: 1820, revenue: 12600 },
    { month: 'Nov', events: 71, participants: 2050, revenue: 14100 },
    { month: 'Dec', events: 78, participants: 2200, revenue: 15400 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{`${label} 2024`}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
                {entry.name === 'Revenue' && '$'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartConfigs = {
    events: {
      title: 'Monthly Events',
      dataKey: 'events',
      color: '#3B82F6',
      gradient: ['#3B82F6', '#1E40AF']
    },
    participants: {
      title: 'Participants Growth',
      dataKey: 'participants',
      color: '#10B981',
      gradient: ['#10B981', '#047857']
    },
    revenue: {
      title: 'Revenue Trend',
      dataKey: 'revenue',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#6D28D9']
    }
  };

  const currentConfig = chartConfigs[activeChart];

  return (
    <div className="h-80">
      {/* Chart Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {Object.entries(chartConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                activeChart === key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {config.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={eventsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.gradient[0]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={currentConfig.gradient[1]} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              className="dark:stroke-gray-600"
            />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={currentConfig.dataKey}
              stroke={currentConfig.color}
              strokeWidth={3}
              fill={`url(#gradient-${activeChart})`}
              dot={{ fill: currentConfig.color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: currentConfig.color, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Peak Month</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">December</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {activeChart === 'revenue' 
              ? `$${Math.round(eventsData.reduce((acc, item) => acc + item[currentConfig.dataKey], 0) / eventsData.length).toLocaleString()}`
              : Math.round(eventsData.reduce((acc, item) => acc + item[currentConfig.dataKey], 0) / eventsData.length).toLocaleString()
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
          <p className="text-sm font-semibold text-green-600">+24.5%</p>
        </div>
      </div>
    </div>
  );
};

export default Charts;