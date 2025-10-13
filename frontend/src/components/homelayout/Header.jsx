import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../pages/Authen/AuthContext";
import ProfileModal from "../../pages/Admin/Users/ProfileModal";
import {
  MessageCircle, Menu, User, X, Home, Trophy, Sparkles, BookOpen, 
  Bell, ChevronDown, Settings, LogOut,
} from "lucide-react";

// Constants
const MENU_ITEMS = [
  { name: "Home", icon: Home, path: "/" },
  { name: "My Team", icon: User, path: "/myteam" },
  { name: "Challenge", icon: Trophy, path: "/challenge" },
  { name: "Blog", icon: BookOpen, path: "/blog" },
  { name: "Book Field", icon: Sparkles, path: "/book" },
];

const NOTIFICATIONS = [
  {
    id: 1, user: "Kate Young",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbk-kYD_0sBDaSkcki5qP9gmQun3vq5Gan4A&s",
    action: "Commented on your photo",
    message: "Great Shot Adam! Really enjoying the composition on this piece.",
    time: "5 mins ago", isUnread: true,
  },
  {
    id: 2, user: "Brandon Newman",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    action: 'Liked your album "100K logos"', message: "",
    time: "21 mins ago", isUnread: true,
  },
  {
    id: 3, user: "Dave Wood",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    action: 'Liked your photo "Daily UI Challenge 049"', message: "",
    time: "3hrs ago", isUnread: false,
  },
];

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

const NotificationItem = ({ notification, index }) => (
  <div
    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${
      notification.isUnread ? "bg-blue-50/30" : ""
    }`}
    style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}
  >
    {notification.isUnread && (
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
    )}
    <div className="flex items-start space-x-3 ml-2">
      <img src={notification.avatar} alt={notification.user} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 truncate">{notification.user}</p>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{notification.time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{notification.action}</p>
        {notification.message && (
          <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded-lg">{notification.message}</p>
        )}
      </div>
    </div>
  </div>
);

const NotificationDropdown = ({ isOpen, onClose, notifications }) => {
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
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification, index) => (
          <NotificationItem key={notification.id} notification={notification} index={index} />
        ))}
      </div>
      <div className="p-4 bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="w-full text-center text-blue-500 hover:text-blue-600 font-medium transition-colors">
          See all incoming activity
        </button>
      </div>
    </div>
  );
};

const MobileNotificationPanel = ({ isOpen, onClose, notifications }) => (
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
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.map((notification, index) => (
          <NotificationItem key={notification.id} notification={notification} index={index} />
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button onClick={onClose} className="w-full text-center text-blue-500 hover:text-blue-600 font-medium transition-colors py-2">
          See all incoming activity
        </button>
      </div>
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
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);
  const { user, logout, updateUser } = useAuth();
  const unreadCount = NOTIFICATIONS.filter(n => n.isUnread).length;
  const colors = getTextColors(location.pathname);
  const isDarkBackground = DARK_BACKGROUND_PAGES.includes(location.pathname);

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
    { icon: Bell, count: unreadCount, action: () => setNotificationOpen(!notificationOpen), ref: notificationRef },
  ];

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-40">
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
                          notifications={NOTIFICATIONS}
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