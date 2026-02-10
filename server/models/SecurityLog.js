const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userEmail: {
        type: String
    },
    action: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        default: 'Unknown'
    },
    userAgent: {
        type: String,
        default: ''
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'danger'],
        default: 'info'
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for faster queries
securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ severity: 1 });
securityLogSchema.index({ userId: 1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
