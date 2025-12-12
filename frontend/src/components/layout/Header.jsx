// components/Admin/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../pages/Authen/AuthContext";
import { notificationService } from "../../api/notificationManagement";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import { toast } from "sonner";

const Header = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const userDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  // Load notifications
  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await notificationService.getNotifications(1, 10);
      // Đảm bảo data luôn là array
      const notificationsArray = Array.isArray(result.data) ? result.data : [];
      setNotifications(notificationsArray);
      setUnreadCount(result.unreadCount || 0);
    } catch (error) {
      console.error('Load notifications error:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (error) {
      console.error('Load unread count error:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [user]);

  // Listen real-time notifications từ Socket.io
  useEffect(() => {
    if (!socket || !user) return;

    // Join user's notification room
    socket.emit('joinChat', user.id);

    // Listen new notification event
    const handleNewNotification = (notification) => {
      // Thêm notification mới vào đầu danh sách
      setNotifications(prev => {
        // Kiểm tra xem notification đã tồn tại chưa (tránh duplicate)
        const exists = prev.some(n => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });
      
      // Tăng unread count
      setUnreadCount(prev => prev + 1);

      // Display toast notification with Sonner
      const getNotificationTitle = () => {
        switch (notification.type) {
          case 'event_registration':
            return 'Event Registration';
          case 'booking':
            return 'Booking';
          case 'event_approved':
            return 'Event Approved';
          case 'booking_confirmed':
            return 'Booking Confirmed';
          default:
            return 'New Notification';
        }
      };

      toast.success(getNotificationTitle(), {
        description: translateNotificationContent(notification.content),
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => setShowNotifications(true),
        },
      });
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format time ago - hiển thị chính xác thời gian
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Kiểm tra date hợp lệ
    if (isNaN(date.getTime())) return '';

    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInSeconds / 3600);
    const diffInDays = Math.floor(diffInSeconds / 86400);

    // If today
    if (diffInDays === 0) {
      if (diffInSeconds < 60) return 'Just now';
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
      }
      return `${diffInHours} hours ago`;
    }

    // If yesterday
    if (diffInDays === 1) {
      return 'Yesterday';
    }

    // If within this week
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }

    // If within this month
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} weeks ago`;
    }

    // If within this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'long' 
      });
    }

    // Different year - display in English locale
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  // Basic translation for common Vietnamese notification phrases to English
  const translateNotificationContent = (content = '') => {
    const replacements = [
      { vi: 'đã được phê duyệt', en: 'has been approved' },
      { vi: 'đã bị từ chối', en: 'was rejected' },
      { vi: 'trong sự kiện', en: 'in event' },
      { vi: 'sự kiện', en: 'event' },
      { vi: 'trận đấu', en: 'match' },
      { vi: 'đã được sắp xếp vào', en: 'has been scheduled on' },
      { vi: 'lúc', en: 'at' },
      { vi: 'đội', en: 'team' },
      { vi: 'Đội', en: 'Team' },
    ];
    let translated = content;
    replacements.forEach(({ vi, en }) => {
      translated = translated.replaceAll(vi, en);
    });
    return translated;
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_registration':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'booking':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'event_approved':
      case 'booking_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get avatar initials
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };


  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5 dark:text-white" />
          </button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search or type command..."
              className="pl-10 pr-12 py-2 w-64 lg:w-80 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              ⌘
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 dark:text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 dark:text-white" />
            )}
          </button>
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  loadNotifications();
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <Bell className="w-5 h-5 dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </div>
                  ) : !Array.isArray(notifications) || notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkAsRead(notification._id);
                          }
                        }}
                        className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {notification.senderId?.avatar ? (
                              <img
                                src={notification.senderId.avatar}
                                alt={notification.senderId.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {getAvatarInitials(notification.senderId?.name || 'U')}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {translateNotificationContent(notification.content)}
                                </p>
                                {notification.teamId && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Team: {notification.teamId.name}
                                  </p>
                                )}
                                {notification.eventId && (
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    Event: {notification.eventId.name}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                  {notification.createdAt && (
                                    <span className="ml-2 text-gray-400">
                                      • {new Date(notification.createdAt).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-4 text-center border-t dark:border-gray-700">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        // Có thể navigate đến trang notifications nếu có
                      }}
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex w-full items-center justify-start px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="flex w-full items-center justify-start px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Fallback for when user is not logged in (e.g., show login button or avatar placeholder
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
              <div className="hidden md:block">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Musharof
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 inline ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
