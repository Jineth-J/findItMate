const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Landlord = require('../models/Landlord');
const { protect, optionalAuth, landlordOnly } = require('../middleware/auth');
const { uploaders } = require('../utils/uploader');

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            search,
            type,
            minPrice,
            maxPrice,
            capacity,
            amenities,
            city,
            status,
            sort = '-createdAt',
            page = 1,
            limit = 20
        } = req.query;

        const query = {};

        // Only filter by status if explicitly provided
        if (status) {
            query.status = status;
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (type) {
            query.type = type;
        }

        if (minPrice || maxPrice) {
            query.rent = {};
            if (minPrice) query.rent.$gte = Number(minPrice);
            if (maxPrice) query.rent.$lte = Number(maxPrice);
        }

        if (capacity) {
            query.capacity = { $gte: Number(capacity) };
        }

        if (amenities) {
            const amenityList = amenities.split(',');
            query.amenities = { $all: amenityList };
        }

        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        const properties = await Property.find(query)
            .populate('landlordId', 'userId businessName')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            data: properties,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate({
                path: 'landlordId',
                populate: {
                    path: 'userId',
                    select: 'name email phone avatar'
                }
            });

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Increment views
        property.views += 1;
        await property.save();

        res.json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/properties
// @desc    Create property
// @access  Private (Landlord or Admin)
router.post('/', protect, async (req, res) => {
    try {
        // Check if user is landlord or admin
        if (req.user.userType !== 'landlord' && req.user.userType !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only landlords and admins can create properties' });
        }

        let landlordId;

        if (req.user.userType === 'admin') {
            // Admin: use provided landlordId from body, or find/create a system landlord
            if (req.body.landlordId) {
                landlordId = req.body.landlordId;
            } else {
                // Find or create a landlord profile for the admin
                let landlord = await Landlord.findOne({ userId: req.user._id });
                if (!landlord) {
                    landlord = await Landlord.create({ userId: req.user._id, businessName: 'Admin Properties' });
                }
                landlordId = landlord._id;
            }
        } else {
            // Landlord: find their landlord profile
            const landlord = await Landlord.findOne({ userId: req.user._id });
            if (!landlord) {
                return res.status(400).json({ success: false, message: 'Landlord profile not found. Please complete your profile first.' });
            }
            landlordId = landlord._id;
        }

        const propertyData = {
            ...req.body,
            landlordId,
            status: (req.user.isVerified || req.user.userType === 'admin') ? 'active' : 'pending'
        };

        // Clean up - remove landlordId from body if it was set
        delete propertyData.landlordIdFromBody;

        const property = await Property.create(propertyData);

        // Add property to landlord's properties array
        await Landlord.findByIdAndUpdate(landlordId, {
            $push: { properties: property._id }
        });

        res.status(201).json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Owner/Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Check ownership
        const landlord = await Landlord.findOne({ userId: req.user._id });
        if (req.user.userType !== 'admin' && (!landlord || !property.landlordId.equals(landlord._id))) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
        }

        // Validate and prepare update data
        const updateData = { ...req.body };
        
        // Convert numeric fields
        if (updateData.rent) updateData.rent = Number(updateData.rent);
        if (updateData.deposit) updateData.deposit = Number(updateData.deposit);
        if (updateData.keyMoney) updateData.keyMoney = Number(updateData.keyMoney);
        if (updateData.capacity) updateData.capacity = Number(updateData.capacity);
        if (updateData.estimatedBudget) updateData.estimatedBudget = Number(updateData.estimatedBudget);
        if (updateData.utilitiesCost) updateData.utilitiesCost = Number(updateData.utilitiesCost);
        if (updateData.foodCost) updateData.foodCost = Number(updateData.foodCost);
        if (updateData.transportCost) updateData.transportCost = Number(updateData.transportCost);
        
        // Handle location object
        if (updateData.location && typeof updateData.location === 'object') {
            if (updateData.location.lat) updateData['location.lat'] = Number(updateData.location.lat);
            if (updateData.location.lng) updateData['location.lng'] = Number(updateData.location.lng);
        }
        
        // Validate required fields
        if (updateData.title && updateData.title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Property title is required' });
        }
        
        if (updateData.address && updateData.address.trim() === '') {
            return res.status(400).json({ success: false, message: 'Address is required' });
        }
        
        if (updateData.rent && (isNaN(updateData.rent) || updateData.rent < 0)) {
            return res.status(400).json({ success: false, message: 'Valid rent amount is required' });
        }

        property = await Property.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('landlordId', 'userId businessName');

        res.json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('Update property error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: messages 
            });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Check ownership
        const landlord = await Landlord.findOne({ userId: req.user._id });
        if (req.user.userType !== 'admin' && (!landlord || !property.landlordId.equals(landlord._id))) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
        }

        await property.deleteOne();

        // Remove from landlord's properties array
        if (landlord) {
            await Landlord.findByIdAndUpdate(landlord._id, {
                $pull: { properties: property._id }
            });
        }

        res.json({ success: true, message: 'Property deleted' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/properties/landlord/:id
// @desc    Get landlord's properties (accepts userId or landlordId)
// @access  Public
router.get('/landlord/:id', async (req, res) => {
    try {
        // First try to find properties directly by landlordId
        let properties = await Property.find({ landlordId: req.params.id });

        // If no results, look up the Landlord by userId and search by landlord._id
        if (properties.length === 0) {
            const landlord = await Landlord.findOne({ userId: req.params.id });
            if (landlord) {
                properties = await Property.find({ landlordId: landlord._id });
            }
        }

        res.json({
            success: true,
            data: properties
        });
    } catch (error) {
        console.error('Get landlord properties error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/properties/:id/images
// @desc    Upload property images
// @access  Private (Owner/Admin)
router.post('/:id/images', protect, uploaders.properties.array('images', 10), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Check ownership
        const landlord = await Landlord.findOne({ userId: req.user._id });
        if (req.user.userType !== 'admin' && (!landlord || !property.landlordId.equals(landlord._id))) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }

        // Get URLs from processed files
        const imageUrls = req.files.map(file => file.url);

        // Add to property images array
        property.images = [...(property.images || []), ...imageUrls];
        await property.save();

        res.json({
            success: true,
            message: `${req.files.length} image(s) uploaded successfully`,
            data: {
                uploadedImages: req.files,
                allImages: property.images
            }
        });
    } catch (error) {
        console.error('Property image upload error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
