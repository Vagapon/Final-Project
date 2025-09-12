
import React from 'react';
import { TrendingUp } from "lucide-react";
const StatsSection = ({ stats }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="text-center group transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
              <stat.icon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
          <div className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full inline-flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {stat.change}%
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default StatsSection;