import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MessageCircle,
  Search,
  Menu,
  User,
  X,
  Home,
  Trophy,
  Sparkles,
  BookOpen,
  Bell,
} from "lucide-react";

// Constants
const MENU_ITEMS = [
  { name: "Home", icon: Home, path: "/home" },
  { name: "My Team", icon: User, path: "/myteam" },
  { name: "Challenge", icon: Trophy, path: "/challenge" },
  { name: "Blog", icon: BookOpen, path: "/blog" },
  { name: "Highlight", icon: Sparkles, path: "/highlight" },
];

const NOTIFICATIONS = [
  {
    id: 1,
    user: 'Kate Young',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbk-kYD_0sBDaSkcki5qP9gmQun3vq5Gan4A&s',
    action: 'Commented on your photo',
    message: 'Great Shot Adam! Really enjoying the composition on this piece.',
    time: '5 mins ago',
    isUnread: true,
  },
  {
    id: 2,
    user: 'Brandon Newman',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    action: 'Liked your album "100K logos"',
    message: '',
    time: '21 mins ago',
    isUnread: true,
  },
  {
    id: 3,
    user: 'Dave Wood',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    action: 'Liked your photo "Daily UI Challenge 049"',
    message: '',
    time: '3hrs ago',
    isUnread: false,
  },
];

// Logo Component
const Logo = ({ className = "" }) => (
  <div className={`rounded-full p-2 sm:p-3 ${className}`}>
    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
      <img
        src="https://upload.wikimedia.org/wikipedia/vi/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png"
        alt="Logo"
        className="w-20 h-20 sm:w-24 sm:h-24 object-contain brightness-0 invert"
      />
    </div>
  </div>
);

// Notification Item Component
const NotificationItem = ({ notification, index }) => (
  <div
    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${
      notification.isUnread ? 'bg-blue-50/30' : ''
    }`}
    style={{
      animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`
    }}
  >
    {notification.isUnread && (
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
    )}
    
    <div className="flex items-start space-x-3 ml-2">
      <img
        src={notification.avatar}
        alt={notification.user}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {notification.user}
          </p>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {notification.time}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{notification.action}</p>
        {notification.message && (
          <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded-lg">
            {notification.message}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Notification Dropdown Component
const NotificationDropdown = ({ isOpen, onClose, notifications, unreadCount }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 transform transition-all duration-300 origin-top-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 rounded-full">
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification, index) => (
          <NotificationItem key={notification.id} notification={notification} index={index} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 rounded-b-2xl">
        <button
          onClick={onClose}
          className="w-full text-center text-blue-500 hover:text-blue-600 font-medium transition-colors"
        >
          See all incoming activity
        </button>
      </div>
    </div>
  );
};

// Mobile Notification Panel Component
const MobileNotificationPanel = ({ isOpen, onClose, notifications }) => (
  <div
    className={`fixed inset-0 z-50 sm:hidden transition-all duration-300 ${
      isOpen ? "visible opacity-100" : "invisible opacity-0"
    }`}
  >
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    
    <div
      className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 rounded-full">
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.map((notification, index) => (
          <NotificationItem key={notification.id} notification={notification} index={index} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full text-center text-blue-500 hover:text-blue-600 font-medium transition-colors py-2"
        >
          See all incoming activity
        </button>
      </div>
    </div>
  </div>
);

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose, menuItems, navigate, unreadCount, onNotificationOpen }) => (
  <div
    className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
      isOpen ? "visible opacity-100" : "invisible opacity-0"
    }`}
  >
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

    <div
      className={`mobile-menu absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-gray-900 to-black shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Menu Header */}
      <div className="flex items-center ml-6 border-b border-gray-700">
        <Logo />
      </div>

      {/* Menu Items */}
      <div className="px-6 py-4">
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-4 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                onClick={onClose}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: isOpen ? `slideInLeft 0.5s ease-out ${index * 0.1}s both` : "none",
                }}
              >
                <Icon className="w-5 h-5 text-green-400" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Menu Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 bg-gradient-to-t from-black to-transparent">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: MessageCircle, label: "Chat", badge: "0", action: () => navigate("/chat") },
            { 
              icon: Bell, 
              label: "Notification", 
              badge: unreadCount > 0 ? unreadCount.toString() : null,
              action: () => {
                setTimeout(() => onNotificationOpen(true), 300);
              }
            },
            { icon: Search, label: "Search" },
            { icon: User, label: "Profile" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onClose();
                  item.action?.();
                }}
                className="relative flex flex-col items-center justify-center w-full h-full min-h-[60px] min-w-[60px] rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105"
                style={{
                  animationDelay: `${(menuItems.length + index) * 0.1}s`,
                  animation: isOpen
                    ? `slideInLeft 0.5s ease-out ${(menuItems.length + index) * 0.1}s both`
                    : "none",
                }}
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

        <button
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          style={{
            animationDelay: `${(menuItems.length + 3) * 0.1}s`,
            animation: isOpen ? `slideInLeft 0.5s ease-out ${(menuItems.length + 3) * 0.1}s both` : "none",
          }}
        >
          Join Our Club
        </button>
      </div>
    </div>
  </div>
);

// Custom Hook for outside click
const useOutsideClick = (refs, callback, isActive) => {
  useEffect(() => {
    if (!isActive) return;

    const handleOutsideClick = (event) => {
      const isOutside = refs.every(ref => 
        !ref.current || !ref.current.contains(event.target)
      );
      
      if (isOutside && !event.target.closest('.menu-toggle')) {
        callback();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [refs, callback, isActive]);
};

// Main Header Component
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  const unreadCount = NOTIFICATIONS.filter(n => n.isUnread).length;

  // Handle outside clicks
  useOutsideClick(
    [notificationRef],
    () => {
      if (menuOpen) setMenuOpen(false);
      if (notificationOpen) setNotificationOpen(false);
    },
    menuOpen || notificationOpen
  );

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  return (
    <>
      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-white hover:text-green-400 font-medium transition-colors duration-300 text-sm xl:text-base"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="menu-toggle lg:hidden text-white hover:text-green-400 transition-all duration-300 p-2 rounded-lg hover:bg-white/10 relative z-50 flex items-center justify-center order-first"
              >
                {menuOpen ? (
                  <X className="w-6 h-6 transition-all duration-300" />
                ) : (
                  <Menu className="w-6 h-6 transition-all duration-300" />
                )}
              </button>

              {/* Desktop Icons */}
              <div className="hidden sm:flex items-center space-x-3">
                <button
                  onClick={() => navigate("/chat")}
                  className="relative text-white hover:text-green-400 transition-colors duration-300"
                >
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    0
                  </span>
                </button>
                
                {/* Notification Bell with Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative text-white hover:text-green-400 transition-colors duration-300"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown
                    isOpen={notificationOpen}
                    onClose={() => setNotificationOpen(false)}
                    notifications={NOTIFICATIONS}
                    unreadCount={unreadCount}
                  />
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="text-white hover:text-green-400 transition-colors duration-300"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Components */}
      <MobileNotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notifications={NOTIFICATIONS}
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
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Header;