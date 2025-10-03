const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { messaging } = require('../config/firebase');

const router = express.Router();

/**
 * @route   POST /api/chat/send
 * @desc    Send a message
 * @access  Private
 */
router.post('/send', authenticateToken, [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('messageType').optional().isIn(['text', 'image', 'file', 'prescription']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { receiverId, message, messageType = 'text', attachments = [] } = req.body;
    const senderId = req.user.id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Receiver not found'
      });
    }

    // Create chat message
    const chatMessage = new Chat({
      senderId,
      receiverId,
      message,
      messageType,
      attachments
    });

    await chatMessage.save();

    // Get sender info for notification
    const sender = await User.findById(senderId);
    
    // Send push notification to receiver
    try {
      const notification = {
        title: `New message from ${sender.fullName}`,
        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
        data: {
          type: 'chat_message',
          chatRoomId: chatMessage.chatRoomId,
          senderId: senderId,
          senderName: sender.fullName
        }
      };

      // Get receiver's FCM token (you'll need to store this when user logs in)
      const receiverFCMToken = receiver.fcmToken; // Assuming you store FCM token in user model
      
      if (receiverFCMToken) {
        await messaging.send({
          token: receiverFCMToken,
          notification,
          data: {
            chatRoomId: chatMessage.chatRoomId,
            senderId: senderId,
            messageId: chatMessage.id
          }
        });
      }
    } catch (fcmError) {
      console.error('FCM Error:', fcmError);
      // Don't fail the request if FCM fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: {
        message: chatMessage
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/chat/rooms
 * @desc    Get user's chat rooms
 * @access  Private
 */
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatRooms = await Chat.getChatRooms(userId);

    // Get user details for each chat room
    const roomsWithUserDetails = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = room.lastMessage;
        const otherUserId = lastMessage.senderId === userId ? lastMessage.receiverId : lastMessage.senderId;
        const otherUser = await User.findById(otherUserId);
        
        return {
          ...room,
          otherUser: otherUser ? {
            id: otherUser.id,
            fullName: otherUser.fullName,
            avatar: otherUser.avatar,
            isOnline: otherUser.isOnline || false
          } : null
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        chatRooms: roomsWithUserDetails
      }
    });

  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get chat rooms',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/chat/messages/:chatRoomId
 * @desc    Get messages for a chat room
 * @access  Private
 */
router.get('/messages/:chatRoomId', authenticateToken, async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Verify user has access to this chat room
    const messages = await Chat.findByChatRoom(chatRoomId, { limit: parseInt(limit) });
    
    // Check if user is part of this chat room
    const hasAccess = messages.some(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );

    if (!hasAccess && messages.length > 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to this chat room'
      });
    }

    // Get user details for each message
    const messagesWithUserDetails = await Promise.all(
      messages.map(async (message) => {
        const sender = await User.findById(message.senderId);
        return {
          ...message.toObject(),
          sender: sender ? {
            id: sender.id,
            fullName: sender.fullName,
            avatar: sender.avatar
          } : null
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        messages: messagesWithUserDetails,
        chatRoomId
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/chat/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/messages/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find the message
    const message = await Chat.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiverId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await message.markAsRead();

    res.json({
      status: 'success',
      message: 'Message marked as read',
      data: {
        message: message
      }
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/chat/unread
 * @desc    Get unread messages count
 * @access  Private
 */
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadMessages = await Chat.findUnreadMessages(userId);

    res.json({
      status: 'success',
      data: {
        unreadCount: unreadMessages.length,
        messages: unreadMessages
      }
    });

  } catch (error) {
    console.error('Get unread messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get unread messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/chat/fcm-token
 * @desc    Update user's FCM token
 * @access  Private
 */
router.post('/fcm-token', authenticateToken, [
  body('fcmToken').notEmpty().withMessage('FCM token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fcmToken } = req.body;
    const userId = req.user.id;

    // Update user's FCM token
    await User.findByIdAndUpdate(userId, { fcmToken });

    res.json({
      status: 'success',
      message: 'FCM token updated successfully'
    });

  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update FCM token',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
