import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-100 p-3 sm:p-4 safe-area-bottom">
      <div className="max-w-4xl mx-auto flex items-center space-x-2 sm:space-x-4">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Message..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        <button 
          onClick={handleSend}
          className="p-2 sm:p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatInput;