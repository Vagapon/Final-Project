// components/Admin/AdminDashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import StatsCard from '../chart/StatsCard';
import Chart from '../chart/Charts';
import Statistics from '../chart/Statistics';
import { Users, Package, TrendingUp } from 'lucide-react';
import User from '../../pages/Admin/User.jsx'; // Import User component for the /admin/users route
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex w-full">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
            <Header
              toggleSidebar={toggleSidebar}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
            <main className="p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard title="Customers" value="3,782" change="11.01%" icon={Users} trend="up" />
                <StatsCard title="Orders" value="5,359" change="9.05%" icon={Package} trend="down" />
                 <StatsCard title="Orders" value="5,359" change="9.05%" icon={Package} trend="down" />
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 md:col-span-2 lg:col-span-1 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Revenue last month</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">$45,2K</div>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2"><Chart /></div>
                <div><Statistics /></div>
              </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">  <User /></div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
