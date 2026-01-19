const mongoose = require('mongoose');

const userPluginSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plugin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plugin',
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    installed_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound unique index to prevent duplicate installations
userPluginSchema.index({ user_id: 1, plugin_id: 1 }, { unique: true });

const UserPlugin = mongoose.model('UserPlugin', userPluginSchema);

module.exports = UserPlugin;
