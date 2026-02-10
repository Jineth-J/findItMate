const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { protect, studentOnly } = require('../middleware/auth');

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        if (req.user.userType === 'student') {
            const student = await Student.findOne({ userId: req.user._id });
            query.studentId = student._id;
        } else if (req.user.userType === 'landlord') {
            const Landlord = require('../models/Landlord');
            const landlord = await Landlord.findOne({ userId: req.user._id });
            query.landlordId = landlord._id;
        }

        const bookings = await Booking.find(query)
            .populate('propertyId')
            .populate('studentId')
            .populate('landlordId')
            .sort('-createdAt');

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// @route   GET /api/bookings/availability/:propertyId
// @desc    Get unavailable dates for a property
// @access  Public
router.get('/availability/:propertyId', async (req, res) => {
    try {
        const bookings = await Booking.find({
            propertyId: req.params.propertyId,
            status: { $in: ['confirmed', 'pending'] },
            checkIn: { $gte: new Date() } // Only future bookings
        }).select('checkIn checkOut');

        const blockedDates = bookings.map(b => ({
            start: b.checkIn,
            end: b.checkOut
        }));

        res.json({ success: true, data: blockedDates });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private (Student)
router.post('/', protect, studentOnly, async (req, res) => {
    try {
        const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone } = req.body;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const student = await Student.findOne({ userId: req.user._id });

        const booking = await Booking.create({
            studentId: student._id,
            propertyId,
            landlordId: property.landlordId,
            checkIn,
            checkOut,
            guests,
            guestName: guestName || req.user.name,
            guestEmail: guestEmail || req.user.email,
            guestPhone,
            totalAmount: property.rent + property.deposit
        });

        // Create notification for landlord
        const Landlord = require('../models/Landlord');
        const landlord = await Landlord.findById(property.landlordId);

        await Notification.create({
            userId: landlord.userId,
            type: 'booking',
            title: 'New Booking Request',
            message: `New booking request for ${property.title} from ${req.user.name}`,
            actionUrl: `/bookings/${booking._id}`
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { status, notes } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, notes },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Notify student of status change
        const student = await Student.findById(booking.studentId);
        await Notification.create({
            userId: student.userId,
            type: 'booking',
            title: 'Booking Update',
            message: `Your booking status has been updated to: ${status}`,
            actionUrl: `/bookings/${booking._id}`
        });

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, message: 'Booking cancelled' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
