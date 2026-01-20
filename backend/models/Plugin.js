  const mongoose = require('mongoose');

const pluginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['Social', 'Music', 'Video', 'Commerce', 'Scheduling', 'Forms', 'Marketing', 'Community'],
        required: true
    },
    type: {
        type: String,
        enum: ['link_enhancement', 'embed', 'analytics', 'payment', 'scheduling'],
        default: 'link_enhancement'
    },
    is_premium: {
        type: Boolean,
        default: false
    },
    config_schema: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    install_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Plugin = mongoose.model('Plugin', pluginSchema);

module.exports = Plugin;
