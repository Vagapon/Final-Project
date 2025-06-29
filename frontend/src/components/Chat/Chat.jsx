// import React, { useState, useRef, useEffect } from 'react';
// import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Settings, Users, MessageSquare, Globe, Moon, Download, Share2, Trash2 } from 'lucide-react';

// // Sidebar Component
// const Sidebar = ({ contacts, activeContact, onContactSelect }) => {
//   const [searchTerm, setSearchTerm] = useState('');

//   const filteredContacts = contacts.filter(contact =>
//     contact.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
//       {/* Header */}
//       <div className="p-4 border-b border-gray-200 bg-white">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
//               <MessageSquare size={18} className="text-white" />
//             </div>
//             <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//               <Search size={18} className="text-gray-600" />
//             </button>
//             <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//               <Phone size={18} className="text-gray-600" />
//             </button>
//             <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//               <Video size={18} className="text-gray-600" />
//             </button>
//             <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//               <Users size={18} className="text-gray-600" />
//             </button>
//             <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//               <MoreVertical size={18} className="text-gray-600" />
//             </button>
//           </div>
//         </div>
        
//         {/* Search */}
//         <div className="relative">
//           <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search messages or users"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
//           />
//         </div>
//       </div>

//       {/* Quick Contacts */}
//       <div className="p-4 bg-white border-b border-gray-200">
//         <div className="flex space-x-3">
//           {contacts.slice(0, 4).map((contact) => (
//             <div key={contact.id} className="flex flex-col items-center space-y-1">
//               <div className="relative">
//                 <img 
//                   src={contact.avatar} 
//                   alt={contact.name}
//                   className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
//                   onClick={() => onContactSelect(contact)}
//                 />
//                 {contact.isOnline && (
//                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
//                 )}
//               </div>
//               <span className="text-xs text-gray-600 truncate w-12 text-center">{contact.name.split(' ')[0]}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Recent Chats */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="p-4">
//           <h3 className="text-sm font-medium text-gray-500 mb-3">Recent</h3>
//           <div className="space-y-2">
//             {filteredContacts.map((contact) => (
//               <div
//                 key={contact.id}
//                 onClick={() => onContactSelect(contact)}
//                 className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${
//                   activeContact?.id === contact.id ? 'bg-indigo-50 border border-indigo-200' : ''
//                 }`}
//               >
//                 <div className="relative">
//                   <img 
//                     src={contact.avatar} 
//                     alt={contact.name}
//                     className="w-10 h-10 rounded-full object-cover"
//                   />
//                   {contact.isOnline && (
//                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h4>
//                     <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
//                   </div>
//                   <div className="flex items-center justify-between mt-1">
//                     <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
//                     {contact.unreadCount > 0 && (
//                       <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
//                         {contact.unreadCount}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="p-4 border-t border-gray-200 bg-white">
//         <div className="flex justify-between">
//           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <Users size={20} className="text-gray-600" />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <MessageSquare size={20} className="text-gray-600" />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <Users size={20} className="text-gray-600" />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <Globe size={20} className="text-gray-600" />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <Settings size={20} className="text-gray-600" />
//           </button>
//           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <Moon size={20} className="text-gray-600" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Chat Header Component
// const ChatHeader = ({ contact }) => (
//   <div className="bg-white border-b border-gray-200 px-6 py-4">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center space-x-3">
//         <div className="relative">
//           <img 
//             src={contact.avatar} 
//             alt={contact.name}
//             className="w-10 h-10 rounded-full object-cover"
//           />
//           {contact.isOnline && (
//             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
//           )}
//         </div>
//         <div>
//           <h3 className="font-semibold text-gray-900 flex items-center">
//             {contact.name}
//             {contact.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />}
//           </h3>
//         </div>
//       </div>
//       <div className="flex items-center space-x-2">
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Search size={20} className="text-gray-600" />
//         </button>
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Phone size={20} className="text-gray-600" />
//         </button>
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Video size={20} className="text-gray-600" />
//         </button>
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Users size={20} className="text-gray-600" />
//         </button>
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <MoreVertical size={20} className="text-gray-600" />
//         </button>
//       </div>
//     </div>
//   </div>
// );

