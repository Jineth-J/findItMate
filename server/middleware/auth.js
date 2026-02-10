const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }

        next();
    } catch (error) {
        next();
    }
};

// Admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin access required' });
    }
};

// Landlord only
const landlordOnly = (req, res, next) => {
    if (req.user && (req.user.userType === 'landlord' || req.user.userType === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Landlord access required' });
    }
};

// Student only
const studentOnly = (req, res, next) => {
    if (req.user && (req.user.userType === 'student' || req.user.userType === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Student access required' });
    }
};

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = { protect, optionalAuth, adminOnly, landlordOnly, studentOnly, generateToken };
