
import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, Menu, X } from 'lucide-react';
import MainSidebar from './MainSidebar';
import ChatSidebar from './ChatSidebar';    
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';  
import ChatInput from './ChatInput';
import ChatSideInfo from './ChatSideInfo';

const ChatApp = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSideInfo, setShowSideInfo] = useState(false);
  const [showMainSidebar, setShowMainSidebar] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setShowChatList(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowChatList(false);
    }
  };

  const handleSendMessage = (message) => {
    console.log('Sending message:', message);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setShowChatList(true);
  };

  const handleMenuToggle = () => {
    setShowMainSidebar(!showMainSidebar);
  };

  const handleInfoToggle = () => {
    setShowSideInfo(!showSideInfo);
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Main Sidebar */}
      <MainSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        isOpen={showMainSidebar}
        onToggle={handleMenuToggle}
      />
      
      {/* Chat Sidebar */}
      <ChatSidebar 
        selectedChat={selectedChat} 
        onChatSelect={handleChatSelect}
        isVisible={showChatList}
        onBackClick={handleBackToChats}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${showChatList && isMobile ? 'hidden' : 'flex'}`}>
        <ChatHeader 
          selectedChat={selectedChat}
          onBackClick={handleBackToChats}
          onMenuToggle={handleMenuToggle}
          onInfoToggle={handleInfoToggle}
        />
        <ChatMessages selectedChat={selectedChat} />
        {selectedChat && <ChatInput onSendMessage={handleSendMessage} />}
      </div>

      {/* Side Info Panel */}
      <ChatSideInfo 
        selectedChat={selectedChat}
        isVisible={showSideInfo}
        onClose={() => setShowSideInfo(false)}
      />
    </div>
  );
};

export default ChatApp;