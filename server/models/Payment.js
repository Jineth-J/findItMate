const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease'
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    type: {
        type: String,
        enum: ['rent', 'deposit', 'key_money', 'subscription', 'refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'LKR'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    dueDate: {
        type: Date
    },
    transactionId: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'cash', 'online'],
        default: 'card'
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
