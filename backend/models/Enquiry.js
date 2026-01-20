const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    // The profile owner receiving the enquiry
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // The visitor making the enquiry (optional if guest)
    visitor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Guest visitor info
    visitor_email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    visitor_name: {
        type: String,
        trim: true,
        default: ''
    },
    visitor_phone: {
        type: String,
        default: ''
    },
    // Block that triggered the enquiry
    block_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block',
        required: true
    },
    block_type: {
        type: String,
        required: true
    },
    block_title: {
        type: String,
        default: ''
    },
    // CTA that was clicked
    cta_type: {
        type: String,
        required: true
    },
    // Enquiry content
    message: {
        type: String,
        default: ''
    },
    // For product-related enquiries
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    // Status workflow
    status: {
        type: String,
        enum: ['new', 'read', 'responded', 'converted', 'closed'],
        default: 'new'
    },
    // Seller's response/notes
    seller_response: {
        type: String,
        default: ''
    },
    responded_at: {
        type: Date,
        default: null
    },
    // Tracking metadata
    metadata: {
        ip: String,
        user_agent: String,
        referrer: String,
        source: String, // 'profile', 'store', 'share_link'
        device: String  // 'mobile', 'desktop', 'tablet'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries
enquirySchema.index({ seller_id: 1, status: 1 });
enquirySchema.index({ seller_id: 1, created_at: -1 });
enquirySchema.index({ block_id: 1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
