require('dotenv').config();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const app = require('../app'); 
const Role = require('./models/UserModel/Role');
const SportType = require('./models/Event/SportType');
const Message = require('./models/Chat/Message'); 

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // 🚀 Tạo HTTP server từ app
    const server = http.createServer(app);

    // 🚀 Gắn Socket.IO với authentication
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173", // chỗ frontend React
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Store online users
    const onlineUsers = new Map();

    // Socket authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    // Lắng nghe socket
    io.on("connection", (socket) => {
      const userId = socket.userId;
      console.log("⚡ User connected:", socket.id, "User ID:", userId);

      // Add user to online users
      onlineUsers.set(userId, {
        socketId: socket.id,
        userId: userId,
        lastSeen: new Date()
      });

      // Join user's personal room
      socket.join(userId);
      
      // Notify all users about this user coming online
      socket.broadcast.emit("userOnline", { userId });

      // Send current online users to the newly connected user
      socket.emit("onlineUsers", Array.from(onlineUsers.keys()));

      // Join specific chat room
      socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${userId} joined chat room: ${chatId}`);
      });

      // Leave specific chat room
      socket.on("leaveChat", (chatId) => {
        socket.leave(chatId);
        console.log(`User ${userId} left chat room: ${chatId}`);
      });

      // Send message
      socket.on("sendMessage", async (data) => {
        try {
          console.log("📨 Received message:", data);
          
          const newMessage = new Message({
            senderId: data.senderId,
            receiveId: data.receiveId,
            teamId: data.teamId || null,
            content: data.content,
            type: data.type || 'text'
          });
          
          await newMessage.save();
          
          // Populate sender info
          const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'name avatar')
            .populate('receiveId', 'name avatar');

          // Create chat room ID (combination of sender and receiver)
          const chatRoomId = [data.senderId, data.receiveId].sort().join('_');
          
          // Send to chat room
          io.to(chatRoomId).emit("receiveMessage", {
            ...populatedMessage.toObject(),
            chatRoomId: chatRoomId
          });
          
          // Also send to individual users to ensure immediate delivery
          const senderSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.userId === data.senderId);
          const receiverSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.userId === data.receiveId);
          
          if (senderSocket) {
            senderSocket.emit("receiveMessage", {
              ...populatedMessage.toObject(),
              chatRoomId: chatRoomId
            });
          }
          
          if (receiverSocket) {
            receiverSocket.emit("receiveMessage", {
              ...populatedMessage.toObject(),
              chatRoomId: chatRoomId
            });
          }

          // Send notification to receiver if not in the same room
          if (!socket.rooms.has(chatRoomId)) {
            io.to(data.receiveId).emit("newMessageNotification", {
              sender: populatedMessage.senderId,
              message: data.content,
              chatRoomId: chatRoomId
            });
          }

          console.log("✅ Message sent successfully");

        } catch (err) {
          console.error("❌ Error saving message:", err);
          socket.emit("messageError", { error: "Failed to send message" });
        }
      });

      // Typing indicators
      socket.on("typing", (data) => {
        const chatRoomId = [data.senderId, data.receiverId].sort().join('_');
        socket.to(chatRoomId).emit("userTyping", {
          userId: data.senderId,
          isTyping: data.isTyping
        });
      });

      // Stop typing
      socket.on("stopTyping", (data) => {
        const chatRoomId = [data.senderId, data.receiverId].sort().join('_');
        socket.to(chatRoomId).emit("userStopTyping", {
          userId: data.senderId
        });
      });

      // Mark message as read
      socket.on("markAsRead", async (data) => {
        try {
          await Message.updateMany(
            { 
              senderId: data.senderId, 
              receiveId: data.receiverId,
              isRead: false 
            },
            { isRead: true }
          );
          
          // Notify sender that messages were read
          io.to(data.senderId).emit("messagesRead", {
            receiverId: data.receiverId,
            readAt: new Date()
          });
        } catch (err) {
          console.error("❌ Error marking messages as read:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id, "User ID:", userId);
        
        // Remove user from online users
        onlineUsers.delete(userId);
        
        // Notify all users about this user going offline
        socket.broadcast.emit("userOffline", { userId });
      });
    });

    // 🚀 Khởi động server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to the database', error);
  }
})();