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
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