// // Message Component
// const Message = ({ message, isOwn, showAvatar = true }) => (
//   <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-4 group`}>
//     {showAvatar && !isOwn && (
//       <img 
//         src={message.avatar} 
//         alt="User"
//         className="w-8 h-8 rounded-full object-cover mr-3 mt-1"
//       />
//     )}
//     <div className={`max-w-md ${isOwn ? 'mr-3' : showAvatar ? '' : 'ml-11'}`}>
//       {message.type === 'text' && (
//         <div className={`px-4 py-2 rounded-2xl ${
//           isOwn 
//             ? 'bg-indigo-600 text-white rounded-br-md' 
//             : 'bg-gray-100 text-gray-900 rounded-bl-md'
//         }`}>
//           <p className="text-sm break-words">{message.content}</p>
//         </div>
//       )}
//       {message.type === 'image' && (
//         <div className={`rounded-2xl overflow-hidden ${
//           isOwn ? 'rounded-br-md' : 'rounded-bl-md'
//         }`}>
//           <img 
//             src={message.content} 
//             alt="Shared image"
//             className="max-w-full h-auto"
//           />
//         </div>
//       )}
//       {message.type === 'typing' && (
//         <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-br-md">
//           <span className="text-sm">typing</span>
//           <span className="ml-1 animate-pulse">•••</span>
//         </div>
//       )}
//       <div className={`flex items-center mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
//         <span>{message.time}</span>
//       </div>
//     </div>
//   </div>
// );

// // Right Sidebar Component
// const RightSidebar = ({ contact, files }) => (
//   <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-gray-900">Files</h3>
//         <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
//           <MoreVertical size={16} className="text-gray-600" />
//         </button>
//       </div>
      
//       <div className="space-y-3">
//         {files.map((file) => (
//           <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
//                 <Download size={18} className="text-indigo-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-900">{file.name}</p>
//                 <p className="text-xs text-gray-500">{file.size}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button className="p-1 hover:bg-gray-100 rounded transition-colors">
//                 <Download size={14} className="text-gray-600" />
//               </button>
//               <button className="p-1 hover:bg-gray-100 rounded transition-colors">
//                 <MoreVertical size={14} className="text-gray-600" />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-6 space-y-2">
//         <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors">
//           <Share2 size={18} className="text-gray-600" />
//           <span className="text-sm text-gray-700">Share</span>
//         </button>
//         <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-red-600">
//           <Trash2 size={18} />
//           <span className="text-sm">Delete</span>
//         </button>
//       </div>
//     </div>

//     <div className="mt-auto p-6">
//       <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
//         <img 
//           src={contact.avatar} 
//           alt={contact.name}
//           className="w-8 h-8 rounded-full object-cover"
//         />
//         <div>
//           <p className="text-sm font-medium text-gray-900">Admin</p>
//           <div className="flex items-center space-x-1">
//             <div className="w-2 h-2 bg-green-500 rounded-full" />
//             <span className="text-xs text-gray-500">Online</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // Messages Area Component
// const MessagesArea = ({ messages, activeContact }) => {
//   const messagesEndRef = useRef(null);
  
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
//       <div className="space-y-1">
//         {messages.map((message, index) => {
//           const showAvatar = index === 0 || messages[index - 1].isOwn !== message.isOwn;
//           return (
//             <Message 
//               key={message.id} 
//               message={message} 
//               isOwn={message.isOwn}
//               showAvatar={showAvatar}
//             />
//           );
//         })}
//       </div>
//       <div ref={messagesEndRef} />
//     </div>
//   );
// };

// // Message Input Component
// const MessageInput = ({ onSendMessage }) => {
//   const [message, setMessage] = useState('');

