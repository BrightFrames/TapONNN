const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    block_type: {
        type: String,
        required: true,
        enum: [
            // Content blocks
            'link', 'text', 'header', 'image', 'video', 'divider',
            // Commerce blocks
            'product', 'service', 'pricing', 'donation',
            // Contact blocks
            'contact_card', 'form', 'booking', 'whatsapp',
            // Social blocks
            'social_icons', 'instagram', 'music', 'youtube',
            // Utility blocks
            'button', 'countdown', 'map', 'pdf'
        ],
        default: 'link'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    // Block-specific content (varies by block_type)
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // Examples:
        // link: { url: String, description: String }
        // product: { product_id: ObjectId, price: Number, description: String, image_url: String }
        // contact_card: { phone: String, email: String, address: String }
        // text: { body: String, format: 'plain'|'markdown'|'html' }
        // image: { image_url: String, alt_text: String }
        // social_icons: { platforms: [{ name: String, url: String }] }
    },
    // Call-to-Action configuration
    cta_type: {
        type: String,
        enum: ['none', 'visit', 'buy_now', 'enquire', 'contact', 'download', 'book', 'donate', 'custom'],
        default: 'none'
    },
    cta_label: {
        type: String,
        default: ''
    },
    cta_requires_login: {
        type: Boolean,
        default: false
    },
    // Display settings
    position: {
        type: Number,
        default: 0
    },
    profile_context: {
        type: String,
        enum: ['personal', 'store'],
        default: 'personal',
        index: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    // Custom styling
    styles: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // background_color, text_color, border_radius, icon, etc.
    },
    // Analytics
    analytics: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        enquiries: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 }
    },
    // Thumbnail/icon for the block
    thumbnail: {
        type: String,
        default: ''
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient queries
blockSchema.index({ user_id: 1, position: 1 });
blockSchema.index({ user_id: 1, is_active: 1 });
blockSchema.index({ user_id: 1, profile_context: 1 });

const Block = mongoose.model('Block', blockSchema);

module.exports = Block;
