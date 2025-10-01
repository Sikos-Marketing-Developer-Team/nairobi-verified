// scripts/addIsActiveField.js
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

async function addIsActiveField() {
  try {
    const result = await Merchant.updateMany(
      { isActive: { $exists: false } },
      { 
        $set: { 
          isActive: false,
          activatedDate: null 
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} merchants with isActive field`);
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addIsActiveField();