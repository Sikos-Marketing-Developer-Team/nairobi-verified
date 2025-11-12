/**
 * Migration script to update product categories to new schema
 * Run this after deploying the new Product model
 * 
 * Usage: node scripts/migrate-product-categories.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Category mapping from old to new
const CATEGORY_MAPPING = {
  'Electronics': 'Electronics',
  'Fashion': 'Fashion & Apparel',
  'Home & Garden': 'Home & Garden',
  'Sports': 'Other',
  'Books': 'Other',
  'Beauty': 'Beauty & Cosmetics',
  'Automotive': 'Other',
  'Food & Beverages': 'Food & Beverages'
};

async function migrateCategories() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    console.log('\n📊 Checking current product categories...');
    const currentCategories = await Product.distinct('category');
    console.log('Current categories:', currentCategories);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const oldCategory of currentCategories) {
      const newCategory = CATEGORY_MAPPING[oldCategory];
      
      if (!newCategory) {
        console.log(`⚠️  No mapping found for category: ${oldCategory}, skipping...`);
        skippedCount++;
        continue;
      }

      if (oldCategory === newCategory) {
        console.log(`✓ Category "${oldCategory}" already matches, skipping...`);
        skippedCount++;
        continue;
      }

      console.log(`🔄 Updating "${oldCategory}" → "${newCategory}"...`);
      const result = await Product.updateMany(
        { category: oldCategory },
        { $set: { category: newCategory } }
      );

      console.log(`   Updated ${result.modifiedCount} products`);
      updatedCount += result.modifiedCount;
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Products updated: ${updatedCount}`);
    console.log(`   Categories skipped: ${skippedCount}`);

    console.log('\n📊 New category distribution:');
    const newCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    newCategories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run migration
migrateCategories();
