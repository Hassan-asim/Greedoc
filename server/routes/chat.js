const express = require("express");
const { body } = require("express-validator");
const ChatController = require("../controllers/chatController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/chat/send
 * @desc    Send a message
 * @access  Private
 */
router.post(
  "/send",
  authenticateToken,
  [
    body("receiverId").notEmpty().withMessage("Receiver ID is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("messageType")
      .optional()
      .isIn(["text", "image", "file", "prescription"])
      .withMessage("Invalid message type"),
  ],
  ChatController.sendMessage
);

/**
 * @route   GET /api/chat/rooms
 * @desc    Get user's chat rooms
 * @access  Private
 */
router.get("/rooms", authenticateToken, ChatController.getChatRooms);

/**
 * @route   GET /api/chat/messages/:chatRoomId
 * @desc    Get messages for a chat room
 * @access  Private
 */
router.get(
  "/messages/:chatRoomId",
  authenticateToken,
  ChatController.getMessages
);

/**
 * @route   PUT /api/chat/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put(
  "/messages/:messageId/read",
  authenticateToken,
  ChatController.markMessageAsRead
);

/**
 * @route   GET /api/chat/unread
 * @desc    Get unread messages count
 * @access  Private
 */
router.get("/unread", authenticateToken, ChatController.getUnreadMessages);

/**
 * @route   POST /api/chat/fcm-token
 * @desc    Update user's FCM token
 * @access  Private
 */
router.post(
  "/fcm-token",
  authenticateToken,
  [body("fcmToken").notEmpty().withMessage("FCM token is required")],
  ChatController.updateFCMToken
);

module.exports = router;
