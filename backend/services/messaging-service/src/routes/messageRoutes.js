const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
  deleteConversation,
  searchConversations
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/conversations', getConversations);

/**
 * @route   POST /api/messages/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post('/conversations', createConversation);

/**
 * @route   GET /api/messages/conversations/:conversationId
 * @desc    Get all messages in a conversation
 * @access  Private
 */
router.get('/conversations/:conversationId', getMessages);

/**
 * @route   POST /api/messages/conversations/:conversationId
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post('/conversations/:conversationId', sendMessage);

/**
 * @route   PUT /api/messages/conversations/:conversationId/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.put('/conversations/:conversationId/read', markAsRead);

/**
 * @route   DELETE /api/messages/conversations/:conversationId
 * @desc    Delete a conversation
 * @access  Private
 */
router.delete('/conversations/:conversationId', deleteConversation);

/**
 * @route   GET /api/messages/search
 * @desc    Search conversations
 * @access  Private
 */
router.get('/search', searchConversations);

module.exports = router;