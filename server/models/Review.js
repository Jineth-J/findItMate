const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    studentName: {
        type: String
    },
    studentEmail: {
        type: String
    },
    propertyName: {
        type: String
    },
    isApproved: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Update property rating after review save
reviewSchema.post('save', async function () {
    const Property = require('./Property');
    const reviews = await this.constructor.find({ propertyId: this.propertyId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Property.findByIdAndUpdate(this.propertyId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length
    });
});

module.exports = mongoose.model('Review', reviewSchema);
