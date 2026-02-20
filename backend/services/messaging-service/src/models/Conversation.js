const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Ensure exactly 2 participants
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('Une conversation doit avoir exactement 2 participants'));
  }
  next();
});

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Static method to find conversation between two users
conversationSchema.statics.findBetweenUsers = async function(userId1, userId2) {
  return this.findOne({
    participants: { $all: [userId1, userId2] }
  });
};

module.exports = mongoose.model('Conversation', conversationSchema);
