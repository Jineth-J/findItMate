const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ studentId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
