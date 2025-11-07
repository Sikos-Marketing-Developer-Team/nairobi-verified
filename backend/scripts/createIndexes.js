require('dotenv').config();
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Creating Merchant indexes...');
    await Merchant.createIndexes();
    console.log('✅ Merchant indexes created');

    console.log('📊 Creating Product indexes...');
    await Product.createIndexes();
    console.log('✅ Product indexes created');

    // List all indexes
    const merchantIndexes = await Merchant.collection.getIndexes();
    const productIndexes = await Product.collection.getIndexes();

    console.log('\n📋 Merchant Indexes:', Object.keys(merchantIndexes));
    console.log('📋 Product Indexes:', Object.keys(productIndexes));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createIndexes();