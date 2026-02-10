const mongoose = require('mongoose');
const Property = require('../models/Property');
require('dotenv').config();

// Demo property images mapping
const demoImages = [
  '/uploads/img/property-1.jpg',
  '/uploads/img/property-2.jpg', 
  '/uploads/img/property-3.jpg',
  '/uploads/img/property-4.jpg',
  '/uploads/img/property-5.jpg',
  '/uploads/img/property-6.jpg',
  '/uploads/img/property-7.jpg',
  '/uploads/img/property-8.jpg',
  '/uploads/img/property-9.jpg',
  '/uploads/img/property-10.jpg'
];

// List of demo property titles that should be updated
const demoPropertyTitles = [
  'Modern Single Room - UCSC 5min Walk',
  'Shared Room for 2 - Near Moratuwa University',
  'Deluxe Studio Apartment - Colombo 03',
  'Budget Friendly Room - Maharagama',
  'Premium Suite - Bambalapitiya',
  'Girls Only Hostel - Nugegoda',
  'Twin Sharing Room - Wellawatte',
  'Air-Conditioned Room - Borella',
  'Annex for Students - Dehiwala',
  'Furnished Room - Battaramulla',
  "Imantha's House"
];

async function safeUpdateDemoImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finditmate');
    console.log('Connected to MongoDB');

    // Get only demo properties by title
    const demoProperties = await Property.find({
      title: { $in: demoPropertyTitles }
    });

    console.log(`Found ${demoProperties.length} demo properties to update`);

    // Update each demo property with unique images
    for (let i = 0; i < demoProperties.length; i++) {
      const property = demoProperties[i];
      const imageIndex = i % demoImages.length;
      
      // Create multiple images for variety (main + additional)
      const mainImage = demoImages[imageIndex];
      const additionalImages = [
        demoImages[(imageIndex + 1) % demoImages.length],
        demoImages[(imageIndex + 2) % demoImages.length]
      ];
      
      const allImages = [mainImage, ...additionalImages];
      
      await Property.findByIdAndUpdate(property._id, {
        $set: { images: allImages }
      });

      console.log(`✅ Updated "${property.title}" with images:`, allImages);
    }

    console.log('✅ Demo property images updated successfully!');
    console.log('📝 Note: Only demo properties were updated. Landlord-added properties remain unchanged.');

  } catch (error) {
    console.error('Error updating demo property images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
safeUpdateDemoImages();
