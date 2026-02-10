const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/issues
// @desc    Get user's issues
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const issues = await Issue.find({ reporterId: req.user._id })
            .populate('propertyId', 'title address')
            .sort('-createdAt');

        res.json({
            success: true,
            data: issues
        });
    } catch (error) {
        console.error('Get issues error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/issues
// @desc    Report an issue
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { propertyId, leaseId, type, priority, title, description } = req.body;

        const issue = await Issue.create({
            reporterId: req.user._id,
            propertyId,
            leaseId,
            type,
            priority,
            title,
            description
        });

        // Notify property owner if propertyId is provided
        if (propertyId) {
            const Property = require('../models/Property');
            const Landlord = require('../models/Landlord');

            const property = await Property.findById(propertyId);
            if (property) {
                const landlord = await Landlord.findById(property.landlordId);
                if (landlord) {
                    await Notification.create({
                        userId: landlord.userId,
                        type: 'system',
                        title: 'New Issue Reported',
                        message: `A new ${type} issue has been reported for ${property.title}: ${title}`,
                        actionUrl: `/issues/${issue._id}`
                    });
                }
            }
        }

        res.status(201).json({
            success: true,
            data: issue
        });
    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/issues/:id
// @desc    Update issue status
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { status, resolution } = req.body;

        const updateData = { status };
        if (status === 'resolved') {
            updateData.resolvedAt = new Date();
            updateData.resolution = resolution;
        }

        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Notify reporter
        await Notification.create({
            userId: issue.reporterId,
            type: 'system',
            title: 'Issue Update',
            message: `Your issue "${issue.title}" status has been updated to: ${status}`,
            actionUrl: `/issues/${issue._id}`
        });

        res.json({
            success: true,
            data: issue
        });
    } catch (error) {
        console.error('Update issue error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
