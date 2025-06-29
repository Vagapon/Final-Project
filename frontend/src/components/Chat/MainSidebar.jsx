import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';

const MainSidebar = ({ activeTab, onTabChange, isOpen, onToggle }) => {
  const menuItems = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'calls', icon: Phone, label: 'Calls' },
    { id: 'groups', icon: Users, label: 'Groups' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'globe', icon: Globe, label: 'Globe' },
    { id: 'clock', icon: Clock, label: 'Clock' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
        w-16 bg-gray-900 flex flex-col items-center py-4 space-y-4 h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>

        {/* Menu Items */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              // Auto close on mobile after selection
              if (window.innerWidth < 1024) {
                onToggle();
              }
            }}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}

        {/* User Avatar at bottom */}
        <div className="mt-auto">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </>
  );
};
export default MainSidebar;