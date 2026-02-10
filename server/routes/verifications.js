const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Landlord = require('../models/Landlord');
const SecurityLog = require('../models/SecurityLog');
const { protect, adminOnly } = require('../middleware/auth');
const { uploaders } = require('../utils/uploader');

// @route   POST /api/verifications/submit
// @desc    Submit verification documents
// @access  Private
router.post('/submit', protect, async (req, res) => {
    try {
        const { verificationData } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.userType === 'student') {
            const student = await Student.findOne({ userId });
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student profile not found' });
            }

            // Update student verification data
            student.verificationData = {
                nic: verificationData.nic,
                nicFrontUrl: verificationData.nicFrontUrl,
                nicBackUrl: verificationData.nicBackUrl,
                universityIdUrl: verificationData.universityIdUrl
            };
            await student.save();

        } else if (user.userType === 'landlord') {
            const landlord = await Landlord.findOne({ userId });
            if (!landlord) {
                return res.status(404).json({ success: false, message: 'Landlord profile not found' });
            }

            // Update landlord verification data
            landlord.verificationData = {
                dob: verificationData.dob,
                address: verificationData.address,
                nicFrontUrl: verificationData.nicFrontUrl,
                nicBackUrl: verificationData.nicBackUrl,
                ownershipDocUrl: verificationData.ownershipDocUrl,
                experienceDescription: verificationData.experienceDescription
            };
            await landlord.save();
        }

        // Update user status to verified immediately upon document submission
        user.verificationStatus = 'verified';
        user.isVerified = true;
        await user.save();

        // Log security event
        await SecurityLog.create({
            userId: user._id,
            userEmail: user.email,
            action: 'Verification Submitted',
            severity: 'info'
        });

        res.json({
            success: true,
            message: 'Verification submitted successfully',
            data: {
                verificationStatus: 'pending'
            }
        });

    } catch (error) {
        console.error('Verification submission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/verifications/:id/review
// @desc    Review verification (Approve/Reject)
// @access  Private (Admin)
router.put('/:id/review', protect, adminOnly, async (req, res) => {
    try {
        const { status, reviewNotes } = req.body; // status: 'verified' | 'rejected'
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.verificationStatus = status;
        user.isVerified = status === 'verified';
        await user.save();

        // Log security event
        await SecurityLog.create({
            userId: req.user.id, // Admin ID
            action: `Admin reviewed user ${user.email}: ${status}`,
            severity: status === 'verified' ? 'info' : 'warning',
            details: { reviewNotes }
        });

        res.json({
            success: true,
            message: `User verification ${status}`,
            data: {
                verificationStatus: status,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Verification review error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/verifications/upload
// @desc    Upload verification document (NIC, ID, ownership doc)
// @access  Private
router.post('/upload', protect, uploaders.documents.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No document uploaded' });
        }

        // Return the uploaded file URL
        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                url: req.file.url,
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
