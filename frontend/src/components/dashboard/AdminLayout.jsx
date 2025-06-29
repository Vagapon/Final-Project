// src/components/dashboard/AdminLayout.jsx
import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex w-full">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'} transition-all`}>
            <Header
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              darkMode={darkMode}
              toggleDarkMode={() => setDarkMode(!darkMode)}
            />
            <main className="p-4 lg:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
