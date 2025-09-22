# 📱 Chat Application - Technical Documentation

## 🎯 Tổng quan

Ứng dụng chat real-time được xây dựng với **React + Socket.IO + MongoDB**, hỗ trợ gửi tin nhắn tức thời giữa các users với giao diện hiện đại và responsive.

## 🏗️ Kiến trúc hệ thống

```
Frontend (React)          Backend (Node.js)           Database (MongoDB)
├── ChatApp.jsx          ├── server.js               ├── Users Collection
├── ChatSidebar.jsx      ├── messageController.js    ├── Messages Collection
├── ChatHeader.jsx       ├── authMiddleware.js       └── UserRoles Collection
├── ChatMessages.jsx     ├── userController.js
├── ChatInput.jsx        └── Socket.IO Server
└── ChatSideInfo.jsx
```

## 🔧 Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Context API** - State management

### Backend
- **Node.js + Express** - Server framework
- **Socket.IO** - WebSocket communication
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **CORS** - Cross-origin requests

## 📋 Chức năng chính

### 1. 🔐 Authentication & Authorization
```javascript
// JWT Token verification
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

**Tính năng:**
- ✅ Đăng nhập/đăng ký với JWT
- ✅ Bảo mật API endpoints
- ✅ Socket.IO authentication
- ✅ Auto-logout khi token hết hạn

### 2. 👥 User Management
```javascript
// Lấy danh sách users để chat
const getChatUsers = async (req, res) => {
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select('name email avatar role')
    .lean();
  
  // Thêm online status từ Socket.IO
  users.forEach(user => {
    user.isOnline = isUserOnline(user._id);
  });
};
```

**Tính năng:**
- ✅ Hiển thị danh sách users
- ✅ Online/Offline status real-time
- ✅ User profile (avatar, name, email)
- ✅ Phân quyền Admin/Staff/User

### 3. 💬 Real-time Messaging
```javascript
// Socket.IO message handling
socket.on("sendMessage", async (data) => {
  // Lưu message vào database
  const message = new Message({
    senderId: data.senderId,
    receiveId: data.receiveId,
    content: data.content,
    type: 'text'
  });
  
  const savedMessage = await message.save();
  
  // Emit đến cả sender và receiver
  const chatRoomId = [data.senderId, data.receiveId].sort().join('_');
  io.to(chatRoomId).emit("receiveMessage", savedMessage);
});
```

**Tính năng:**
- ✅ Gửi/nhận tin nhắn real-time
- ✅ Lưu trữ tin nhắn trong database
- ✅ Chat room tự động tạo
- ✅ Typing indicators
- ✅ Message status (sent/delivered/read)

### 4. 📱 UI Components

#### ChatApp.jsx - Main Container
```javascript
const ChatApp = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // Socket event handlers
  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
      updateChatList(message);
    });
  }, []);
};
```

**Chức năng:**
- ✅ Quản lý state chính của chat
- ✅ Xử lý socket events
- ✅ Load conversations và users
- ✅ Responsive design (mobile/desktop)

#### ChatSidebar.jsx - User List
```javascript
const ChatSidebar = ({ chats, allUsers, onChatSelect }) => {
  // Phân loại users
  const chattedUserIds = chats.map(chat => chat._id);
  const usersWithChats = allUsers.filter(user => chattedUserIds.includes(user._id));
  const usersWithoutChats = allUsers.filter(user => !chattedUserIds.includes(user._id));
  
  return (
    <div>
      {/* Quick Contacts */}
      <div className="hidden sm:flex space-x-4">
        {allUsers.slice(0, 4).map(user => (
          <UserAvatar key={user._id} user={user} onClick={() => onChatSelect(user)} />
        ))}
      </div>
      
      {/* Recent Chats */}
      <div className="space-y-1">
        {usersWithChats.map(chat => (
          <ChatItem key={chat._id} chat={chat} onClick={() => onChatSelect(chat.otherUser)} />
        ))}
      </div>
      
      {/* Start New Chat */}
      <div className="space-y-1">
        {usersWithoutChats.map(user => (
          <UserItem key={user._id} user={user} onClick={() => onChatSelect(user)} />
        ))}
      </div>
    </div>
  );
};
```

**Chức năng:**
- ✅ Quick Contacts (4 users đầu tiên)
- ✅ Recent Chats (users đã chat)
- ✅ Start New Chat (users chưa chat)
- ✅ Online status indicators
- ✅ Search functionality
- ✅ Unread message counts

#### ChatHeader.jsx - Chat Info
```javascript
const ChatHeader = ({ selectedChat, onBackClick, onInfoToggle }) => {
  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center">
        <UserAvatar user={selectedChat} />
        <div className="ml-3">
          <h2 className="font-semibold">{selectedChat.name}</h2>
          <div className="flex items-center">
            <OnlineIndicator isOnline={selectedChat.isOnline} />
            <span className="text-sm text-green-600">
              {selectedChat.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <SearchButton />
        <PhoneButton />
        <VideoButton />
        <InfoButton onClick={onInfoToggle} />
      </div>
    </div>
  );
};
```

**Chức năng:**
- ✅ Hiển thị thông tin user đang chat
- ✅ Online/Offline status
- ✅ Action buttons (search, call, video, info)
- ✅ Mobile back button
- ✅ Responsive design

#### ChatMessages.jsx - Message Display
```javascript
const ChatMessages = ({ messages, currentUser, typingUsers }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <MessageBubble 
          key={message._id}
          message={message}
          isOwn={message.senderId === currentUser.id}
        />
      ))}
      
      {/* Typing indicators */}
      {typingUsers.map(user => (
        <TypingIndicator key={user.id} user={user} />
      ))}
    </div>
  );
};
```

**Chức năng:**
- ✅ Hiển thị tin nhắn theo thời gian
- ✅ Phân biệt tin nhắn gửi/nhận
- ✅ Typing indicators
- ✅ Auto-scroll to bottom
- ✅ Message timestamps

#### ChatInput.jsx - Message Input
```javascript
const ChatInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleTyping = (e) => {
    setMessage(e.target.value);
    onTyping(e.target.value);
  };
  
  return (
    <div className="bg-white border-t p-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSend} className="p-3 bg-blue-500 text-white rounded-lg">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
```

**Chức năng:**
- ✅ Input field với validation
- ✅ Send button
- ✅ Typing detection
- ✅ Enter key to send
- ✅ Auto-focus

#### ChatSideInfo.jsx - Contact Details
```javascript
const ChatSideInfo = ({ selectedChat, isVisible, onClose }) => {
  return (
    <div className={`bg-white border-l w-80 ${isVisible ? 'block' : 'hidden'}`}>
      {/* User Profile */}
      <div className="p-6 text-center">
        <UserAvatar user={selectedChat} size="large" />
        <h2 className="text-xl font-semibold mt-4">{selectedChat.name}</h2>
        <OnlineStatus isOnline={selectedChat.isOnline} />
      </div>
      
      {/* Contact Details */}
      <div className="p-6 space-y-4">
        <ContactItem icon={<Mail />} label="Email" value={selectedChat.email} />
        <ContactItem icon={<Phone />} label="Phone" value={selectedChat.phone} />
        <ContactItem icon={<MapPin />} label="Location" value={selectedChat.location} />
        <ContactItem icon={<Calendar />} label="Member since" value={selectedChat.memberSince} />
      </div>
    </div>
  );
};
```

**Chức năng:**
- ✅ Chi tiết thông tin user
- ✅ Contact information
- ✅ Online status
- ✅ Responsive sidebar
- ✅ Close button

## 🔄 Data Flow

### 1. User Authentication
```
Login → JWT Token → localStorage → API Headers → Socket Auth
```

### 2. Message Sending
```
User types → ChatInput → handleSendMessage → Socket emit → Backend → Database → Socket broadcast → All clients
```

### 3. Message Receiving
```
Socket receive → receiveMessage handler → Update messages state → Re-render UI
```

### 4. Online Status
```
User connects → Socket join → Update onlineUsers → Broadcast to all → Update UI
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  avatar: String,
  role: String, // Admin, Staff, User
  phone: String,
  location: String,
  memberSince: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  senderId: ObjectId, // Reference to User
  receiveId: ObjectId, // Reference to User
  content: String,
  type: String, // text, image, file
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Socket.IO Events

### Client → Server
- `sendMessage` - Gửi tin nhắn
- `joinChat` - Tham gia chat room
- `userTyping` - Đang gõ
- `userStopTyping` - Dừng gõ
- `messagesRead` - Đã đọc tin nhắn

### Server → Client
- `receiveMessage` - Nhận tin nhắn mới
- `userTyping` - User đang gõ
- `userStopTyping` - User dừng gõ
- `messagesRead` - Tin nhắn đã được đọc
- `userOnline` - User online
- `userOffline` - User offline

## 🎨 UI Features

### Responsive Design
- **Mobile**: Sidebar ẩn, chat full screen
- **Tablet**: Sidebar thu gọn
- **Desktop**: Full layout với sidebar

### Visual Elements
- **Online indicators**: Green dots
- **Message bubbles**: Different colors for sent/received
- **Typing indicators**: Animated dots
- **Unread counts**: Blue badges
- **Smooth animations**: CSS transitions

### User Experience
- **Auto-scroll**: Tin nhắn mới tự động scroll
- **Real-time updates**: Không cần refresh
- **Keyboard shortcuts**: Enter to send
- **Touch friendly**: Mobile gestures

## 🔒 Security Features

### Authentication
- JWT tokens với expiration
- Socket.IO authentication middleware
- Protected API routes

### Authorization
- User chỉ có thể xem tin nhắn của mình
- Chat room validation
- Input sanitization

### Data Protection
- Password hashing
- CORS configuration
- Rate limiting

## 🐛 Error Handling

### Frontend
```javascript
try {
  const response = await fetch('/api/messages');
  if (!response.ok) throw new Error('Failed to load messages');
  const data = await response.json();
  setMessages(data.messages);
} catch (error) {
  console.error('Error loading messages:', error);
  setMessages([]);
}
```

### Backend
```javascript
try {
  const message = await Message.create(messageData);
  res.status(201).json({ success: true, message });
} catch (error) {
  console.error('Error creating message:', error);
  res.status(500).json({ success: false, error: error.message });
}
```

## 📱 Mobile Support

### Responsive Breakpoints
- **sm**: 640px+ (Tablet)
- **md**: 768px+ (Small desktop)
- **lg**: 1024px+ (Desktop)

### Mobile Features
- Touch gestures
- Swipe navigation
- Mobile-optimized input
- Responsive images

## 🚀 Performance Optimizations

### Frontend
- React.memo for components
- useCallback for event handlers
- Lazy loading for images
- Debounced typing detection

### Backend
- Database indexing
- Socket.IO rooms
- Message pagination
- Connection pooling

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- MongoDB
- npm/yarn

### Installation
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
# Backend .env
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key
PORT=5000

# Frontend .env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📈 Future Enhancements

### Planned Features
- [ ] File sharing (images, documents)
- [ ] Voice messages
- [ ] Video calls
- [ ] Group chats
- [ ] Message reactions
- [ ] Message search
- [ ] Push notifications
- [ ] Dark mode
- [ ] Message encryption

### Technical Improvements
- [ ] Redis for session management
- [ ] CDN for file uploads
- [ ] Message pagination
- [ ] Offline support
- [ ] PWA features

## 🎯 Kết luận

Chat application này cung cấp một nền tảng messaging hoàn chỉnh với:

✅ **Real-time communication** - Socket.IO
✅ **Modern UI/UX** - React + Tailwind
✅ **Secure authentication** - JWT
✅ **Responsive design** - Mobile-first
✅ **Scalable architecture** - MongoDB + Node.js
✅ **User-friendly interface** - Intuitive navigation

Ứng dụng sẵn sàng cho production với các tính năng cơ bản và có thể mở rộng thêm nhiều tính năng nâng cao trong tương lai.

---

*Tài liệu này được tạo để giúp hiểu rõ về kiến trúc và chức năng của chat application.*
