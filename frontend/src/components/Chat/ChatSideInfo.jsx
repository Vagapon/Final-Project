import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X, Star, Shield, Mail, MapPin, Calendar } from 'lucide-react';

const ChatSideInfo = ({ selectedChat, isVisible, onClose }) => {
  if (!selectedChat || !isVisible) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${isVisible ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      
      <div className={`
        fixed md:relative right-0 top-0 h-full w-80 bg-white border-l border-gray-100 z-50
        transform transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        ${!isVisible ? 'md:hidden' : ''}
      `}>
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Contact Info</h3>
              <button 
                onClick={onClose}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-6">
            {/* Avatar and Basic Info */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {selectedChat.avatar ? (
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full ${selectedChat.bgColor} flex items-center justify-center text-white font-semibold text-2xl mx-auto`}>
                    {selectedChat.avatarText}
                  </div>
                )}
                {selectedChat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">{selectedChat.name}</h2>
              <div className="flex items-center justify-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${selectedChat.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className={`text-sm font-medium ${selectedChat.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {selectedChat.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Call</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Video</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Search</span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-xs text-gray-500">{selectedChat.email || 'user@example.com'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-xs text-gray-500">{selectedChat.phone || '+84 123 456 789'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-xs text-gray-500">{selectedChat.location || 'Ho Chi Minh City, Vietnam'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Member since</p>
                  <p className="text-xs text-gray-500">{selectedChat.memberSince || 'January 2024'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
export default ChatSideInfo;