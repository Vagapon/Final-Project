import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../pages/Authen/AuthContext";
import ProfileModal from "../../pages/Admin/Users/ProfileModal";
import { notificationService } from "../../api/notificationManagement";
import { useSocket } from "../../contexts/SocketContext";
import { toast } from "sonner";
import {
  MessageCircle, Menu, User, X, Home, Trophy, Sparkles, BookOpen, 
  Bell, ChevronDown, Settings, LogOut, Calendar, Users, CheckCircle,
} from "lucide-react";

// Constants
const MENU_ITEMS = [
  { name: "Home", icon: Home, path: "/" },
  { name: "My Team", icon: User, path: "/myteam" },
  { name: "Challenge", icon: Trophy, path: "/challenge" },
  { name: "Blog", icon: BookOpen, path: "/blog" },
  { name: "Book Field", icon: Sparkles, path: "/book" },
];

// Helper function để format time
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) return '';

  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays === 0) {
    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    return `${diffInHours} hours ago`;
  }

  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} weeks ago`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  }

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
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

// Get avatar initials
const getAvatarInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Get notification icon
const getNotificationIcon = (type) => {
  switch (type) {
    case 'event_registration':
      return <Users className="w-4 h-4 text-blue-500" />;
    case 'booking':
      return <Calendar className="w-4 h-4 text-orange-500" />;
    case 'event_approved':
    case 'booking_confirmed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'match_scheduled':
      return <Trophy className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const DARK_BACKGROUND_PAGES = ["/", "/home"];

// Helper functions
const getTextColors = (pathname) => {
  const isDark = DARK_BACKGROUND_PAGES.includes(pathname);
  return {
    primary: isDark ? "text-white" : "text-gray-900",
    secondary: isDark ? "text-gray-300" : "text-gray-600",
    hover: isDark ? "hover:text-green-400" : "hover:text-blue-600",
    menuIcon: isDark ? "text-white hover:text-green-400" : "text-gray-900 hover:text-blue-600",
    background: isDark ? "hover:bg-white/10" : "hover:bg-gray-100",
  };
};

const useOutsideClick = (refs, callback, isActive) => {
  useEffect(() => {
    if (!isActive) return;
    const handleClick = (event) => {
      const isOutside = refs.every(ref => !ref.current?.contains(event.target));
      if (isOutside && !event.target.closest(".menu-toggle")) callback();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [refs, callback, isActive]);
};

// Components
const Logo = ({ isDarkBackground }) => (
  <div className="rounded-full p-2 sm:p-3">
    <img
      src="https://upload.wikimedia.org/wikipedia/vi/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png"
      alt="Logo"
      className={`w-20 h-20 sm:w-24 sm:h-24 object-contain ${isDarkBackground ? "brightness-0 invert" : ""}`}
    />
  </div>
);

const NotificationItem = ({ notification, index, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
  };

  const senderName = notification.senderId?.name || 'System';
  const senderAvatar = notification.senderId?.avatar;
  const timeAgo = formatTimeAgo(notification.createdAt);
  const timeString = notification.createdAt 
    ? new Date(notification.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${
        !notification.isRead ? "bg-blue-50/30" : ""
      }`}
      style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}
    >
      {!notification.isRead && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
      )}
      <div className="flex items-start space-x-3 ml-2">
        {senderAvatar ? (
          <img src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {getAvatarInitials(senderName)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 truncate">{senderName}</p>
            <div className="ml-2 flex items-center space-x-1 flex-shrink-0">
              {getNotificationIcon(notification.type)}
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {translateNotificationContent(notification.content)}
          </p>
          {notification.teamId && (
            <p className="text-xs text-blue-600 mt-1">Team: {notification.teamId.name}</p>
          )}
          {notification.eventId && (
            <p className="text-xs text-purple-600 mt-1">Event: {notification.eventId.name}</p>
          )}
          {timeString && (
            <p className="text-xs text-gray-400 mt-1">• {timeString}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationDropdown = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, unreadCount, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute right-16 top-full -mt-5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 transform -translate-x-1/4 sm:translate-x-0">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 rounded-full">
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button 
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification, index) => (
            <NotificationItem 
              key={notification._id || notification.id} 
              notification={notification} 
              index={index}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="w-full text-center text-blue-500 hover:text-blue-600 font-medium transition-colors">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

const MobileNotificationPanel = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, unreadCount, loading }) => (
  <div className={`fixed inset-0 z-50 sm:hidden transition-all duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 rounded-full">
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button 
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium mr-2"
            >
              Mark all as read
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification, index) => (
            <NotificationItem 
              key={notification._id || notification.id} 
              notification={notification} 
              index={index}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} className="w-full text-center text-blue-500 hover:text-blue-600 font-medium transition-colors py-2">
            View all notifications
          </button>
        </div>
      )}
    </div>
  </div>
);

const MobileMenu = ({ isOpen, onClose, menuItems, navigate, unreadCount, onNotificationOpen }) => {
  const { user, logout } = useAuth();
  
  const actionButtons = [
    { icon: MessageCircle, label: "Chat", badge: "0", action: () => navigate("/chat") },
    { icon: Bell, label: "Notification", badge: unreadCount > 0 ? unreadCount.toString() : null, action: () => setTimeout(() => onNotificationOpen(true), 300) },
    { icon: User, label: "Login", action: () => navigate("/login") },
  ];

  return (
    <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ease-out ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
      <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-gray-900 to-black shadow-2xl transform transition-all duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Header */}
        <div className="border-b border-gray-700 ml-6 mt-4 mb-4">
          {user ? (
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-green-400" />
                ) : (
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-white font-medium text-lg">{user.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2"><Logo isDarkBackground={true} /></div>
          )}
        </div>

        {/* Menu Items */}
        <div className="px-6 py-4">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name} to={item.path} onClick={onClose}
                  className="flex items-center space-x-4 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 ease-out transform hover:scale-105 hover:translate-x-1"
                  style={{ animationDelay: `${index * 0.05}s`, animation: isOpen ? `slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.05}s both` : "none" }}
                >
                  <Icon className="w-5 h-5 text-green-400" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 bg-gradient-to-t from-black to-transparent">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {actionButtons.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => { onClose(); item.action?.(); }}
                  className="relative flex flex-col items-center justify-center w-full h-full min-h-[60px] min-w-[60px] rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-300 ease-out transform hover:scale-110 hover:shadow-lg active:scale-95"
                  style={{ animationDelay: `${(menuItems.length + index) * 0.05}s`, animation: isOpen ? `slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(menuItems.length + index) * 0.05}s both` : "none" }}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {user && (
            <div className="flex space-x-2">
              <button onClick={() => { setProfileModalOpen(true); onClose(); }} className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                <User className="w-4 h-4" />
                <span>Hồ sơ</span>
              </button>
              <button onClick={() => { logout(); onClose(); }} className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserAvatar = ({ user }) => {
  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-green-400 flex-shrink-0" />;
  }
  return (
    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm font-medium">{user.name?.charAt(0)?.toUpperCase()}</span>
    </div>
  );
};

const UserDropdown = ({ isOpen, onClose, user, navigate, logout, onOpenProfile }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 top-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
      <div className="py-1">
        {[
          { icon: User, label: "Hồ sơ cá nhân", action: onOpenProfile, color: "text-gray-700 hover:bg-gray-100" },
          { icon: Settings, label: "Cài đặt", action: () => navigate("/settings"), color: "text-gray-700 hover:bg-gray-100" },
          { icon: LogOut, label: "Đăng xuất", action: logout, color: "text-red-600 hover:bg-red-50", divider: true },
        ].map((item, index) => (
          <React.Fragment key={item.label}>
            {item.divider && <div className="border-t border-gray-100 my-1"></div>}
            <button
              onClick={() => { item.action(); onClose(); }}
              className={`flex items-center w-full px-4 py-2 text-sm ${item.color} transition-colors duration-150`}
            >
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Main Header Component
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);
  const { user, logout, updateUser } = useAuth();
  const { socket } = useSocket();
  const colors = getTextColors(location.pathname);
  const isDarkBackground = DARK_BACKGROUND_PAGES.includes(location.pathname);
  
  // Xác định background cho header
  const getHeaderBackground = () => {
    if (isDarkBackground) {
      return ""; // Trang home - header trong suốt
    }
    return "bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 backdrop-blur-sm"; // Các trang khác
  };

  // Load notifications
  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await notificationService.getNotifications(1, 20);
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

  // Load notifications on mount and when user changes
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [user]);

  // Listen real-time notifications từ Socket.io
  useEffect(() => {
    if (!socket || !user) return;

    // Join user's notification room - đảm bảo user.id là string
    const userId = user.id || user._id;
    if (userId) {
      const userIdStr = userId.toString ? userId.toString() : String(userId);
      console.log('🔔 Joining notification room for user:', userIdStr);
      socket.emit('joinChat', userIdStr);
    }

    // Listen new notification event
    const handleNewNotification = (notification) => {
      console.log('🔔 Received new notification:', notification);
      
      // Kiểm tra duplicate dựa trên _id hoặc content + createdAt
      setNotifications(prev => {
        // Kiểm tra theo _id
        const existsById = prev.some(n => n._id === notification._id);
        if (existsById) {
          console.log('⚠️ Duplicate notification detected by ID, ignoring');
          return prev;
        }
        
        // Kiểm tra duplicate theo content và thời gian (trong vòng 5 giây)
        const now = new Date();
        const notificationTime = new Date(notification.createdAt);
        const timeDiff = Math.abs(now - notificationTime) / 1000; // seconds
        
        const duplicateByContent = prev.some(n => {
          const nTime = new Date(n.createdAt);
          const nTimeDiff = Math.abs(now - nTime) / 1000;
          return n.content === notification.content && 
                 n.receiveId?.toString() === notification.receiveId?.toString() &&
                 nTimeDiff < 5; // Trong vòng 5 giây
        });
        
        if (duplicateByContent) {
          console.log('⚠️ Duplicate notification detected by content, ignoring');
          return prev;
        }
        
        return [notification, ...prev];
      });
      
      setUnreadCount(prev => prev + 1);

      // Display toast notification
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
          case 'match_scheduled':
            return 'Match Schedule Arranged';
          default:
            // Check if notification is about rejection
            if (notification.content && notification.content.includes('bị từ chối')) {
              return 'Registration Rejected';
            }
            return 'New Notification';
        }
      };

      // Determine toast type based on notification type
      const isRejected = notification.content && notification.content.includes('bị từ chối');
      const toastType = isRejected ? 'error' : 'success';
      
      if (toastType === 'error') {
        toast.error(getNotificationTitle(), {
          description: translateNotificationContent(notification.content),
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => setNotificationOpen(true),
          },
        });
      } else {
        toast.success(getNotificationTitle(), {
          description: translateNotificationContent(notification.content),
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => setNotificationOpen(true),
          },
        });
      }
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, user]);

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

  // Event handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useOutsideClick([notificationRef], () => {
    if (menuOpen) setMenuOpen(false);
    if (notificationOpen) setNotificationOpen(false);
  }, menuOpen || notificationOpen);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  const iconButtons = [
    { icon: MessageCircle, count: 0, action: () => navigate("/chat") },
    { 
      icon: Bell, 
      count: unreadCount, 
      action: () => {
        setNotificationOpen(!notificationOpen);
        if (!notificationOpen && user) {
          loadNotifications();
        }
      }, 
      ref: notificationRef 
    },
  ];

  return (
    <>
      <nav className={`absolute top-0 left-0 right-0 z-40 ${getHeaderBackground()}`}>
        <div className="container mx-auto px-2 sm:px-3 py-4">
          <div className="flex items-center justify-between">
            <Logo isDarkBackground={isDarkBackground} />

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {MENU_ITEMS.map((item) => (
                <Link key={item.name} to={item.path} className={`${colors.primary} ${colors.hover} font-medium transition-colors duration-300 text-sm xl:text-base`}>
                  {item.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`menu-toggle lg:hidden ${colors.menuIcon} transition-all duration-300 ease-out p-2 rounded-lg ${colors.background} relative z-50 flex items-center justify-center order-first transform hover:scale-105 active:scale-95`}
              >
                <div className={`transition-all duration-300 ease-out ${menuOpen ? "rotate-180" : "rotate-0"}`}>
                  {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </div>
              </button>

              {/* Desktop Icons */}
              <div className="hidden sm:flex items-center space-x-3">
                {iconButtons.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center justify-center h-10" ref={item.ref}>
                      <button onClick={item.action} className={`relative ${colors.primary} ${colors.hover} transition-colors duration-300 p-2`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        {item.count > 0 && (
                          <span className={`absolute -top-1 -right-1 ${index === 0 ? 'bg-green-500' : 'bg-red-500 animate-pulse'} text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                      {index === 1 && (
                        <NotificationDropdown
                          isOpen={notificationOpen}
                          onClose={() => setNotificationOpen(false)}
                          notifications={notifications}
                          onMarkAsRead={handleMarkAsRead}
                          onMarkAllAsRead={handleMarkAllAsRead}
                          unreadCount={unreadCount}
                          loading={loading}
                        />
                      )}
                    </div>
                  );
                })}

                {/* User Section */}
                {user ? (
                  <div className="relative flex items-center justify-center h-10" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className={`flex items-center space-x-2 ${colors.primary} ${colors.hover} transition-colors duration-300 px-2 py-1 rounded-lg ${colors.background} max-w-[160px]`}
                    >
                      <UserAvatar user={user} />
                      <span className="text-sm font-medium hidden md:block truncate min-w-0 flex-1">
                        {user.name.split(" ").slice(-1)[0]}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${userDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    <UserDropdown
                      isOpen={userDropdownOpen}
                      onClose={() => setUserDropdownOpen(false)}
                      user={user}
                      navigate={navigate}
                      logout={logout}
                      onOpenProfile={() => setProfileModalOpen(true)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-10">
                    <button onClick={() => navigate("/login")} className={`${colors.primary} ${colors.hover} transition-colors duration-300 p-2`}>
                      <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Components */}
      <MobileNotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        unreadCount={unreadCount}
        loading={loading}
      />
      <MobileMenu
        isOpen={menuOpen && !notificationOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={MENU_ITEMS}
        navigate={navigate}
        unreadCount={unreadCount}
        onNotificationOpen={setNotificationOpen}
      />

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideInLeft {
          from { 
            opacity: 0; 
            transform: translateX(-30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
          }
        }
        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
          }
        }
      `}</style>
      {profileModalOpen && (
  <ProfileModal
    isOpen={profileModalOpen}
    onClose={() => setProfileModalOpen(false)}
    user={user}
    onUpdate={updateUser} 
  />    
)}

    </>
    
  );
};

export default Header;