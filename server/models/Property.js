const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        city: { type: String, default: 'Colombo' },
        district: { type: String, default: '' },
        nearbyUniversities: [{ type: String }]
    },
    rent: {
        type: Number,
        required: [true, 'Rent amount is required']
    },
    deposit: {
        type: Number,
        default: 0
    },
    keyMoney: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['single', 'shared', 'apartment', 'hostel', 'suite', 'standard', 'deluxe'],
        default: 'single'
    },
    capacity: {
        type: Number,
        default: 1
    },
    amenities: [{
        type: String
    }],
    images: [{ type: String }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'occupied'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    estimatedBudget: {
        type: Number,
        default: 0
    },
    utilitiesCost: {
        type: Number,
        default: 0
    },
    foodCost: {
        type: Number,
        default: 0
    },
    transportCost: {
        type: Number,
        default: 0
    },
    mealsIncluded: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    safetyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    }
}, {
    timestamps: true
});

// Index for search
propertySchema.index({ title: 'text', address: 'text', description: 'text' });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);
