#!/usr/bin/env node

/**
 * Programmatic Merchant Creation Script
 * Usage: node scripts/createMerchant.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const mongoose = require('mongoose');
const MerchantOnboardingService = require('../services/merchantOnboarding');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

/**
 * Create a single merchant programmatically
 */
async function createSingleMerchant(merchantData, options = {}) {
  try {
    console.log('🚀 Creating merchant account...');
    console.log('Business Name:', merchantData.businessName);
    console.log('Email:', merchantData.email);
    console.log('---');

    const result = await MerchantOnboardingService.createMerchantProgrammatically(
      merchantData, 
      options
    );

    console.log('✅ SUCCESS! Merchant account created');
    console.log('🏢 Business:', result.merchant.businessName);
    console.log('📧 Email:', result.merchant.email);
    console.log('🔑 Temp Password:', result.credentials.tempPassword);
    console.log('🔗 Login URL:', result.credentials.loginUrl);
    console.log('⚙️ Setup URL:', result.credentials.setupUrl);
    console.log('📬 Message:', result.message);
    console.log('---');

    return result;

  } catch (error) {
    console.error('❌ ERROR creating merchant:', error.message);
    throw error;
  }
}

/**
 * Create multiple merchants from an array
 */
async function createMultipleMerchants(merchantsData, options = {}) {
  const results = [];
  
  for (let i = 0; i < merchantsData.length; i++) {
    const merchantData = merchantsData[i];
    
    try {
      console.log(`\n📋 Creating merchant ${i + 1}/${merchantsData.length}`);
      const result = await createSingleMerchant(merchantData, {
        ...options,
        createdBy: options.createdBy || `bulk-script-${Date.now()}`
      });
      
      results.push({ success: true, merchant: result.merchant, credentials: result.credentials });
      
      // Small delay between creations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create ${merchantData.businessName}:`, error.message);
      results.push({ success: false, error: error.message, merchantData });
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n🎯 CREATION SUMMARY');
  console.log('================');
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
    console.log('\n✅ CREDENTIALS FOR SUCCESSFUL CREATIONS:');
    results
      .filter(r => r.success)
      .forEach(r => {
        console.log(`   📧 ${r.merchant.email}: ${r.credentials.tempPassword}`);
      });
  }

  return results;
}

/**
 * Example usage functions
 */

// Single merchant example
async function exampleSingleMerchant() {
  const merchantData = {
    businessName: 'Tech Innovations Ltd',
    email: 'info@techinnovations.co.ke',
    phone: '+254712345678',
    businessType: 'Electronics',
    description: 'Leading provider of innovative technology solutions in Nairobi CBD',
    address: 'Kenyatta Avenue, Nairobi CBD',
    website: 'https://techinnovations.co.ke'
  };

  const options = {
    autoVerify: true,  // Automatically verify the business
    createdBy: 'admin-script',
    reason: 'Bulk import for established businesses'
  };

  return await createSingleMerchant(merchantData, options);
}

// Multiple merchants example
async function exampleMultipleMerchants() {
  const merchantsData = [
    {
      businessName: 'Fresh Foods Market',
      email: 'manager@freshfoods.co.ke',
      phone: '+254722111222',
      businessType: 'Food & Beverages',
      description: 'Premium fresh produce and organic foods',
      address: 'Tom Mboya Street, Nairobi CBD',
      website: 'https://freshfoods.co.ke'
    },
    {
      businessName: 'City Fashion Boutique',
      email: 'hello@cityfashion.co.ke',
      phone: '+254733444555',
      businessType: 'Fashion & Clothing',
      description: 'Latest fashion trends and designer clothing',
      address: 'Moi Avenue, Nairobi CBD',
      website: 'https://cityfashion.co.ke'
    },
    {
      businessName: 'Digital Solutions Hub',
      email: 'contact@digitalhub.co.ke',
      phone: '+254744666777',
      businessType: 'Services',
      description: 'Comprehensive digital marketing and web solutions',
      address: 'Kimathi Street, Nairobi CBD',
      website: 'https://digitalhub.co.ke'
    }
  ];

  const options = {
    autoVerify: false,  // Let them go through verification process
    createdBy: 'onboarding-script',
    reason: 'New business onboarding campaign'
  };

  return await createMultipleMerchants(merchantsData, options);
}

/**
 * Main execution function
 */
async function main() {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    switch (command) {
      case 'single':
        console.log('🎯 Creating single merchant example...\n');
        await exampleSingleMerchant();
        break;

      case 'multiple':
        console.log('🎯 Creating multiple merchants example...\n');
        await exampleMultipleMerchants();
        break;

      case 'custom':
        // For custom merchant data from command line
        if (args.length < 4) {
          console.log('Usage: node createMerchant.js custom "Business Name" "email@example.com" "Phone" "BusinessType"');
          process.exit(1);
        }
        
        const customMerchant = {
          businessName: args[1],
          email: args[2],
          phone: args[3],
          businessType: args[4] || 'Services',
          description: `${args[1]} - Professional services in Nairobi CBD`,
          address: 'Kiambi Road, Nairobi Kenya'
        };

        await createSingleMerchant(customMerchant, {
          autoVerify: false,
          createdBy: 'command-line',
          reason: 'Manual creation via script'
        });
        break;

      case 'help':
      default:
        console.log(`
🏢 Merchant Creation Script Help
===============================

Usage: node scripts/createMerchant.js [command]

Commands:
  single    - Create a single example merchant
  multiple  - Create multiple example merchants
  custom    - Create custom merchant from command line
  help      - Show this help message

Examples:
  node scripts/createMerchant.js single
  node scripts/createMerchant.js multiple
  node scripts/createMerchant.js custom "My Business" "info@mybiz.com" "+254712345678" "Services"

Features:
  ✅ Automatic password generation
  📧 Welcome email with credentials
  🔗 Account setup links
  ⚙️ Configurable verification status
  📊 Bulk creation support
  🔒 Secure credential handling

The script will:
1. Create merchant account(s) in the database
2. Generate secure temporary passwords
3. Send welcome emails with login credentials
4. Provide setup links for account completion
5. Display summary of created accounts
        `);
        break;
    }

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
  createSingleMerchant,
  createMultipleMerchants,
  connectDB
};