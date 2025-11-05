/**
 * Script to fix products with broken placeholder image paths
 * Updates /placeholder-product.jpg to a working placeholder URL
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const NEW_PLACEHOLDER = 'https://via.placeholder.com/400x400?text=No+Image';
const OLD_PLACEHOLDER = '/placeholder-product.jpg';

async function fixPlaceholderImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products with the old placeholder
    const productsWithOldPlaceholder = await Product.find({
      $or: [
        { primaryImage: OLD_PLACEHOLDER },
        { images: OLD_PLACEHOLDER }
      ]
    });

    console.log(`\n📊 Found ${productsWithOldPlaceholder.length} products with old placeholder`);

    if (productsWithOldPlaceholder.length === 0) {
      console.log('✅ No products need updating!');
      process.exit(0);
    }

    console.log('\n🔧 Updating products...\n');

    let updated = 0;
    for (const product of productsWithOldPlaceholder) {
      let needsUpdate = false;

      // Fix primaryImage
      if (product.primaryImage === OLD_PLACEHOLDER) {
        product.primaryImage = NEW_PLACEHOLDER;
        needsUpdate = true;
        console.log(`  📦 ${product.name}: Updated primaryImage`);
      }

      // Fix images array
      if (product.images && product.images.includes(OLD_PLACEHOLDER)) {
        product.images = product.images.map(img => 
          img === OLD_PLACEHOLDER ? NEW_PLACEHOLDER : img
        );
        needsUpdate = true;
        console.log(`  📦 ${product.name}: Updated images array`);
      }

      if (needsUpdate) {
        await product.save();
        updated++;
      }
    }

    console.log(`\n✅ Successfully updated ${updated} products!`);
    console.log('🎉 All products now have working placeholder images');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
fixPlaceholderImages();
