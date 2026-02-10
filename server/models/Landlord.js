const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        default: ''
    },
    businessAddress: {
        type: String,
        default: ''
    },
    numberOfProperties: {
        type: Number,
        default: 0
    },
    yearsOfExperience: {
        type: Number,
        default: 0
    },
    verificationData: {
        dob: Date,
        address: {
            line1: String,
            line2: String,
            city: String,
            district: String,
            postalCode: String
        },
        nicFrontUrl: String,
        nicBackUrl: String,
        ownershipDocUrl: String,
        experienceDescription: String
    },
    aboutProperties: {
        type: String,
        default: ''
    },
    properties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    totalViews: {
        type: Number,
        default: 0
    },
    totalInquiries: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Landlord', landlordSchema);
