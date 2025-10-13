const Message = require('../models/Chat/Message');
const mongoose = require('mongoose');

const messageController = {
  // Lấy messages của một chat room
  getMessages: async (req, res) => {
    try {
      const { chatRoomId } = req.params;
      const currentUserId = req.user.id;
      
      // console.log('🔍 Getting messages for chat room:', chatRoomId);
      // console.log('👤 Current user:', currentUserId);
      // console.log('🔑 Token user:', req.user);
      
      // Parse chat room ID để lấy sender và receiver
      const userIds = chatRoomId.split('_').map(id => new mongoose.Types.ObjectId(id));
      // console.log('📋 Parsed user IDs:', userIds);
      
      // Convert currentUserId to ObjectId for comparison
      const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
      
      if (!userIds.some(id => id.equals(currentUserObjectId))) {
        // console.log('❌ User not authorized for this chat room');
        // console.log('❌ Current user ObjectId:', currentUserObjectId);
        // console.log('❌ Chat room user IDs:', userIds);
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view these messages"
        });
      }
      
      // console.log('✅ User authorized for this chat room');
      
      // Lấy messages giữa 2 users
      const messages = await Message.find({
        $or: [
          { senderId: userIds[0], receiveId: userIds[1] },
          { senderId: userIds[1], receiveId: userIds[0] }
        ]
      })
      .populate('senderId', 'name avatar')
      .populate('receiveId', 'name avatar')
      .sort({ createdAt: 1 });
      
      // console.log('Found messages:', messages.length);
      
      res.status(200).json({
        success: true,
        messages: messages,
        chatRoomId: chatRoomId
      });
      
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: "Error retrieving messages",
        error: error.message
      });
    }
  },

  // Lấy danh sách conversations của user
  getConversations: async (req, res) => {
    try {
      const currentUserId = req.user.id;
      
      // Lấy tất cả messages mà user này tham gia
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { senderId: new mongoose.Types.ObjectId(currentUserId) },
              { receiveId: new mongoose.Types.ObjectId(currentUserId) }
            ]
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'sender'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'receiveId',
            foreignField: '_id',
            as: 'receiver'
          }
        },
        {
          $addFields: {
            otherUser: {
              $cond: {
                if: { $eq: ['$senderId', new mongoose.Types.ObjectId(currentUserId)] },
                then: { $arrayElemAt: ['$receiver', 0] },
                else: { $arrayElemAt: ['$sender', 0] }
              }
            }
          }
        },
        {
          $group: {
            _id: '$otherUser._id',
            otherUser: { $first: '$otherUser' },
            lastMessage: { $last: '$content' },
            lastMessageTime: { $last: '$createdAt' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$senderId', new mongoose.Types.ObjectId(currentUserId)] },
                      { $eq: ['$isRead', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { lastMessageTime: -1 }
        }
      ]);
      
      res.status(200).json({
        success: true,
        conversations: conversations
      });
      
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: "Error retrieving conversations",
        error: error.message
      });
    }
  }
};

module.exports = messageController;