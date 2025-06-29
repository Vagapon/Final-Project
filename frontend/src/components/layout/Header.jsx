// components/Admin/Header.jsx
import React, { useState } from 'react';
import { Bell, Search, Moon, Sun, Menu, ChevronDown } from 'lucide-react';

const Header = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, user: 'Terry Franci', action: 'requests permission to change', project: 'Project - Nganfor App', time: '5 min ago', avatar: 'TF' },
    { id: 2, user: 'Alena Franci', action: 'requests permission to change', project: 'Project - Nganfor App', time: '8 min ago', avatar: 'AF' },
    { id: 3, user: 'Jocelyn Kenter', action: 'requests permission to change', project: 'Project - Nganfor App', time: '15 min ago', avatar: 'JK' },
    { id: 4, user: 'Brandon Philips', action: 'requests permission to change', project: 'Project - Nganfor App', time: '1 hr ago', avatar: 'BP' }
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search or type command..."
              className="pl-10 pr-12 py-2 w-64 lg:w-80 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              ⌘
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                <div className="p-4 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {notification.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{notification.user}</span> {notification.action}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {notification.project}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Project • {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 text-center">
                  <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">M</span>
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Musharof</span>
              <ChevronDown className="w-4 h-4 text-gray-500 inline ml-1" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
