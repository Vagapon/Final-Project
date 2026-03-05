import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { userApi } from '../api';
import { Loader2 } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

const UserProfileViewModal = ({ isOpen, onClose, userId, userData: initialUserData, onChatClick }) => {
  const [userData, setUserData] = useState(initialUserData || null);
  const [loading, setLoading] = useState(false);
  const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

  useEffect(() => {
    if (isOpen) {
      // Use initial user data if provided, otherwise try to fetch
      if (initialUserData) {
        setUserData(initialUserData);
        setLoading(false);
      } else if (userId) {
        // Try to fetch additional data if needed, but don't block on it
        fetchUserProfile();
      }
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [isOpen, userId, initialUserData]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Try to get from chat-users API which is available to all authenticated users
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/user/chat-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const foundUser = data.data?.find(u => u._id === userId);
        if (foundUser) {
          setUserData(foundUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Keep using initial user data if fetch fails
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">User Profile</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : userData ? (
            <div className="p-6 space-y-6">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name || 'User'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-200 shadow-lg">
                    <span className="text-white text-4xl font-bold">
                      {(userData.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{userData.name || 'User'}</h3>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>Email</span>
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {userData.email || <span className="text-gray-400 italic">Not provided</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>Phone</span>
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {userData.phone_number || <span className="text-gray-400 italic">Not provided</span>}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>Address</span>
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {userData.address || <span className="text-gray-400 italic">Not provided</span>}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {userData.created_date ? new Date(userData.created_date).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>

              {/* Action Button */}
              {onChatClick && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      onChatClick();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Start Chat</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Unable to load user profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileViewModal;

