const express = require('express');
const router = express.Router();
const TourPlan = require('../models/TourPlan');
const Student = require('../models/Student');
const Landlord = require('../models/Landlord');
const { protect } = require('../middleware/auth');

// @route   GET /api/tours
// @desc    Get user's tour plans
// @access  Private (Student or Landlord)
router.get('/', protect, async (req, res) => {
    try {
        const tourPlans = await TourPlan.find({ userId: req.user._id })
            .populate('properties')
            .populate('optimizedOrder')
            .sort('-createdAt');

        res.json({
            success: true,
            data: tourPlans
        });
    } catch (error) {
        console.error('Get tours error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/tours/:id
// @desc    Get single tour plan
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const tourPlan = await TourPlan.findOne({
            _id: req.params.id,
            userId: req.user._id
        })
            .populate('properties')
            .populate('optimizedOrder');

        if (!tourPlan) {
            return res.status(404).json({ success: false, message: 'Tour plan not found' });
        }

        res.json({
            success: true,
            data: tourPlan
        });
    } catch (error) {
        console.error('Get tour error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/tours
// @desc    Create tour plan
// @access  Private (Student or Landlord)
router.post('/', protect, async (req, res) => {
    try {
        const { name, properties, scheduledDate, notes } = req.body;

        // Determine user type and get profile
        let studentId = null;
        let landlordId = null;
        let userType = req.user.userType;

        if (userType === 'student') {
            const student = await Student.findOne({ userId: req.user._id });
            if (student) {
                studentId = student._id;
            }
        } else if (userType === 'landlord') {
            const landlord = await Landlord.findOne({ userId: req.user._id });
            if (landlord) {
                landlordId = landlord._id;
            }
        }

        const tourPlan = await TourPlan.create({
            userId: req.user._id,
            userType,
            studentId,
            landlordId,
            name: name || 'My Tour Plan',
            properties,
            scheduledDate,
            notes
        });

        // Populate properties for response
        await tourPlan.populate('properties');

        res.status(201).json({
            success: true,
            data: tourPlan
        });
    } catch (error) {
        console.error('Create tour error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/tours/:id
// @desc    Update tour plan (including route optimization results)
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const {
            name,
            properties,
            optimizedOrder,
            scheduledDate,
            notes,
            status,
            estimatedDuration,
            estimatedDistance,
            routePath
        } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (properties !== undefined) updateData.properties = properties;
        if (optimizedOrder !== undefined) updateData.optimizedOrder = optimizedOrder;
        if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
        if (notes !== undefined) updateData.notes = notes;
        if (status !== undefined) updateData.status = status;
        if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
        if (estimatedDistance !== undefined) updateData.estimatedDistance = estimatedDistance;
        if (routePath !== undefined) updateData.routePath = routePath;

        const tourPlan = await TourPlan.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updateData,
            { new: true }
        ).populate('properties').populate('optimizedOrder');

        if (!tourPlan) {
            return res.status(404).json({ success: false, message: 'Tour plan not found' });
        }

        res.json({
            success: true,
            data: tourPlan
        });
    } catch (error) {
        console.error('Update tour error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/tours/:id/route
// @desc    Save route optimization results
// @access  Private
router.put('/:id/route', protect, async (req, res) => {
    try {
        const {
            optimizedOrder,
            estimatedDuration,
            estimatedDistance,
            routePath
        } = req.body;

        const tourPlan = await TourPlan.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            {
                optimizedOrder,
                estimatedDuration,
                estimatedDistance,
                routePath,
                status: 'scheduled'
            },
            { new: true }
        ).populate('properties').populate('optimizedOrder');

        if (!tourPlan) {
            return res.status(404).json({ success: false, message: 'Tour plan not found' });
        }

        res.json({
            success: true,
            data: tourPlan
        });
    } catch (error) {
        console.error('Save route error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/tours/:id
// @desc    Delete tour plan
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const tourPlan = await TourPlan.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!tourPlan) {
            return res.status(404).json({ success: false, message: 'Tour plan not found' });
        }

        res.json({ success: true, message: 'Tour plan deleted' });
    } catch (error) {
        console.error('Delete tour error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
