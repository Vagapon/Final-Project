import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../pages/Authen/AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      const token = localStorage.getItem('token');
      
      // Get socket URL from environment or use localhost for dev
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      const newSocket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to server:', newSocket.id);
        setIsConnected(true);
        
        // Join user's personal room
        newSocket.emit('joinChat', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
        setIsConnected(false);
      });

      // Online users events
      newSocket.on('onlineUsers', (users) => {
        console.log('👥 Online users:', users);
        setOnlineUsers(users);
      });

      newSocket.on('userOnline', (data) => {
        console.log('👤 User came online:', data.userId);
        setOnlineUsers(prev => [...prev, data.userId]);
      });

      newSocket.on('userOffline', (data) => {
        console.log('👤 User went offline:', data.userId);
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      };
    }
  }, [user]);

  const value = {
    socket,
    onlineUsers,
    isConnected,
    isUserOnline: (userId) => onlineUsers.includes(userId)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
