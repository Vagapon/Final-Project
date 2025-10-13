const User = require("../models/UserModel/User");
const UserRole = require("../models/UserModel/UserRole");
const Role = require("../models/UserModel/Role");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userController = {
    // User routes - cần đăng nhập
    getMyProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                success: true,
                data: user,
                message: "Profile retrieved successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error retrieving profile",
                error: error.message
            });
        }
    },

    updateMyProfile: async (req, res) => {
        try {
            const { name, phone_number, address } = req.body;
            const avatar = req.file ? req.file.path : req.body.avatar;
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { name, phone_number, avatar, address },
                { new: true }
            ).select('-password');
            
            res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Profile updated successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating profile",
                error: error.message
            });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 8;
            const skip = (page - 1) * limit;
            
            // Tìm role Admin để lọc
            const adminRole = await Role.findOne({ name: "Admin" });
            if (!adminRole) {
                return res.status(500).json({ message: "Admin role not found" });
            }


            // Lấy danh sách user có role Admin để loại trừ
            const adminUserIds = await UserRole.find({ role_id: adminRole._id })
                .distinct('user_id');


            const totalUsers = await User.countDocuments({
                _id: { $nin: adminUserIds }
            });


            const users = await User.aggregate([
                { $match: { _id: { $nin: adminUserIds } } },
                { $lookup: {
                    from: "userroles",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "roles"
                }},
                {
                    $lookup: {
                        from: "roles",
                        localField: "roles.role_id",
                        foreignField: "_id",
                        as: "roleDetails"
                    }
                },
                { $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone_number: 1,
                    avatar: 1,
                    isActive: 1,
                    createdAt: 1,
                    role: {
                        $arrayElemAt: ["$roleDetails.name", 0]
                    }
                }},
                { $skip: skip },
                { $limit: limit }
            ]);


            res.status(200).json({ 
                success: true,
                data: users,
                pagination: {
                    total: totalUsers,
                    page,
                    limit
                },
                totalPages: Math.ceil(totalUsers / limit),
                message: "Users retrieved successfully"
            });
        } catch (error) {
            console.error("Error in getAllUsers:", error); // Debug log
            res.status(500).json({
                success: false,
                message: "Error retrieving users",
                error: error.message
            });
        }
    },

    getUserById: async (req, res) => {
        const { userId } = req.params;
        try {
            const user = await User.findById(userId).populate('roles.role_id', 'name code');
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                success: true,
                data: user,
                message: "User retrieved successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error retrieving user",
                error: error.message
            });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const updateData = req.body;
            
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }
            
            const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            res.status(200).json({
                success: true,
                data: user,
                message: "User updated successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating user",
                error: error.message
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            res.status(200).json({
                success: true,
                message: "User deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting user",
                error: error.message
            });
        }
    },

    // Lấy danh sách users để chat (trừ user hiện tại)
    getChatUsers: async (req, res) => {
        try {
            const currentUserId = req.user.id; // User hiện tại
            
            
            // Kiểm tra currentUserId có hợp lệ không
            if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
            }
            
            // Lấy tất cả users trừ user hiện tại, có avatar và role
            const users = await User.aggregate([
                { $match: { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } } },
                { $lookup: {
                    from: "userroles",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "roles"
                }},
                {
                    $lookup: {
                        from: "roles",
                        localField: "roles.role_id",
                        foreignField: "_id",
                        as: "roleDetails"
                    }
                },
                { $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    avatar: 1,
                    isActive: 1,
                    username: 1,
                    role: {
                        $arrayElemAt: ["$roleDetails.name", 0]
                    },
                    isOnline: { $literal: false } // Mặc định offline, sẽ cập nhật qua socket sau
                }},
                { $sort: { name: 1 } }
            ]);
            
            
            res.status(200).json({
                success: true,
                data: users,
                message: "Chat users retrieved successfully"
            });
        } catch (error) {
            console.error("Error in getChatUsers:", error);
            res.status(500).json({
                success: false,
                message: "Error retrieving chat users",
                error: error.message
            });
        }
    }

};

module.exports = userController;