const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Landlord = require('../models/Landlord');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const SecurityLog = require('../models/SecurityLog');
const Verification = require('../models/Verification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const { userType, search, page = 1, limit = 20 } = req.query;
        const query = userType ? { userType } : {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: { page: Number(page), limit: Number(limit), total }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user
// @access  Private (Admin)
router.put('/users/:id/verify', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await SecurityLog.create({
            userId: req.user._id,
            action: `Admin verified user: ${user.email}`,
            severity: 'info'
        });

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/users/:id/suspend
// @desc    Suspend user
// @access  Private (Admin)
router.put('/users/:id/suspend', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await SecurityLog.create({
            userId: req.user._id,
            action: `Admin suspended user: ${user.email}`,
            severity: 'warning'
        });

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/users
// @desc    Create a new user (Admin)
// @access  Private (Admin)
router.post('/users', protect, adminOnly, async (req, res) => {
    try {
        const { email, password, name, phone, nic, userType, university, businessName } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password, // Hashed by pre-save hook
            name,
            phone,
            nic,
            userType,
            isVerified: true, // Auto-verify admin-created users
            verificationStatus: 'verified'
        });

        // Create type-specific profile
        let profile = null;
        if (userType === 'student') {
            const Subscription = require('../models/Subscription');
            const subscription = await Subscription.create({
                userId: user._id,
                plan: 'free',
                type: 'student',
                price: 0,
                features: ['Basic property Search']
            });

            profile = await Student.create({
                userId: user._id,
                university: university || '',
                subscriptionId: subscription._id
            });
        } else if (userType === 'landlord') {
            const Subscription = require('../models/Subscription');
            const subscription = await Subscription.create({
                userId: user._id,
                plan: 'free',
                type: 'landlord',
                price: 0,
                features: ['2 Properties']
            });

            profile = await Landlord.create({
                userId: user._id,
                businessName: businessName || '',
                subscriptionId: subscription._id
            });
        }

        await SecurityLog.create({
            userId: req.user._id,
            action: `Admin created user: ${user.email} (${userType})`,
            severity: 'info'
        });

        res.status(201).json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
        }

        await user.deleteOne();

        // Also delete associated profile
        if (user.userType === 'student') {
            await Student.findOneAndDelete({ userId: user._id });
        } else if (user.userType === 'landlord') {
            await Landlord.findOneAndDelete({ userId: user._id });
            // Optionally delete properties or reassign them
            await Property.deleteMany({ landlordId: { $in: await Landlord.find({ userId: user._id }).distinct('_id') } });
        }

        await SecurityLog.create({
            userId: req.user._id,
            action: `Admin deleted user: ${user.email}`,
            severity: 'warning'
        });

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/properties
// @desc    Get all properties
// @access  Private (Admin)
router.get('/properties', protect, adminOnly, async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const properties = await Property.find(query)
            .populate({
                path: 'landlordId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            data: properties,
            pagination: { page: Number(page), limit: Number(limit), total }
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/properties/:id
// @desc    Update property details
// @access  Private (Admin)
router.put('/properties/:id', protect, adminOnly, async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        await SecurityLog.create({
            userId: req.user._id,
            action: `Admin updated property: ${property.title}`,
            severity: 'info'
        });

        res.json({ success: true, data: property });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/properties/:id/verify
// @desc    Verify property
// @access  Private (Admin)
router.put('/properties/:id/verify', protect, adminOnly, async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { isVerified: true, status: 'active' },
            { new: true }
        );

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.json({ success: true, data: property });
    } catch (error) {
        console.error('Verify property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Private (Admin)
router.get('/payments', protect, adminOnly, async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const query = status ? { status } : {};

        const payments = await Payment.find(query)
            .populate('userId', 'name email')
            .populate('studentId') // populating student details via studentId if needed, or just rely on userId
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Payment.countDocuments(query);

        res.json({
            success: true,
            data: payments,
            pagination: { page: Number(page), limit: Number(limit), total }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', protect, adminOnly, async (req, res) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalLandlords,
            totalProperties,
            activeProperties,
            pendingProperties,
            totalBookings,
            pendingBookings,
            totalReviews,
            totalPayments,
            pendingVerificationUsers,
            verifiedUsers,
            suspendedUsers,
            recentUsers,
            recentProperties
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ userType: 'student' }),
            User.countDocuments({ userType: 'landlord' }),
            Property.countDocuments(),
            Property.countDocuments({ status: 'active' }),
            Property.countDocuments({ status: 'pending' }),
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Review.countDocuments(),
            Payment.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.countDocuments({ verificationStatus: 'pending' }),
            User.countDocuments({ verificationStatus: 'verified' }),
            User.countDocuments({ isActive: false }),
            User.find().sort('-createdAt').limit(5).select('name email userType createdAt'),
            Property.find().sort('-createdAt').limit(5).populate('landlordId', 'userId name')
        ]);

        // Calculate growth percentages
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [
            usersLastMonth,
            propertiesLastMonth
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Property.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        const userGrowth = totalUsers > 0 ? Math.round((usersLastMonth / totalUsers) * 100) : 0;
        const propertyGrowth = totalProperties > 0 ? Math.round((propertiesLastMonth / totalProperties) * 100) : 0;

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    landlords: totalLandlords,
                    pending: pendingVerificationUsers,
                    verified: verifiedUsers,
                    suspended: suspendedUsers,
                    growth: userGrowth,
                    recent: recentUsers
                },
                properties: {
                    total: totalProperties,
                    active: activeProperties,
                    pending: pendingProperties,
                    growth: propertyGrowth,
                    recent: recentProperties
                },
                bookings: { total: totalBookings, pending: pendingBookings },
                reviews: { total: totalReviews },
                revenue: totalPayments[0]?.total || 0,
                // Add historical data
                historical: await getHistoricalData()
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Helper for historical data
async function getHistoricalData() {
    const months = 6;
    const today = new Date();
    const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - months));

    // Generate month buckets
    const monthBuckets = [];
    for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const dateStr = date.toISOString().slice(0, 7); // YYYY-MM
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        monthBuckets.push({ dateStr, startDate, endDate });
    }

    // Get user and property counts for each month
    const userPromises = monthBuckets.map(bucket => 
        User.countDocuments({ createdAt: { $gte: bucket.startDate, $lt: bucket.endDate } })
            .then(count => ({ _id: bucket.dateStr, count }))
    );

    const propertyPromises = monthBuckets.map(bucket => 
        Property.countDocuments({ createdAt: { $gte: bucket.startDate, $lt: bucket.endDate } })
            .then(count => ({ _id: bucket.dateStr, count }))
    );

    const [users, properties] = await Promise.all([
        Promise.all(userPromises),
        Promise.all(propertyPromises)
    ]);

    // Format data for frontend
    return { users, properties };
}

// @route   GET /api/admin/security-logs
// @desc    Get security logs
// @access  Private (Admin)
router.get('/security-logs', protect, adminOnly, async (req, res) => {
    try {
        const { severity, page = 1, limit = 50 } = req.query;
        const query = severity ? { severity } : {};

        const logs = await SecurityLog.find(query)
            .populate('userId', 'name email')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await SecurityLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: { page: Number(page), limit: Number(limit), total }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/verifications
// @desc    Get pending verifications
// @access  Private (Admin)
router.get('/verifications', protect, adminOnly, async (req, res) => {
    try {
        const { status = 'pending' } = req.query;

        // Fetch users with the specified verification status
        const users = await User.find({ verificationStatus: status })
            .select('-password')
            .sort('-updatedAt');

        // Enhance with profile data
        const verifications = await Promise.all(users.map(async (user) => {
            let profile = null;
            if (user.userType === 'student') {
                profile = await Student.findOne({ userId: user._id });
            } else if (user.userType === 'landlord') {
                profile = await Landlord.findOne({ userId: user._id });
            }

            return {
                _id: user._id, // Verification ID is user ID in this context
                user: user,
                profile: profile,
                status: user.verificationStatus,
                submittedAt: user.updatedAt
            };
        }));

        res.json({
            success: true,
            data: verifications
        });
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/chats
// @desc    Get all chat conversations
// @access  Private (Admin)
router.get('/chats', protect, adminOnly, async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate('participants', 'name email userType')
            .populate('propertyId', 'title')
            .sort('-lastMessageTime')
            .limit(50);

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
