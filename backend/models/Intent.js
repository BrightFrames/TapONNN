const mongoose = require('mongoose');

/**
 * Intent Model - THE CORE DATA PRIMITIVE
 * 
 * Every CTA interaction creates an intent record IMMEDIATELY.
 * This happens BEFORE any login gating or action completion.
 * Intent is the foundation of all platform tracking.
 */
const intentSchema = new mongoose.Schema({
    // Who performed the action
    actor_type: {
        type: String,
        enum: ['visitor', 'user'],
        required: true
    },
    actor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for visitors
    },
    // Visitor tracking (for anonymous users)
    visitor_fingerprint: {
        type: String,
        default: null
    },
    session_id: {
        type: String,
        default: null
    },

    // Target profile/store
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
        index: true
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        default: null
    },

    // Block that was interacted with
    block_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block',
        required: true,
        index: true
    },
    block_type: {
        type: String,
        required: true
    },
    block_title: {
        type: String,
        default: ''
    },

    // CTA details
    cta_type: {
        type: String,
        enum: ['buy', 'enquiry', 'install', 'redirect', 'contact', 'download', 'book', 'donate', 'custom', 'none', 'visit', 'buy_now'],
        required: true
    },
    cta_label: {
        type: String,
        default: ''
    },

    // Flow tracking
    flow_type: {
        type: String,
        enum: ['buy', 'enquiry', 'install', 'redirect'],
        required: true
    },

    // Intent status
    status: {
        type: String,
        enum: [
            'created',      // Intent recorded
            'login_required', // Waiting for login
            'login_completed', // User logged in
            'in_progress',  // Action in progress
            'completed',    // Action completed successfully
            'failed',       // Action failed
            'abandoned'     // User left without completing
        ],
        default: 'created'
    },

    // Login gating
    login_required: {
        type: Boolean,
        default: false
    },
    login_completed_at: {
        type: Date,
        default: null
    },

    // Linked records (created after intent)
    linked_enquiry_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enquiry',
        default: null
    },
    linked_order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    linked_plugin_install_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPlugin',
        default: null
    },

    // Transaction details (for buy flow)
    transaction: {
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'failed', null],
            default: null
        },
        gateway: String,
        gateway_order_id: String,
        gateway_payment_id: String,
        amount: Number,
        currency: { type: String, default: 'INR' }
    },

    // Metadata (internal only - never exposed publicly)
    metadata: {
        ip: String,
        user_agent: String,
        referrer: String,
        device: String,
        source: String,
        utm_source: String,
        utm_medium: String,
        utm_campaign: String
    },

    // Timestamps
    completed_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries (internal dashboard only)
// intentSchema.index({ profile_id: 1, created_at: -1 });
// intentSchema.index({ profile_id: 1, flow_type: 1 });
// intentSchema.index({ profile_id: 1, status: 1 });
// intentSchema.index({ block_id: 1, created_at: -1 });
// intentSchema.index({ actor_id: 1, created_at: -1 });
// intentSchema.index({ visitor_fingerprint: 1 });

const Intent = mongoose.model('Intent', intentSchema);

module.exports = Intent;
