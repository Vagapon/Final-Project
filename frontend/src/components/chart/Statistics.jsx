import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Users, Calendar, Trophy } from 'lucide-react';
import { eventApi } from '../../api/eventManagement';

const Statistics = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await eventApi.getAllEvents({ page: 1, limit: 500 });
        const list = res?.data?.data || res?.data || [];
        setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Statistics events error:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    if (!events.length) {
      return [
        { label: 'Completion Rate', value: '0%', icon: Activity, color: 'text-green-600' },
        { label: 'Avg Event Size', value: '0', icon: Users, color: 'text-blue-600' },
        { label: 'Cancellation Rate', value: '0%', icon: Calendar, color: 'text-red-600' },
      ];
    }

    const total = events.length;
    const completed = events.filter((e) => e.status === 'completed' || e.status === 'done').length;
    const cancelled = events.filter((e) => e.status === 'cancelled' || e.status === 'canceled').length;
    const participants = events.map((e) =>
      (e.participants && e.participants.length) ||
      (e.registeredUsers && e.registeredUsers.length) ||
      e.participantsCount ||
      0
    );
    const avgSize = participants.reduce((s, v) => s + v, 0) / total || 0;

    return [
      {
        label: 'Completion Rate',
        value: `${((completed / total) * 100 || 0).toFixed(1)}%`,
        icon: Activity,
        color: 'text-green-600'
      },
      {
        label: 'Avg Event Size',
        value: `${Math.round(avgSize)}`,
        icon: Users,
        color: 'text-blue-600'
      },
      {
        label: 'Cancellation Rate',
        value: `${((cancelled / total) * 100 || 0).toFixed(1)}%`,
        icon: Calendar,
        color: 'text-red-600'
      }
    ];
  }, [events]);

  const sportsData = useMemo(() => {
    if (!events.length) return [];
    const counts = {};
    events.forEach((e) => {
      const name = e.sportTypeId?.name || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    const palette = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6', '#6366F1'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value: Math.round((value / total) * 100),
      color: palette[idx % palette.length],
    }));
  }, [events]);

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