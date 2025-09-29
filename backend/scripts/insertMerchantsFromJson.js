#!/usr/bin/env node

/**
 * Insert merchants from merchants.json into the database
 */

const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
const connectDB = require('../config/db');

/**
 * Generate a compliant password meeting the schema requirements
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (!@#$%^&*)
 */
function generateCompliantPassword() {
  // Example: P@ssw0rd123!
  return 'P@ssw0rd123!';
}

// Merchants data from merchants.json
const merchantsData = [
  {
    "_id": "60d0fe4f5311236168a10101",
    "businessName": "Amini electronics",
    "email": "Bashkasiraaj@gmail.com",
    "phone": "0724165428",
    "password": "password123",
    "businessType": "Electronics",
    "description": "Electronics store located at Skymall first floor F311",
    "yearEstablished": 2020,
    "address": "Skymall first floor F311",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
    "verified": true,
    "rating": 4.8,
    "reviews": 124
  },
  {
    "_id": "60d0fe4f5311236168a10102",
    "businessName": "Bethel perfect shoes collection",
    "email": "Na@gmail.com",
    "phone": "0797682211",
    "password": "password123",
    "businessType": "Fashion",
    "description": "Shoe collection store next to beba, opposite imenti house",
    "yearEstablished": 2020,
    "address": "Next to beba, opposite imenti house",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
    "verified": true,
    "rating": 4.7,
    "reviews": 89
  },
  {
    "_id": "60d0fe4f5311236168a10103",
    "businessName": "Betim skymall",
    "email": "trizahnicko88@gmail.com",
    "phone": "0728163262",
    "password": "password123",
    "businessType": "Business Services",
    "description": "Store located at Sky mall, Luthuli Avenue",
    "yearEstablished": 2020,
    "address": "Sky mall, Luthuli Avenue",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
    "verified": true,
    "rating": 4.6,
    "reviews": 156
  },
  {
    "_id": "60d0fe4f5311236168a10104",
    "businessName": "Glitz&glam",
    "email": "ashleyatieno43@gmail.com",
    "phone": "0723323666",
    "password": "password123",
    "businessType": "Fashion",
    "description": "Fashion store at Sasa Mall 2nd floor, store No: B9",
    "yearEstablished": 2020,
    "address": "Sasa Mall 2nd floor, store No: B9",
    "location": "Nairobi, Nairobi County, 00504, Kenya",
    "logo": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop",
    "verified": true,
    "rating": 4.9,
    "reviews": 67
  },
  {
    "_id": "60d0fe4f5311236168a10105",
    "businessName": "United East Africa Texiles",
    "email": "Serekahalima@gmail.com",
    "phone": "0720628496",
    "password": "password123",
    "businessType": "Fashion",
    "description": "Textiles store on Gaborone road",
    "yearEstablished": 2020,
    "address": "Gaborone road",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://res.cloudinary.com/dzs7bswxi/image/upload/v1759129174/united_textiles_akzl2n.png",
    "verified": true,
    "rating": 4.5,
    "reviews": 203
  },
  {
    "_id": "60d0fe4f5311236168a10106",
    "businessName": "Joy_annes fashion house",
    "email": "Joyannejoan@gmail.com",
    "phone": "0715886934",
    "password": "password123",
    "businessType": "Fashion",
    "description": "Fashion house at Sasa Mall, First floor A14",
    "yearEstablished": 2020,
    "address": "Sasa Mall, First floor A14",
    "location": "Nairobi, Nairobi County, 00504, Kenya",
    "logo": "https://res.cloudinary.com/dzs7bswxi/image/upload/v1758809065/joy_annes_gvmphq.jpg",
    "verified": true,
    "rating": 4.4,
    "reviews": 78
  },
  {
    "_id": "60d0fe4f5311236168a10107",
    "businessName": "Lucy fashion line",
    "email": "Lucyn0526@gmail.com",
    "phone": "0726414321",
    "password": "password123",
    "businessType": "Fashion",
    "description": "Fashion line at Naccico chambers sunbeam exhibition shop no 21",
    "yearEstablished": 2020,
    "address": "Naccico chambers sunbeam exhibition shop no 21",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop",
    "verified": true,
    "rating": 4.3,
    "reviews": 92
  },
  {
    "_id": "60d0fe4f5311236168a10108",
    "businessName": "Luxxure kenya",
    "email": "luxxurekenya@gmail.com",
    "phone": "0741273952",
    "password": "password123",
    "businessType": "Fashion",
    "description": "Fashion store at Sawa mall, 2nd floor shop B19",
    "yearEstablished": 2020,
    "address": "Sawa mall, 2nd floor shop B19",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://res.cloudinary.com/dzs7bswxi/image/upload/v1759133249/luxurre_inuwad.png",
    "verified": true,
    "rating": 4.7,
    "reviews": 115
  },
  {
    "_id": "60d0fe4f5311236168a10109",
    "businessName": "Mobicare phone accessories and spare",
    "email": "Mobicare2022@gmail.com",
    "phone": "0716361136",
    "password": "password123",
    "businessType": "Electronics",
    "description": "Phone accessories and spare parts store on Munyu road, Lizzie building ground floor",
    "yearEstablished": 2022,
    "address": "Munyu road, Lizzie building ground floor",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    "verified": true,
    "rating": 4.6,
    "reviews": 87
  },
  {
    "_id": "60d0fe4f5311236168a10110",
    "businessName": "B4 - Qualitywigs",
    "email": "Ivonemutheu@gmail.com",
    "phone": "0706243617",
    "password": "password123",
    "businessType": "Fashion",
    "description": "Quality wigs store at B4, 2nd floor sawa mall",
    "yearEstablished": 2020,
    "address": "B4, 2nd floor sawa mall",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop",
    "verified": true,
    "rating": 4.8,
    "reviews": 134
  },
  {
    "_id": "60d0fe4f5311236168a1011",
    "businessName": "Kassanga Music Store",
    "email": "tba",
    "phone": "0706243617",
    "password": "password123",
    "businessType": "Music",
    "description": "Your Journey in Music Starts Here",
    "yearEstablished": 1990,
    "address": "Tembo Co op House, Moi Avenue",
    "location": "Nairobi, Nairobi County, 00100, Kenya",
    "logo": "https://res.cloudinary.com/dzs7bswxi/image/upload/v1759147730/kassanga_uvbgge.jpg",
    "verified": true,
    "rating": 4.8,
    "reviews": 134
  }
]
  


