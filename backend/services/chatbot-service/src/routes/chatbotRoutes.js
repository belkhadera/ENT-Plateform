const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getHistory,
  getConversations,
  deleteConversation,
  getSuggestions
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to AI chatbot
 * @access  Private
 */
router.post('/message', sendMessage);

/**
 * @route   GET /api/chatbot/history/:conversationId
 * @desc    Get chat history for a conversation
 * @access  Private
 */
router.get('/history/:conversationId', getHistory);

/**
 * @route   GET /api/chatbot/conversations
 * @desc    Get user's chatbot conversations
 * @access  Private
 */
router.get('/conversations', getConversations);

/**
 * @route   DELETE /api/chatbot/conversations/:conversationId
 * @desc    Delete a chatbot conversation
 * @access  Private
 */
router.delete('/conversations/:conversationId', deleteConversation);

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Get suggested questions
 * @access  Private
 */
router.get('/suggestions', getSuggestions);

module.exports = router;