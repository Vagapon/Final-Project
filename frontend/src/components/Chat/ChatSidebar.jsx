import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
} from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";

const ChatSidebar = ({
  selectedChat,
  onChatSelect,
  isVisible,
  onBackClick,
  currentUser,
  chats,
  allUsers,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isUserOnline } = useSocket();

  // Lấy user hiện tại từ prop hoặc localStorage
  const user =
    currentUser || JSON.parse(localStorage.getItem("user") || "{}");

  // Lọc conversations và users theo search
  const filteredChats = chats.filter((chat) =>
    chat.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredUsers = allUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Tách users đã chat và chưa chat
  const chattedUserIds = chats.map(chat => chat._id);
  const usersWithChats = filteredUsers.filter(user => chattedUserIds.includes(user._id));
  const usersWithoutChats = filteredUsers.filter(user => !chattedUserIds.includes(user._id));

  if (loading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  return (
    <div
      className={`
      w-full sm:w-80 bg-white flex flex-col h-full
      ${isVisible ? "block" : "hidden lg:flex"}
    `}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          {/* User Profile Section */}
          {user && user.name ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-green-400 object-cover"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Chats
            </h1>
          )}

          {onBackClick && (
            <button
              onClick={onBackClick}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search messages or users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Quick Contacts - Tất cả users */}
        <div className="hidden sm:flex space-x-4">
          {filteredUsers.slice(0, 4).map((user) => (
            <div
              key={user._id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => onChatSelect(user)}
            >
              <div className="relative mb-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {isUserOnline(user._id) && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="text-xs text-gray-600">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 sm:p-4">
          {/* Users đã chat */}
          {filteredChats.length > 0 && (
            <>
              <h2 className="text-sm font-medium text-gray-500 mb-4 px-2">
                Recent Chats
              </h2>
              <div className="space-y-1 mb-6">
                {filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => onChatSelect(chat.otherUser)}
                    className={`flex items-center p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedChat?._id === chat._id
                        ? "bg-blue-50 shadow-sm"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {chat.otherUser?.avatar ? (
                        <img
                          src={chat.otherUser.avatar}
                          alt={chat.otherUser.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {chat.otherUser?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      {isUserOnline(chat._id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.otherUser?.name}
                        </h3>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Users chưa chat */}
          {usersWithoutChats.length > 0 && (
            <>
              <h2 className="text-sm font-medium text-gray-500 mb-4 px-2">
                Start New Chat
              </h2>
              <div className="space-y-1">
                {usersWithoutChats.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => onChatSelect(user)}
                    className={`flex items-center p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedChat?._id === user._id
                        ? "bg-blue-50 shadow-sm"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      {isUserOnline(user._id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        Start a conversation
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
