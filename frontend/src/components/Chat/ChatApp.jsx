
import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, MessageCircle, Users, Settings, User, Clock, Globe, ArrowLeft, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import ChatSidebar from './ChatSidebar';    
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';  
import ChatInput from './ChatInput';
import ChatSideInfo from './ChatSideInfo';
import { useSocket } from '../../contexts/SocketContext';

const ChatApp = () => {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSideInfo, setShowSideInfo] = useState(false);
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const [showChatList, setShowChatList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const { socket, isConnected, isUserOnline } = useSocket();

  // Get current user from localStorage and load conversations
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
             // Load conversations and users from API
             const loadData = async () => {
               if (user && user.id) {
                 try {
                   const token = localStorage.getItem('token');
                   // console.log('🔑 Loading data with token:', token ? 'Present' : 'Missing');
                   // console.log('👤 Current user:', user);
                   
                   // Load conversations
                   const conversationsResponse = await fetch('http://localhost:5000/api/messages/conversations/list', {
                     headers: {
                       'Authorization': `Bearer ${token}`,
                       'Content-Type': 'application/json'
                     }
                   });
                   
                   // console.log('📋 Conversations response status:', conversationsResponse.status);
                   
                   // Load all users
                   const usersResponse = await fetch('http://localhost:5000/api/user/chat-users', {
                     headers: {
                       'Authorization': `Bearer ${token}`,
                       'Content-Type': 'application/json'
                     }
                   });
                   
                   // console.log('👥 Users response status:', usersResponse.status);
                   
                   if (conversationsResponse.ok) {
                     const conversationsData = await conversationsResponse.json();
                     // console.log('📋 Conversations loaded:', conversationsData);
                     setChats(conversationsData.conversations || []);
                   } else {
                     console.error('❌ Failed to load conversations:', conversationsResponse.status, conversationsResponse.statusText);
                     const errorText = await conversationsResponse.text();
                     console.error('❌ Error details:', errorText);
                     setChats([]);
                   }
                   
                   if (usersResponse.ok) {
                     const usersData = await usersResponse.json();
                     // console.log('👥 Users loaded:', usersData);
                     setAllUsers(usersData.data || []);
                   } else {
                     console.error('❌ Failed to load users:', usersResponse.status, usersResponse.statusText);
                     const errorText = await usersResponse.text();
                     console.error('❌ Error details:', errorText);
                     setAllUsers([]);
                   }
                 } catch (error) {
                   console.error('❌ Error loading data:', error);
                   setChats([]);
                   setAllUsers([]);
                 }
               } else {
                 console.error('❌ No user or user.id found:', user);
               }
               setLoading(false);
             };
    
    loadData();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (socket && currentUser) {
               // Listen for new messages
               socket.on('receiveMessage', (message) => {
                 // console.log('📨 Received message:', message);
        
        // Add message to current chat if it matches
        if (selectedChat) {
          const currentChatRoomId = [currentUser.id, selectedChat._id].sort().join('_');
          if (message.chatRoomId === currentChatRoomId) {
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(msg => msg._id === message._id);
              if (!exists) {
                // Replace temporary message with real message
                const filteredPrev = prev.filter(msg => !msg._id.startsWith('temp_'));
                return [...filteredPrev, message];
              }
              return prev;
            });
          }
        }
        
        // Update chat list with latest message
        setChats(prev => {
          const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
          const receiverId = typeof message.receiveId === 'object' ? message.receiveId._id : message.receiveId;
          
          // Find the chat that matches this message
          const updatedChats = prev.map(chat => {
            // Check if this chat involves the sender or receiver
            if (chat._id === senderId || chat._id === receiverId) {
              return {
                ...chat,
                lastMessage: message.content,
                lastMessageTime: message.createdAt,
                unreadCount: senderId !== currentUser.id ? (chat.unreadCount || 0) + 1 : chat.unreadCount
              };
            }
            return chat;
          });
          
          // If no existing chat found, create a new one
          const existingChat = prev.find(chat => chat._id === senderId || chat._id === receiverId);
          if (!existingChat) {
            // Find the other user info
            const otherUserId = senderId === currentUser.id ? receiverId : senderId;
            const otherUser = allUsers.find(user => user._id === otherUserId);
            
            if (otherUser) {
              updatedChats.unshift({
                _id: otherUserId,
                otherUser: otherUser,
                lastMessage: message.content,
                lastMessageTime: message.createdAt,
                unreadCount: senderId !== currentUser.id ? 1 : 0
              });
            }
          }
          
          return updatedChats;
        });
      });

      // Listen for typing indicators
      socket.on('userTyping', (data) => {
        if (data.userId !== currentUser.id) {
          setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        }
      });

      socket.on('userStopTyping', (data) => {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      });

      // Listen for message read status
      socket.on('messagesRead', (data) => {
        console.log('📖 Messages read by:', data.receiverId);
        // Update UI to show messages as read
      });

      // Listen for connection status
      socket.on('connect', () => {
        console.log('🔌 Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('userTyping');
        socket.off('userStopTyping');
        socket.off('messagesRead');
        socket.off('connect');
        socket.off('disconnect');
      };
    }
  }, [socket, currentUser, allUsers, selectedChat]);

  // Mock messages data
  const mockMessages = [
    {
      _id: 'msg1',
      senderId: '1',
      content: 'Hello! How are you?',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      isOwn: false,
      type: 'text'
    },
    {
      _id: 'msg2',
      senderId: currentUser?._id || 'current',
      content: 'I am doing great, thanks!',
      createdAt: new Date(Date.now() - 200000).toISOString(),
      isOwn: true,
      type: 'text'
    },
    {
      _id: 'msg3',
      senderId: '1',
      content: 'That is wonderful to hear!',
      createdAt: new Date(Date.now() - 100000).toISOString(),
      isOwn: false,
      type: 'text'
    }
  ];

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

  const handleChatSelect = async (chat) => {
    // console.log('🎯 Chat selected:', chat);
    // console.log('🎯 Chat name:', chat.name);
    // console.log('🎯 Chat avatar:', chat.avatar);
    // console.log('🎯 Chat email:', chat.email);
    // console.log('🎯 Chat isOnline:', chat.isOnline);
    
    // Add isOnline status from socket context
    const chatWithOnlineStatus = {
      ...chat,
      isOnline: isUserOnline(chat._id)
    };
    
    // console.log('🎯 Chat with online status:', chatWithOnlineStatus);
    
    setSelectedChat(chatWithOnlineStatus);
    if (isMobile) {
      setShowChatList(false);
    }
    
    if (socket && currentUser) {
      // Join chat room
      const chatRoomId = [currentUser.id, chat._id].sort().join('_');
      socket.emit('joinChat', chatRoomId);
      
      // console.log('Loading messages for chatRoomId:', chatRoomId);
      
        // Load messages for this chat
        try {
          const token = localStorage.getItem('token');
          // console.log('🔑 Token for messages API:', token ? 'Present' : 'Missing');
          // console.log('🔑 Token value:', token);
          
          const response = await fetch(`http://localhost:5000/api/messages/${chatRoomId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // console.log('Messages API response status:', response.status);
          // console.log('Messages API response headers:', response.headers);
          
          if (response.ok) {
            const data = await response.json();
            // console.log('Messages loaded:', data.messages);
            setMessages(data.messages || []);
          } else {
            const errorData = await response.json();
            console.error('Failed to load messages:', errorData);
            setMessages([]);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
        }
      
      // Mark messages as read
      socket.emit('markAsRead', {
        senderId: chat._id,
        receiverId: currentUser.id
      });
    }
  };

  // Handle navigation from blog page with userId
  useEffect(() => {
    if (location.state?.userId && allUsers.length > 0 && currentUser) {
      const targetUserId = location.state.userId;
      // Find user in allUsers or chats
      const targetUser = allUsers.find(u => u._id === targetUserId) || 
                        chats.find(c => c._id === targetUserId);
      
      if (targetUser) {
        // Create chat object if not exists
        const chatToSelect = {
          _id: targetUser._id,
          otherUser: targetUser,
          name: targetUser.name || location.state.userName,
          avatar: targetUser.avatar,
          email: targetUser.email
        };
        handleChatSelect(chatToSelect);
      } else {
        // User not found in list, create a temporary chat object
        const tempChat = {
          _id: targetUserId,
          otherUser: { _id: targetUserId, name: location.state.userName || 'User' },
          name: location.state.userName || 'User',
          avatar: null,
          email: null
        };
        handleChatSelect(tempChat);
      }
      
      // Clear location state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state, allUsers, chats, currentUser]);

  const handleSendMessage = (content) => {
    if (!selectedChat || !content.trim() || !socket || !currentUser) return;
    
    const messageData = {
      senderId: currentUser.id,
      receiveId: selectedChat._id,
      content: content.trim(),
      type: 'text'
    };
    
    // Create temporary message for immediate UI update
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      senderId: { 
        _id: currentUser.id,
        name: currentUser.name, 
        avatar: currentUser.avatar 
      },
      receiveId: selectedChat._id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      type: 'text'
    };
    
    // Add message to local state immediately for better UX
    setMessages(prev => [...prev, tempMessage]);
    
    // Update chat list immediately
    setChats(prev => prev.map(chat => {
      if (chat._id === selectedChat._id) {
        return {
          ...chat,
          lastMessage: content.trim(),
          lastMessageTime: new Date().toISOString()
        };
      }
      return chat;
    }));
    
    // Send message via socket
    socket.emit('sendMessage', messageData);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setShowChatList(true);
  };


  const handleInfoToggle = () => {
    setShowSideInfo(!showSideInfo);
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Chat Sidebar */}
      <ChatSidebar 
        selectedChat={selectedChat} 
        onChatSelect={handleChatSelect}
        isVisible={showChatList}
        onBackClick={handleBackToChats}
        chats={chats}
        allUsers={allUsers}
        loading={loading}
        currentUser={currentUser}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${showChatList && isMobile ? 'hidden' : 'flex'}`}>
        <ChatHeader 
          selectedChat={selectedChat}
          onBackClick={handleBackToChats}
          onInfoToggle={handleInfoToggle}
        />
        <ChatMessages 
          selectedChat={selectedChat} 
          messages={messages} 
          currentUser={currentUser}
          typingUsers={typingUsers}
          isConnected={isConnected}
        />
        {selectedChat && (
          <ChatInput 
            onSendMessage={handleSendMessage}
            selectedChat={selectedChat}
            currentUser={currentUser}
            socket={socket}
          />
        )}
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