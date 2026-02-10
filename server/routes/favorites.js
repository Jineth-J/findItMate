const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Student = require('../models/Student');
const { protect, studentOnly } = require('../middleware/auth');

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private (Student)
router.get('/', protect, studentOnly, async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        const favorites = await Favorite.find({ studentId: student._id })
            .populate('propertyId')
            .sort('-createdAt');

        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/favorites
// @desc    Add to favorites
// @access  Private (Student)
router.post('/', protect, studentOnly, async (req, res) => {
    try {
        const { propertyId } = req.body;
        const student = await Student.findOne({ userId: req.user._id });

        // Check if already favorited
        const existing = await Favorite.findOne({
            studentId: student._id,
            propertyId
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already in favorites' });
        }

        const favorite = await Favorite.create({
            studentId: student._id,
            userId: req.user._id,
            propertyId
        });

        // Add to student's favorites array
        await Student.findByIdAndUpdate(student._id, {
            $push: { favorites: propertyId }
        });

        res.status(201).json({
            success: true,
            data: favorite
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/favorites/:propertyId
// @desc    Remove from favorites
// @access  Private (Student)
router.delete('/:propertyId', protect, studentOnly, async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        await Favorite.findOneAndDelete({
            studentId: student._id,
            propertyId: req.params.propertyId
        });

        // Remove from student's favorites array
        await Student.findByIdAndUpdate(student._id, {
            $pull: { favorites: req.params.propertyId }
        });

        res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
