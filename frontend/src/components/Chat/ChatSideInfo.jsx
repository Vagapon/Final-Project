import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';

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
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Files</h3>
            <button 
              onClick={onClose}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-medium">
                📄
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">admin_v1.0.zip</p>
                <p className="text-xs text-gray-500">12.5 MB</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 17a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 10-2 0H5a1 1 0 10-2 0v1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
                  </svg>
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-xs text-gray-500 mb-2">01:30</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h4 className="text-sm font-medium text-gray-900">Share</h4>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4">
              <h4 className="text-sm font-medium text-gray-900">Delete</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Smith</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ChatSideInfo;