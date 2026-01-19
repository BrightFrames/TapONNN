const mongoose = require('mongoose');

const subscriptionOrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan_id: {
        type: String,
        required: true
    },
    plan_name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'expired'],
        default: 'pending'
    },
    transaction_id: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

subscriptionOrderSchema.index({ user_id: 1 });
subscriptionOrderSchema.index({ order_id: 1 });

const userSubscriptionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    plan_id: {
        type: String,
        required: true
    },
    plan_name: {
        type: String,
        required: true
    },
    starts_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    order_id: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const passwordResetTokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

passwordResetTokenSchema.index({ token: 1 });
passwordResetTokenSchema.index({ user_id: 1 });

const SubscriptionOrder = mongoose.model('SubscriptionOrder', subscriptionOrderSchema);
const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

module.exports = { SubscriptionOrder, UserSubscription, PasswordResetToken };
