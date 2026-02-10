const mongoose = require('mongoose');

const tourPlanSchema = new mongoose.Schema({
    // User who created the tour
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // User type (student or landlord)
    userType: {
        type: String,
        enum: ['student', 'landlord'],
        required: true
    },
    // Optional student reference (for students)
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        sparse: true
    },
    // Optional landlord reference (for landlords)
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord',
        sparse: true
    },
    name: {
        type: String,
        default: 'My Tour Plan'
    },
    properties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    // Ordered property IDs after route optimization
    optimizedOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    scheduledDate: {
        type: Date
    },
    notes: {
        type: String,
        default: ''
    },
    // Route statistics from AI optimization
    estimatedDuration: {
        type: Number, // in minutes
        default: 0
    },
    estimatedDistance: {
        type: Number, // in km
        default: 0
    },
    routePath: [{
        lat: Number,
        lng: Number
    }],
    status: {
        type: String,
        enum: ['planning', 'scheduled', 'completed', 'cancelled'],
        default: 'planning'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TourPlan', tourPlanSchema);
