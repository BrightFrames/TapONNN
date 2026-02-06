const mongoose = require('mongoose');

const storeSubscriberSchema = new mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    tapx_username: {
        type: String,
        lowercase: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

storeSubscriberSchema.index({ seller_id: 1, email: 1 }, { unique: true, sparse: true });
storeSubscriberSchema.index({ seller_id: 1, tapx_username: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('StoreSubscriber', storeSubscriberSchema);
