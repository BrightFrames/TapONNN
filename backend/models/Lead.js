const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    phone_number: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'otp_sent', 'verified', 'converted'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        default: () => Date.now() + 30 * 60 * 1000, // 30 minutes expiry
        expires: 0
    }
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
