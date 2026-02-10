const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    university: {
        type: String,
        default: ''
    },
    studentId: {
        type: String,
        default: ''
    },
    course: {
        type: String,
        default: ''
    },
    yearOfStudy: {
        type: Number,
        default: 1
    },
    verificationData: {
        nic: String,
        nicFrontUrl: String,
        nicBackUrl: String,
        universityIdUrl: String
    },
    // Accommodation Preferences
    budget: {
        type: Number,
        default: 0
    },
    preferredRoomType: {
        type: String,
        default: ''
    },
    aboutMe: {
        type: String,
        default: ''
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    tourPlans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TourPlan'
    }],
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    currentLeaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
