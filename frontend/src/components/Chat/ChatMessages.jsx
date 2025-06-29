import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';

const ChatMessages = ({ selectedChat }) => {
  const messages = [
    {
      id: 1,
      sender: 'Doris Brown',
      content: 'Check out these photos from our recent project!',
      time: '10:30',
      isOwn: false,
      type: 'text'
    },
    {
      id: 2,
      sender: 'Doris Brown',
      content: '',
      time: '10:30',
      isOwn: false,
      type: 'images',
      images: [
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=150&fit=crop'
      ]
    },
    {
      id: 3,
      sender: 'You',
      content: 'typing',
      time: '01:30',
      isOwn: true,
      type: 'typing'
    }
  ];

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Welcome to Chat</h3>
          <p className="text-sm sm:text-base text-gray-600">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end space-x-2 sm:space-x-3 max-w-xs sm:max-w-lg ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!message.isOwn && (
                <img
                  src={selectedChat.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=32&h=32&fit=crop&crop=face'}
                  alt={selectedChat.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex flex-col">
                <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                  message.isOwn 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
                }`}>
                  {message.type === 'text' && (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  {message.type === 'images' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-24 sm:h-32 object-cover rounded-lg"
                            />
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              📥
                            </div>
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 py-1 rounded">
                              ⋯
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {message.type === 'typing' && (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">typing</span>
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                  {message.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ChatMessages;