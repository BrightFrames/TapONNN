const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/chat/conversations - List all conversations
router.get('/conversations', chatController.getConversations);

// POST /api/chat/conversation - Get or create conversation with user
router.post('/conversation', chatController.getOrCreateConversation);

// GET /api/chat/messages/:conversationId - Get messages
router.get('/messages/:conversationId', chatController.getMessages);

// POST /api/chat/send - Send a message
router.post('/send', chatController.sendMessage);

// PUT /api/chat/read/:conversationId - Mark as read
router.put('/read/:conversationId', chatController.markAsRead);

// GET /api/chat/unread - Get total unread count
router.get('/unread', chatController.getUnreadCount);

module.exports = router;