/**
 * Insert merchants from merchants.json into the database
 */
async function insertMerchants() {
  console.log('🚀 INSERTING MERCHANTS FROM merchants.json');
  console.log('=========================================\n');

  const results = [];

  for (let i = 0; i < merchantsData.length; i++) {
    const merchantData = merchantsData[i];
    try {
      console.log(`📋 Inserting merchant ${i + 1}/${merchantsData.length}: ${merchantData.businessName}`);

      // Generate a compliant password
      const compliantPassword = generateCompliantPassword();

      // Prepare merchant data, ensuring _id is set explicitly
      const merchantPayload = {
        _id: merchantData._id,
        businessName: merchantData.businessName,
        email: merchantData.email.toLowerCase(), // Normalize email
        phone: merchantData.phone,
        password: compliantPassword, // Use generated password
        businessType: merchantData.businessType,
        description: merchantData.description,
        yearEstablished: merchantData.yearEstablished,
        address: merchantData.address,
        location: merchantData.location,
        logo: merchantData.logo,
        verified: merchantData.verified,
        rating: merchantData.rating,
        reviews: merchantData.reviews,
        createdProgrammatically: true,
        createdBy: 'merchants-json-import',
        onboardingStatus: 'credentials_sent'
      };

      // Check for existing merchant by email to avoid duplicates
      const existingMerchant = await Merchant.findOne({ email: merchantData.email.toLowerCase() });
      if (existingMerchant) {
        console.warn(`⚠️ Merchant with email ${merchantData.email} already exists. Skipping.`);
        results.push({
          success: false,
          error: `Merchant with email ${merchantData.email} already exists`,
          merchantData
        });
        continue;
      }

      // Insert merchant
      const merchant = await Merchant.create(merchantPayload);

      results.push({
        success: true,
        merchant: {
          _id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email
        }
      });

      console.log(`✅ Inserted: ${merchant.businessName} (${merchant._id})`);

      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Failed to insert ${merchantData.businessName}:`, error.message);
      results.push({
        success: false,
        error: error.message,
        merchantData
      });
    }
  }

  // Display results
  displayResults(results);

  return results;
}

/**
 * Display insertion results
 */
function displayResults(results) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n🎯 INSERTION SUMMARY');
  console.log('==================');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ FAILURES:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.merchantData.businessName}: ${r.error}`);
      });
  }

  if (successful > 0) {
    console.log('\n✅ MERCHANTS INSERTED:');
    console.log('============================');
    results
      .filter(r => r.success)
      .forEach((r, index) => {
        console.log(`${index + 1}. ${r.merchant.businessName}`);
        console.log(`   📧 Email: ${r.merchant.email}`);
        console.log(`   🆔 ID: ${r.merchant._id}`);
        console.log('');
      });
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    await connectDB();
    console.log('Starting merchant insertion from merchants.json...\n');

    const results = await insertMerchants();

    console.log('\n🎉 MERCHANT INSERTION COMPLETE!');
    console.log('================================');
    console.log('✅ All merchant accounts from merchants.json have been processed');
    console.log('\n📞 Next Steps:');
    console.log('1. Verify inserted merchants in the database');
    console.log('2. Check for any accounts marked as failed and resolve issues (e.g., duplicate emails)');
    console.log('3. Update merchant profiles with additional details if needed');
    console.log('4. Notify merchants of their new credentials (password: P@ssw0rd123!)');

  } catch (error) {
    console.error('💥 SCRIPT ERROR:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  insertMerchants,
  merchantsData
};