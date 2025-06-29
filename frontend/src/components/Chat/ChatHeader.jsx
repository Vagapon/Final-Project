import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';

const ChatHeader = ({ selectedChat, onBackClick, onMenuToggle, onInfoToggle }) => {
  if (!selectedChat) return null;

  return (
    <div className="bg-white border-b border-gray-100 p-3 sm:p-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Mobile back button */}
        <button 
          onClick={onBackClick}
          className="lg:hidden mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {/* Mobile menu button */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative">
          {selectedChat.avatar ? (
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${selectedChat.bgColor} flex items-center justify-center text-white font-semibold text-sm`}>
              {selectedChat.avatarText}
            </div>
          )}
          {selectedChat.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="ml-2 sm:ml-3">
          <h2 className="text-sm font-semibold text-gray-900">{selectedChat.name}</h2>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1"></div>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="hidden sm:block p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Video className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button 
          onClick={onInfoToggle}
          className="hidden md:block p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;