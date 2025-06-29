import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';

const ChatSidebar = ({ selectedChat, onChatSelect, isVisible, onBackClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const contacts = [
    { id: 1, name: 'Patrick', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', isOnline: true },
    { id: 2, name: 'Doris', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=40&h=40&fit=crop&crop=face', isOnline: false },
    { id: 3, name: 'Emily', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', isOnline: false },
    { id: 4, name: 'Steve', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', isOnline: false }
  ];

  const recentChats = [
    {
      id: 1,
      name: 'Patrick Hendricks',
      message: "hey! there I'm available",
      time: '02:50 PM',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face',
      isOnline: true,
      unread: 0
    },
    {
      id: 2,
      name: 'Mark Messer',
      message: '📷 Images',
      time: '10:30 AM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=face',
      isOnline: false,
      unread: 2
    },
    {
      id: 3,
      name: 'General',
      message: 'This theme is Awesome!',
      time: '2:06 min',
      avatar: null,
      avatarText: 'G',
      bgColor: 'bg-purple-500',
      isOnline: false,
      unread: 0
    },
    {
      id: 4,
      name: 'Doris Brown',
      message: '🤗',
      time: '00:18',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=48&h=48&fit=crop&crop=face',
      isOnline: true,
      unread: 0
    },
    {
      id: 5,
      name: 'Designer',
      message: 'Next meeting tomorrow 10:00AM',
      time: '2:10 min',
      avatar: null,
      avatarText: 'D',
      bgColor: 'bg-blue-500',
      isOnline: false,
      unread: 1
    },
    {
      id: 6,
      name: 'Steve Walter',
      message: 'Admin-A-zip',
      time: '01:16 PM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face',
      isOnline: false,
      unread: 0
    }
  ];

  return (
    <div className={`
      w-full sm:w-80 bg-white flex flex-col h-full
      ${isVisible ? 'block' : 'hidden lg:flex'}
    `}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Chats</h1>
          {onBackClick && (
            <button 
              onClick={onBackClick}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search messages or users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Quick Contacts - Hidden on very small screens */}
        <div className="hidden sm:flex space-x-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {contact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="text-xs text-gray-600">{contact.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 sm:p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-4 px-2">Recent</h2>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`flex items-center p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedChat?.id === chat.id 
                    ? 'bg-blue-50 shadow-sm' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${chat.bgColor} flex items-center justify-center text-white font-semibold text-sm`}>
                      {chat.avatarText}
                    </div>
                  )}
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{chat.message}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatSidebar;