import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, BarChart3, Calendar, User, CheckSquare,
  FileText, Table, X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [openMenus, setOpenMenus] = useState({
    dashboard: true,
    task: false,
    forms: false,
    setting: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      submenu: [
        { label: 'Overview', path: '/admin' },
        { label: 'Analytics', path: '/admin/analytics', badge: 'PRO' },
        { label: 'CRM', path: '/admin/crm', badge: 'PRO' }
      ]
    },
      {
      id: 'teams',
      icon: FileText,
      label: 'Teams',
      submenu: [
        { label: 'Team list', path: '/admin/teams/' },
        { label: 'Ranking', path: '/admin/ranks/' }
      ]
    },
    
    {
      id: 'profile',
      icon: User,
      label: 'Manage User',
      path: '/admin/users'
    },
    {
      id: 'task',
      icon: CheckSquare,
      label: 'Event',
      submenu: [
        { label: 'All Events', path: '/admin/events' },
        { label: 'Match Manager', path: '/admin/matches' }
      ]
    },
{
      id: 'calendar',
      icon: Calendar,
      label: 'Calendar',
      path: '/admin/calendar'
    },
    {
      id: 'setting',
      icon: Table,
      label: 'Setting',
      submenu: [
        { label: 'Profile', path: '/admin/profile' },
        { label: 'Security', path: '/admin/settings/security' }
      ]
    }
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={toggleSidebar} />
      )}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">TailAdmin</span>
          </div>
          <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-20">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-3">
            MENU
          </div>

          <nav className="space-y-6">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform flex-shrink-0 ${
                          openMenus[item.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openMenus[item.id] && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.submenu.map((subItem, idx) => (
                          <Link
                            key={idx}
                            to={subItem.path}
                            className="flex justify-between items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
