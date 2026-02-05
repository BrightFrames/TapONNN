const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    image_url: {
        type: String,
        default: ''
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    discount_price: {
        type: Number
    },
    badge: {
        type: String, // e.g., 'New', 'Sale', 'Hot'
        default: ''
    },
    stock_status: {
        type: String,
        enum: ['in_stock', 'out_of_stock', 'on_backorder'],
        default: 'in_stock'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    product_type: {
        type: String,
        enum: ['digital_product', 'physical_product', 'physical_service', 'digital_service'],
        default: 'physical_product'
    },
    file_url: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

productSchema.index({ user_id: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = { Product };
