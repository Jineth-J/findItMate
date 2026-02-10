const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'landlord', 'admin'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Update conversation last message on save
messageSchema.post('save', async function () {
    const Conversation = require('./Conversation');
    await Conversation.findByIdAndUpdate(this.conversationId, {
        lastMessage: this.content,
        lastMessageTime: this.createdAt
    });
});

module.exports = mongoose.model('Message', messageSchema);
