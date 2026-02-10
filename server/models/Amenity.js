const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['room', 'furniture', 'kitchen', 'safety', 'facilities'],
        required: true
    },
    icon: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Amenity', amenitySchema);
