const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Two participants in the conversation
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // Last message preview
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    lastMessageBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Unread counts per participant
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    },
    // Conversation status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient participant lookup
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Find conversation between two users
conversationSchema.statics.findBetweenUsers = async function (userId1, userId2) {
    return this.findOne({
        participants: { $all: [userId1, userId2], $size: 2 }
    });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
