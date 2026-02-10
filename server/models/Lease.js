const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    monthlyRent: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        default: 0
    },
    keyMoney: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'terminated', 'pending'],
        default: 'pending'
    },
    terms: {
        type: String,
        default: ''
    },
    documentUrl: {
        type: String,
        default: ''
    },
    rules: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Lease', leaseSchema);
