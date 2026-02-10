const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

// Subscription plans
const PLANS = {
    student: {
        free: {
            name: 'Starter (Free)',
            price: 0,
            features: ['Basic property Search', 'AI Chatbot with Session Memory', 'Tour Organizer (Manual Planning)']
        },
        premium: {
            name: 'Premium',
            price: 2500,
            features: ['AI-Powered Smart Recommendations', 'Priority Property Alerts', 'Budget Optimizer', 'Advanced Tour Planner', 'Premium Support']
        }
    },
    landlord: {
        free: {
            name: 'Starter (Free)',
            price: 0,
            features: ['2 Properties', 'Basic Analytics', 'Standard Support']
        },
        premium: {
            name: 'Premium',
            price: 5000,
            features: ['Unlimited Properties', 'Advanced Analytics', 'Priority Listing', 'Featured Badge', 'Premium Support']
        }
    }
};

// @route   GET /api/subscriptions/plans
// @desc    Get subscription plans
// @access  Public
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        data: PLANS
    });
});

// @route   GET /api/subscriptions/me
// @desc    Get current user's subscription
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ userId: req.user._id });

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/subscriptions
// @desc    Create/upgrade subscription
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { plan } = req.body;
        const userType = req.user.userType;

        if (!PLANS[userType] || !PLANS[userType][plan]) {
            return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        const planDetails = PLANS[userType][plan];

        // Create or update subscription
        let subscription = await Subscription.findOne({ userId: req.user._id });

        if (subscription) {
            subscription.plan = plan;
            subscription.price = planDetails.price;
            subscription.features = planDetails.features;
            subscription.startDate = new Date();
            subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            subscription.status = 'active';
            await subscription.save();
        } else {
            subscription = await Subscription.create({
                userId: req.user._id,
                plan,
                type: userType,
                price: planDetails.price,
                features: planDetails.features,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'active'
            });
        }

        // Create payment record if premium
        if (plan === 'premium') {
            await Payment.create({
                userId: req.user._id,
                subscriptionId: subscription._id,
                type: 'subscription',
                amount: planDetails.price,
                status: 'completed',
                paymentDate: new Date(),
                description: `${planDetails.name} Subscription`
            });
        }

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/subscriptions
// @desc    Cancel subscription
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { userId: req.user._id },
            { status: 'cancelled', plan: 'free', price: 0 },
            { new: true }
        );

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
