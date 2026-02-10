const mongoose = require('mongoose');

const chatbotMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    suggestions: [{
        type: String
    }]
}, { _id: false });

const chatbotConversationSchema = new mongoose.Schema({
    // For logged-in users
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true
    },
    // User type for logged-in users
    userType: {
        type: String,
        enum: ['student', 'landlord', 'admin', 'guest'],
        default: 'guest'
    },
    // For guest users (stored in localStorage on frontend)
    sessionId: {
        type: String,
        sparse: true
    },
    // Conversation messages
    messages: [chatbotMessageSchema],
    // Preferred language
    language: {
        type: String,
        enum: ['en', 'si', 'ta'],
        default: 'en'
    },
    // TTL - auto-delete after 30 days
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        index: { expires: 0 } // TTL index
    }
}, {
    timestamps: true
});

// Static method to find or create conversation
chatbotConversationSchema.statics.findOrCreate = async function (userId, sessionId, userType = 'guest') {
    let conversation;

    if (userId) {
        // Find by userId for logged-in users
        conversation = await this.findOne({ userId });
        if (!conversation) {
            conversation = await this.create({
                userId,
                userType,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
        }
    } else if (sessionId) {
        // Find by sessionId for guests
        conversation = await this.findOne({ sessionId });
        if (!conversation) {
            conversation = await this.create({
                sessionId,
                userType: 'guest',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
        }
    }

    return conversation;
};

// Method to add a message
chatbotConversationSchema.methods.addMessage = async function (role, content, suggestions = []) {
    this.messages.push({
        role,
        content,
        timestamp: new Date(),
        suggestions: role === 'bot' ? suggestions : []
    });

    // Reset expiration on activity
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.save();
};

// Method to clear messages
chatbotConversationSchema.methods.clearMessages = async function () {
    this.messages = [];
    return this.save();
};

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);
