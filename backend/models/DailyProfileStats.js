const mongoose = require('mongoose');

/**
 * Pre-aggregated daily profile statistics for fast reads.
 * Updated via $inc operations when events are tracked.
 * This is ADD-ONLY - does not replace existing analytics.
 */
const dailyProfileStatsSchema = new mongoose.Schema({
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    // Core Metrics
    profileViews: {
        type: Number,
        default: 0
    },
    linkClicks: {
        type: Number,
        default: 0
    },
    productClicks: {
        type: Number,
        default: 0
    },
    totalInteractions: {
        type: Number,
        default: 0
    },
    // Unique visitors (updated via upsert with distinct session tracking)
    uniqueVisitorSessions: {
        type: [String],
        default: []
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient lookups
dailyProfileStatsSchema.index({ profile_id: 1, date: -1 });

// Virtual to get unique visitor count
dailyProfileStatsSchema.virtual('uniqueVisitors').get(function () {
    return this.uniqueVisitorSessions?.length || 0;
});

// Ensure virtuals are included in JSON
dailyProfileStatsSchema.set('toJSON', { virtuals: true });
dailyProfileStatsSchema.set('toObject', { virtuals: true });

const DailyProfileStats = mongoose.model('DailyProfileStats', dailyProfileStatsSchema);

module.exports = DailyProfileStats;
