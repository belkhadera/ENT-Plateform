const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'firstName lastName email role')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'firstName lastName'
      }
    })
    .sort({ lastMessageAt: -1 });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: req.user.id },
          read: false
        });

        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      count: conversationsWithUnread.length,
      data: conversationsWithUnread
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/messages/conversations/:conversationId
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Check if user is participant
    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à cette conversation'
      });
    }

    // Get all messages
    const messages = await Message.find({ conversationId })
      .populate('sender', 'firstName lastName email role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

/**
 * @desc    Send a message
 * @route   POST /api/messages/conversations/:conversationId
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du message est requis'
      });
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Check if user is participant
    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à envoyer des messages dans cette conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      content: content.trim()
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new conversation
 * @route   POST /api/messages/conversations
 * @access  Private
 */
exports.createConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du destinataire est requis'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Destinataire non trouvé'
      });
    }

    // Cannot create conversation with self
    if (recipientId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de créer une conversation avec vous-même'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findBetweenUsers(req.user.id, recipientId);

    if (conversation) {
      await conversation.populate('participants', 'firstName lastName email role');
      return res.json({
        success: true,
        data: conversation,
        message: 'Conversation existante récupérée'
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user.id, recipientId]
    });

    await conversation.populate('participants', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation créée avec succès'
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la conversation',
      error: error.message
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/conversations/:conversationId/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Check if user is participant
    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Update messages
    const result = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user.id },
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marqués comme lus',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des messages',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a conversation
 * @route   DELETE /api/messages/conversations/:conversationId
 * @access  Private
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Check if user is participant
    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette conversation'
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId });

    // Delete conversation
    await conversation.deleteOne();

    res.json({
      success: true,
      message: 'Conversation supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la conversation',
      error: error.message
    });
  }
};

/**
 * @desc    Search conversations
 * @route   GET /api/messages/search
 * @access  Private
 */
exports.searchConversations = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query de recherche requis'
      });
    }

    // Get user's conversations
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'firstName lastName email')
    .populate('lastMessage');

    // Filter by user name
    const filtered = conversations.filter(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== req.user.id);
      if (!otherUser) return false;
      
      const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
      return fullName.includes(q.toLowerCase());
    });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Search conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};