const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    studentName: {
        type: String
    },
    landlordName: {
        type: String
    },
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
