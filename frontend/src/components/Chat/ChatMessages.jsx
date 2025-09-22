import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';

const ChatMessages = ({ selectedChat, messages, currentUser, typingUsers, isConnected }) => {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Welcome to Chat</h3>
          <p className="text-sm sm:text-base text-gray-600">Select a conversation to start messaging</p>
          {!isConnected && (
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
              🔌 Connecting to server...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {messages.map((message) => {
          // Fix logic để kiểm tra tin nhắn thuộc về ai
          const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
          const isOwn = senderId === currentUser?.id;
          const senderName = message.senderId?.name || 'Unknown';
          const senderAvatar = message.senderId?.avatar;
          
          console.log('Message debug:', {
            messageId: message._id,
            senderId: senderId,
            currentUserId: currentUser?.id,
            isOwn: isOwn,
            content: message.content
          });
          
          return (
            <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 sm:space-x-3 max-w-xs sm:max-w-lg ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwn && (
                  <img
                    src={senderAvatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=32&h=32&fit=crop&crop=face'}
                    alt={senderName}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex flex-col">
                  <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    isOwn 
                      ? 'bg-blue-500 text-white rounded-br-md' 
                      : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
                  }`}>
                    {message.type === 'text' && (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                    {message.type === 'images' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {message.images?.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img}
                                alt={`Image ${idx + 1}`}
                                className="w-full h-24 sm:h-32 object-cover rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 sm:space-x-3 max-w-xs sm:max-w-lg">
              <img
                src={selectedChat.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=32&h=32&fit=crop&crop=face'}
                alt={selectedChat.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex flex-col">
                <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-white text-gray-900 shadow-sm rounded-bl-md">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">typing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
export default ChatMessages;