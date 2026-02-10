const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly, search } = req.query;

        const query = { userId: req.user._id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const notifications = await Notification.find(query)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

        res.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
