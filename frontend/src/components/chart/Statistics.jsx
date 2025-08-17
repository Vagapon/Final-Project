import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users, Calendar, Trophy } from 'lucide-react';

const Statistics = () => {
  // Dữ liệu cho biểu đồ pie - phân loại sport
  const sportsData = [
    { name: 'Football', value: 35, color: '#3B82F6' },
    { name: 'Basketball', value: 28, color: '#10B981' },
    { name: 'Tennis', value: 20, color: '#F59E0B' },
    { name: 'Swimming', value: 12, color: '#8B5CF6' },
    { name: 'Others', value: 5, color: '#EF4444' }
  ];

  // Dữ liệu cho mini bar chart - top venues

  // Key metrics data
  const metrics = [
    {
      label: 'Completion Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      label: 'Avg Event Size',
      value: '156',
      change: '+12',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Cancellation Rate',
      value: '2.3%',
      change: '-0.5%',
      trend: 'down',
      icon: Calendar,
      color: 'text-red-600'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {`${payload[0].payload.name}: ${payload[0].value} events`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3 h-full">
      {/* Key Metrics - Compact version */}
      <div className="space-y-2">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white dark:bg-gray-600 rounded-md flex items-center justify-center">
                  <Icon className={`w-3 h-3 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendIcon className="w-3 h-3" />
                <span className="text-xs font-medium">{metric.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sports Distribution Pie Chart - Compact */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sports Distribution</h3>
          <Trophy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        
        <div className="h-24 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sportsData}
                cx="50%"
                cy="50%"
                innerRadius={18}
                outerRadius={38}
                paddingAngle={2}
                dataKey="value"
              >
                {sportsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Events']}
                labelStyle={{ color: '#374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - More compact */}
        <div className="space-y-1">
          {sportsData.map((sport, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: sport.color }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {sport.name}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {sport.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Venues Mini Bar Chart - More compact */}
   
    </div>
  );
};

export default Statistics;