const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'moderator', 'support'],
        default: 'moderator'
    },
    permissions: [{
        type: String,
        enum: ['manage_users', 'manage_properties', 'manage_payments', 'view_analytics', 'manage_reports', 'system_settings']
    }],
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);
