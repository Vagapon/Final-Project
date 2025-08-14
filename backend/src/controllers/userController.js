const User = require("../models/UserModel/User");
const UserRole = require("../models/UserModel/UserRole");
const Role = require("../models/UserModel/Role");
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
            const { name, phone_number, avatar } = req.body;
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { name, phone_number, avatar },
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

    // Admin routes - chỉ admin mới truy cập được
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

            console.log("Admin role found:", adminRole); // Debug log

            // Lấy danh sách user có role Admin để loại trừ
            const adminUserIds = await UserRole.find({ role_id: adminRole._id })
                .distinct('user_id');

            console.log("Admin user IDs:", adminUserIds); // Debug log

            const totalUsers = await User.countDocuments({
                _id: { $nin: adminUserIds }
            });

            console.log("Total users (excluding admin):", totalUsers); // Debug log

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

            console.log("Users returned:", users.length); // Debug log
            console.log("First user:", users[0]); // Debug log

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
    }
};

module.exports = userController;