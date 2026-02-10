const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease'
    },
    type: {
        type: String,
        enum: ['maintenance', 'complaint', 'safety', 'billing', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    resolution: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Issue', issueSchema);
