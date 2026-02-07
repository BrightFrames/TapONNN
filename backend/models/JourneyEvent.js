const mongoose = require('mongoose');

/**
 * Journey Event Model - Tracks customer journey/behavior on profile pages
 * Used to understand visitor behavior before they become leads/enquiries
 */
const journeyEventSchema = new mongoose.Schema({
    // Session tracking
    session_id: {
        type: String,
        required: true,
        index: true
    },
    
    // Profile being visited
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
        index: true
    },
    
    // Visitor information (if known)
    visitor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    visitor_email: {
        type: String,
        default: null,
        lowercase: true,
        sparse: true, // Allow multiple null values
        index: true
    },
    
    // Related enquiry (if this journey led to an enquiry)
    enquiry_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enquiry',
        default: null,
        index: true
    },
    
    // Event details
    event_type: {
        type: String,
        required: true,
        enum: [
            'profile_visit',      // Initial page load
            'block_view',         // Scrolled to/viewed a block
            'link_click',         // Clicked on a link/block
            'product_view',       // Viewed a product
            'product_click',      // Clicked on a product
            'social_click',       // Clicked on social media link
            'contact_click',      // Clicked contact button
            'message_sent',       // Sent an enquiry
            'share_clicked',      // Clicked share button
            'download_click',     // Downloaded something
            'video_play',         // Played a video
            'scroll_depth',       // Scroll milestone
            'time_spent',         // Time tracking event
            'form_start',         // Started filling a form
            'form_complete'       // Completed a form
        ],
        index: true
    },
    
    // Event metadata
    event_data: {
        // What was interacted with
        block_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Block'
        },
        block_type: String,
        block_title: String,
        
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        product_name: String,
        
        link_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Link'
        },
        link_url: String,
        link_title: String,
        
        // For scroll depth
        scroll_percentage: Number,
        
        // For time spent
        duration_seconds: Number,
        
        // Any additional data
        custom_data: mongoose.Schema.Types.Mixed
    },
    
    // Device & Location info
    device_info: {
        device_type: {
            type: String,
            enum: ['mobile', 'tablet', 'desktop', 'unknown'],
            default: 'unknown'
        },
        browser: String,
        os: String,
        screen_resolution: String,
        user_agent: String
    },
    
    location_info: {
        ip: String,
        country: String,
        city: String,
        region: String
    },
    
    // Referral tracking
    referrer: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_term: String,
    utm_content: String,
    
    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound indexes for efficient queries
journeyEventSchema.index({ session_id: 1, timestamp: 1 });
journeyEventSchema.index({ profile_id: 1, timestamp: -1 });
journeyEventSchema.index({ enquiry_id: 1, timestamp: 1 });
journeyEventSchema.index({ visitor_email: 1, timestamp: -1 });

// TTL Index - Auto-delete journey events older than 90 days (optional)
// journeyEventSchema.index({ created_at: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const JourneyEvent = mongoose.model('JourneyEvent', journeyEventSchema);

module.exports = JourneyEvent;
