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
        type: String, // 'pageview', 'click', 'ping'
        required: true,
        enum: ['pageview', 'click', 'ping']
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

    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Simple index on profile and time
analyticsEventSchema.index({ profile_id: 1, timestamp: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;
