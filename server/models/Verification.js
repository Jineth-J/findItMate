const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['student', 'landlord'],
        required: true
    },
    documentType: {
        type: String,
        enum: ['nic', 'university_id', 'passport', 'business_registration', 'property_deed'],
        required: true
    },
    documentUrl: {
        type: String,
        required: true
    },
    documentNumber: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewedAt: {
        type: Date
    },
    reviewNotes: {
        type: String,
        default: ''
    },
    expiryDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Verification', verificationSchema);
