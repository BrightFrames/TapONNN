const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'New Link'
    },
    url: {
        type: String,
        default: ''
    },
    is_active: {
        type: Boolean,
        default: true
    },
    position: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: ''
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    is_priority: {
        type: Boolean,
        default: false
    },
    is_archived: {
        type: Boolean,
        default: false
    },
    scheduled_start: {
        type: Date,
        default: null
    },
    scheduled_end: {
        type: Date,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Index for faster user-based queries
linkSchema.index({ user_id: 1, position: 1 });

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
