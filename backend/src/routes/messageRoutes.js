const express = require("express");
const messageController = require("../controllers/messageController");
const { verifyToken, isAuthenticated } = require("../middlewares/authMiddleware");
const router = express.Router();

const userAuth = [verifyToken, isAuthenticated];

// GET messages của một chat room
router.get("/:chatRoomId", userAuth, messageController.getMessages);

// GET danh sách conversations của user
router.get("/conversations/list", userAuth, messageController.getConversations);

module.exports = router;
