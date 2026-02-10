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

async function updateDemoPropertyImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finditmate');

    console.log('Connected to MongoDB');

    // Get all properties
    const allProperties = await Property.find({});
    console.log(`Found ${allProperties.length} total properties`);

    // Filter properties that need images (no images or empty images)
    const propertiesToUpdate = allProperties.filter(prop => 
      !prop.images || prop.images.length === 0
    );
    console.log(`Found ${propertiesToUpdate.length} properties to update`);

    // Update each property with unique images
    for (let i = 0; i < propertiesToUpdate.length; i++) {
      const property = propertiesToUpdate[i];
      const imageIndex = i % demoImages.length; // Cycle through images if more properties than images
      
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

      console.log(`Updated property "${property.title}" with images:`, allImages);
    }

    console.log('✅ Demo property images updated successfully!');

  } catch (error) {
    console.error('Error updating demo property images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateDemoPropertyImages();
