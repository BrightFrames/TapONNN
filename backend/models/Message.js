const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Reference to conversation
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    // Sender
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Message content
    content: {
        type: String,
        required: true,
        trim: true
    },
    // Message type
    type: {
        type: String,
        enum: ['text', 'image', 'system'],
        default: 'text'
    },
    // Read status
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries
messageSchema.index({ conversation_id: 1, created_at: -1 });
messageSchema.index({ sender_id: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
