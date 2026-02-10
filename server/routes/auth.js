const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Landlord = require('../models/Landlord');
const Admin = require('../models/Admin');
const Subscription = require('../models/Subscription');
const SecurityLog = require('../models/SecurityLog');
const { generateToken } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const Notification = require('../models/Notification');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
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
            password,
            name,
            phone,
            nic,
            userType
        });

        // Create type-specific profile
        if (userType === 'student') {
            const subscription = await Subscription.create({
                userId: user._id,
                plan: 'free',
                type: 'student',
                price: 0,
                features: ['Basic property Search', 'AI Chatbot with Session Memory', 'Tour Organizer (Manual Planning)']
            });

            await Student.create({
                userId: user._id,
                university: university || '',
                subscriptionId: subscription._id
            });
        } else if (userType === 'landlord') {
            const subscription = await Subscription.create({
                userId: user._id,
                plan: 'free',
                type: 'landlord',
                price: 0,
                features: ['2 Properties', 'Basic Analytics', 'Standard Support']
            });

            await Landlord.create({
                userId: user._id,
                businessName: businessName || '',
                subscriptionId: subscription._id
            });
        } else if (userType === 'admin') {
            await Admin.create({
                userId: user._id,
                role: 'moderator',
                permissions: ['view_analytics']
            });
        }

        // Generate token and auto-login
        const token = generateToken(user._id);

        // Log security event
        await SecurityLog.create({
            userId: user._id,
            userEmail: user.email,
            action: 'New User Registration (Auto-Login)',
            severity: 'info'
        });

        // Create welcome notification
        await Notification.create({
            userId: user._id,
            type: 'system',
            title: 'Welcome to FindItMate!',
            message: `Welcome ${user.name}! Thank you for joining our platform.`,
            actionUrl: '/profile'
        });

        // Get profile data to return
        let profile = null;
        if (userType === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (userType === 'landlord') {
            profile = await Landlord.findOne({ userId: user._id });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                user: user.toJSON(),
                profile,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            await SecurityLog.create({
                userEmail: email,
                action: 'Failed Login Attempt',
                severity: 'warning',
                details: { reason: 'User not found' }
            });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            await SecurityLog.create({
                userId: user._id,
                userEmail: email,
                action: 'Failed Login Attempt',
                severity: 'warning',
                details: { reason: 'Wrong password' }
            });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account is suspended' });
        }

        // REMOVED: isVerified check
        // Users can login regardless of verification status

        // Log successful login
        await SecurityLog.create({
            userId: user._id,
            userEmail: user.email,
            action: 'Login Successful',
            severity: 'info'
        });

        // Create login notification
        await Notification.create({
            userId: user._id,
            type: 'security',
            title: 'New Login Detected',
            message: `New login detected from your account at ${new Date().toLocaleTimeString()}`,
            metadata: { ip: req.ip }
        });

        const token = generateToken(user._id);

        // Get additional profile data
        let profile = null;
        if (user.userType === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (user.userType === 'landlord') {
            profile = await Landlord.findOne({ userId: user._id });
        } else if (user.userType === 'admin') {
            profile = await Admin.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            data: {
                user: user.toJSON(),
                profile,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// @route   PUT /api/auth/verify/:token
// @desc    Verify email address
// @access  Public
router.put('/verify/:token', async (req, res) => {
    try {
        const verificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        // Log security event
        await SecurityLog.create({
            userId: user._id,
            userEmail: user.email,
            action: 'Email Verified',
            severity: 'info'
        });

        // Create verification notification
        await Notification.create({
            userId: user._id,
            type: 'verification',
            title: 'Email Verified',
            message: 'Your email address has been successfully verified.',
            actionUrl: '/profile'
        });

        const token = generateToken(user._id);

        // Get profile
        let profile = null;
        if (user.userType === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (user.userType === 'landlord') {
            profile = await Landlord.findOne({ userId: user._id });
        }

        res.status(200).json({
            success: true,
            data: {
                token,
                user: user.toJSON(),
                profile
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
