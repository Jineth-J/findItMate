const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

// @route   GET /api/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
            .populate('participants', 'name email userType avatar')
            .populate('propertyId', 'title')
            .sort('-lastMessageTime');

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/conversations/:id/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/:id/messages', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Check if user is participant
        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const messages = await Message.find({ conversationId: req.params.id })
            .populate('senderId', 'name avatar')
            .sort('createdAt');

        // Mark messages as read
        await Message.updateMany(
            { conversationId: req.params.id, senderId: { $ne: req.user._id }, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { conversationId, recipientId, propertyId, content } = req.body;

        let conversation;

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        } else if (recipientId) {
            // Find or create conversation
            conversation = await Conversation.findOne({
                participants: { $all: [req.user._id, recipientId] }
            });

            if (!conversation) {
                const User = require('../models/User');
                const recipient = await User.findById(recipientId);

                conversation = await Conversation.create({
                    participants: [req.user._id, recipientId],
                    propertyId,
                    studentName: req.user.userType === 'student' ? req.user.name : recipient.name,
                    landlordName: req.user.userType === 'landlord' ? req.user.name : recipient.name
                });
            }
        }

        if (!conversation) {
            return res.status(400).json({ success: false, message: 'Conversation not found' });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: req.user._id,
            senderName: req.user.name,
            content,
            role: req.user.userType
        });

        // Update unread count for other participants
        const unreadCount = conversation.unreadCount || new Map();
        conversation.participants.forEach(participantId => {
            if (!participantId.equals(req.user._id)) {
                const current = unreadCount.get(participantId.toString()) || 0;
                unreadCount.set(participantId.toString(), current + 1);
            }
        });
        conversation.unreadCount = unreadCount;
        await conversation.save();

        res.status(201).json({
            success: true,
            data: message,
            conversationId: conversation._id
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
