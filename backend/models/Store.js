const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    store_name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: ''
    },
    avatar_url: {
        type: String,
        default: ''
    },
    selected_theme: {
        type: String,
        default: 'clean'
    },
    design_config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    category: {
        type: String,
        default: ''
    },
    published: {
        type: Boolean,
        default: false
    },
    payment_instructions: {
        type: String,
        default: ''
    },
    phone_number: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster lookups
storeSchema.index({ user_id: 1 });
storeSchema.index({ profile_id: 1 });

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
