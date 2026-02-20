const mongoose = require('mongoose');

const chatbotConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  title: {
    type: String,
    default: 'Nouvelle conversation'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
chatbotConversationSchema.index({ userId: 1, createdAt: -1 });
chatbotConversationSchema.index({ isActive: 1 });

// Virtual for message count
chatbotConversationSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Ensure virtuals are included in JSON
chatbotConversationSchema.set('toJSON', { virtuals: true });
chatbotConversationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);
