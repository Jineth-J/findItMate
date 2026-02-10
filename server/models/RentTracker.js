const mongoose = require('mongoose');

const rentTrackerSchema = new mongoose.Schema({
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    month: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'partial'],
        default: 'pending'
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RentTracker', rentTrackerSchema);
