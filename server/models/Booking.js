const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
        ref: 'Landlord',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    guests: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    guestName: {
        type: String
    },
    guestEmail: {
        type: String
    },
    guestPhone: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