//   const handleSend = () => {
//     if (message.trim()) {
//       onSendMessage(message);
//       setMessage('');
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   return (
//     <div className="bg-white border-t border-gray-200 px-6 py-4">
//       <div className="flex items-center space-x-3">
//         <div className="flex-1 relative">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Enter Message..."
//             className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
//           />
//         </div>
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Smile size={20} className="text-gray-600" />
//         </button>
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Paperclip size={20} className="text-gray-600" />
//         </button>
//         <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Download size={20} className="text-gray-600" />
//         </button>
//         <button 
//           onClick={handleSend}
//           disabled={!message.trim()}
//           className={`p-3 rounded-lg transition-all ${
//             message.trim() 
//               ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
//               : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//           }`}
//         >
//           <Send size={18} />
//         </button>
//       </div>
//     </div>
//   );
// };

// // Main Chat Application
// const ChatApp = () => {
//   const [contacts] = useState([
//     {
//       id: 1,
//       name: 'Patrick Hendricks',
//       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
//       isOnline: true,
//       lastMessage: 'hey! there I\'m available',
//       lastMessageTime: '02:50 PM',
//       unreadCount: 0
//     },
//     {
//       id: 2,
//       name: 'Mark Messer',
//       avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
//       isOnline: false,
//       lastMessage: '📷 Images',
//       lastMessageTime: '10:30 AM',
//       unreadCount: 2
//     },
//     {
//       id: 3,
//       name: 'General',
//       avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
//       isOnline: true,
//       lastMessage: 'This theme is Awesome!',
//       lastMessageTime: '2:06 min',
//       unreadCount: 0
//     },
//     {
//       id: 4,
//       name: 'Doris Brown',
//       avatar: 'https://images.unsplash.com/photo-1494790108755-2616c669e5c3?w=150&h=150&fit=crop&crop=face',
//       isOnline: true,
//       lastMessage: '😊',
//       lastMessageTime: '00:18',
//       unreadCount: 0
//     },
//     {
//       id: 5,
//       name: 'Designer',
//       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
//       isOnline: false,
//       lastMessage: 'Next meeting tomorrow 10:00AM',
//       lastMessageTime: '2:10 min',
//       unreadCount: 1
//     },
//     {
//       id: 6,
//       name: 'Steve Walker',
//       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
//       isOnline: false,
//       lastMessage: 'Admin-A.zip',
//       lastMessageTime: '01:16 PM',
//       unreadCount: 0
//     }
//   ]);

//   const [activeContact, setActiveContact] = useState(contacts[3]);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       type: 'image',
//       content: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop',
//       time: '10:30',
//       isOwn: false,
//       avatar: activeContact?.avatar
//     },
//     {
//       id: 2,
//       type: 'text',
//       content: 'Doris Brown',
//       time: '10:30',
//       isOwn: false,
//       avatar: activeContact?.avatar
//     },
//     {
//       id: 3,
//       type: 'typing',
//       content: 'typing',
//       time: '01:30',
//       isOwn: false,
//       avatar: activeContact?.avatar
//     }
//   ]);

//   const files = [
//     {
//       id: 1,
//       name: 'admin_v1.0.zip',
//       size: '12.5 MB'
//     }
//   ];

//   const handleSendMessage = (content) => {
//     const newMessage = {
//       id: messages.length + 1,
//       type: 'text',
//       content,
//       time: new Date().toLocaleTimeString('en-US', { 
//         hour: '2-digit', 
//         minute: '2-digit',
//         hour12: false
//       }),
//       isOwn: true,
//       avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
//     };
//     setMessages([...messages, newMessage]);
//   };

//   const handleContactSelect = (contact) => {
//     setActiveContact(contact);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar 
//         contacts={contacts}
//         activeContact={activeContact}
//         onContactSelect={handleContactSelect}
//       />
      
//       <div className="flex-1 flex flex-col">
//         <ChatHeader contact={activeContact} />
//         <MessagesArea messages={messages} activeContact={activeContact} />
//         <MessageInput onSendMessage={handleSendMessage} />
//       </div>
      
//       <RightSidebar contact={activeContact} files={files} />
//     </div>
//   );
// };

// export default ChatApp;