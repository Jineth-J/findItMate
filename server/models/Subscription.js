const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    type: {
        type: String,
        enum: ['student', 'landlord'],
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'LKR'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'pending'],
        default: 'active'
    },
    features: [{
        type: String
    }],
    autoRenew: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
