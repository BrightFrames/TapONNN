const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
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
    phone_number: {
        type: String,
        default: ''
    },
    phone_verified: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    selected_theme: {
        type: String,
        default: 'artemis'
    },
    social_links: {
        type: Map,
        of: String,
        default: {}
    },
    design_config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    has_store: {
        type: Boolean,
        default: false
    },
    store_published: {
        type: Boolean,
        default: false
    },
    // Store-Specific Identity
    store_username: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    store_name: {
        type: String,
        trim: true
    },
    store_bio: {
        type: String,
        default: ''
    },
    store_avatar_url: {
        type: String,
        default: ''
    },
    store_selected_theme: {
        type: String,
        default: 'clean'
    },
    store_design_config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    store_category: {
        type: String,
        default: ''
    },
    // Role: 'super' (can have personal + store profiles) or 'personal' (single profile only)
    role: {
        type: String,
        enum: ['super', 'personal'],
        default: 'personal'
    },
    // Active profile mode for Super Users
    active_profile_mode: {
        type: String,
        enum: ['personal', 'store'],
        default: 'personal'
    },
    payment_instructions: {
        type: String,
        default: ''
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
