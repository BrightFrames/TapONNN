const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Buyer
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Guest checkout
    },
    guest_email: {
        type: String,
        default: null
    },

    // Seller
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },

    // Product
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    product_name: String, // Snapshot
    product_type: String, // digital, physical, service

    // Tracing
    intent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Intent',
        required: true,
        unique: true
    },

    // Payment
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded', 'failed'],
        default: 'pending'
    },
    payment_method: String,
    payment_id: String, // Unique Payment ID (e.g. H_XXXX)
    invoice_id: String, // Invoice ID (e.g. HSG-XXXX)
    transaction_id: String, // Gateway ID
    gateway_order_id: String,
    paid_at: Date, // Date of payment

    // Delivery (for physical/service)
    customer_details: {
        name: String,
        phone: String,
        address: String
    },

    // Digital Delivery (key, file url)
    delivery_status: {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
        default: 'pending'
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
orderSchema.index({ seller_id: 1, created_at: -1 });
orderSchema.index({ buyer_id: 1, created_at: -1 });
orderSchema.index({ intent_id: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
