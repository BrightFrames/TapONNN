const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    session_id: {
        type: String,
        required: true,
        index: true
    },
    event_type: {
        type: String, // 'pageview', 'click', 'ping', 'product_click'
        required: true,
        enum: ['pageview', 'click', 'ping', 'product_click']
    },
    url: String,
    path: String,
    referrer: String,
    browser: String,
    os: String,
    device: String, // 'desktop', 'mobile', 'tablet'
    country: String,

    // For clicks
    link_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link'
    },
    link_url: String,

    // Metadata for ML features (product_id, category, etc.)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Simple index on profile and time
analyticsEventSchema.index({ profile_id: 1, timestamp: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;
