const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Property = require('../models/Property');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { protect, studentOnly } = require('../middleware/auth');

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true })
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name avatar' }
            })
            .sort('-createdAt')
            .limit(50);

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/properties/:propertyId/reviews
// @desc    Get reviews for a property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
    try {
        const reviews = await Review.find({ propertyId: req.params.propertyId })
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name avatar' }
            })
            .sort('-createdAt');

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/reviews
// @desc    Create review
// @access  Private (Student)
router.post('/', protect, studentOnly, async (req, res) => {
    try {
        const { propertyId, rating, comment } = req.body;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const student = await Student.findOne({ userId: req.user._id });

        // Check if already reviewed
        const existingReview = await Review.findOne({
            studentId: student._id,
            propertyId
        });

        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this property' });
        }

        const review = await Review.create({
            studentId: student._id,
            propertyId,
            landlordId: property.landlordId,
            rating,
            comment,
            studentName: req.user.name,
            studentEmail: req.user.email,
            propertyName: property.title
        });

        // Notify landlord
        const Landlord = require('../models/Landlord');
        const landlord = await Landlord.findById(property.landlordId);

        if (landlord) {
            await Notification.create({
                userId: landlord.userId,
                type: 'review',
                title: 'New Review Received',
                message: `You received a ${rating}-star review for ${property.title}`,
                actionUrl: `/properties/${property._id}`
            });
        }

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        const student = await Student.findOne({ userId: req.user._id });
        if (req.user.userType !== 'admin' && (!student || !review.studentId.equals(student._id))) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await review.deleteOne();

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
