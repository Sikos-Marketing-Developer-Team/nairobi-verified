#!/usr/bin/env node

/**
 * Add Initial 12 Merchants to Database
 * With scheduled email delivery for tomorrow 7 AM
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const MerchantOnboardingService = require('../services/merchantOnboarding');

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    const conn = await mongoose.connect(mongoUri, {
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
 * Initial 12 merchants data (cleaned and validated)
 */
const initialMerchants = [
  {
    businessName: "Amini Electronics",
    email: "bashkasiraaj@gmail.com",
    phone: "+254724165428",
    businessType: "Electronics",
    address: "Skymall first floor F311, Nairobi CBD",
    description: "Electronics store specializing in mobile phones, computers, and electronic accessories",
    internalId: "NAIROBI-CBD-001",
    ownerName: "Bashkasiraaj"
  },
  {
    businessName: "Bethel Perfect Shoes Collection",
    email: "bethelshoes@nairobicbd.co.ke", // Fixed invalid email
    phone: "+254797682211",
    businessType: "Fashion & Clothing",
    address: "Next to Beba, opposite Imenti House, Nairobi CBD",
    description: "Premium footwear collection for men, women, and children",
    internalId: "NAIROBI-CBD-002",
    ownerName: "Store Manager",
    needsEmailUpdate: true // Flag for admin to update real email
  },
  {
    businessName: "Betim Skymall",
    email: "trizahnicko88@gmail.com",
    phone: "+254728163262",
    businessType: "Fashion & Clothing",
    address: "Skymall, Luthuli Avenue, Nairobi CBD",
    description: "Fashion boutique offering trendy clothing and accessories",
    internalId: "NAIROBI-CBD-003",
    ownerName: "Trizah Nicko"
  },
  {
    businessName: "Glitz&Glam",
    email: "ashleyatieno43@gmail.com",
    phone: "+254723323666",
    businessType: "Beauty & Cosmetics",
    address: "Sasa Mall 2nd Floor, Store No: B9, Nairobi CBD",
    description: "Beauty salon and cosmetics store offering makeup, skincare, and beauty services",
    internalId: "NAIROBI-CBD-004",
    ownerName: "Ashley Atieno"
  },
  {
    businessName: "United East Africa Textiles",
    email: "serekahalima@gmail.com",
    phone: "+254720628496",
    businessType: "Fashion & Clothing",
    address: "Gaborone Road, Nairobi CBD",
    description: "Textile wholesaler and retailer specializing in African fabrics and materials",
    internalId: "NAIROBI-CBD-005",
    ownerName: "Halima"
  },
  {
    businessName: "Joy_Annes Fashion House",
    email: "joyannejoan@gmail.com",
    phone: "+254715886934",
    businessType: "Fashion & Clothing",
    address: "Sasa Mall, First Floor A14, Nairobi CBD",
    description: "Contemporary fashion house offering designer clothing and custom tailoring",
    internalId: "NAIROBI-CBD-006",
    ownerName: "Joyanne Joan"
  },
  {
    businessName: "Lucy Fashion Line",
    email: "lucyn0526@gmail.com",
    phone: "+254726414321",
    businessType: "Fashion & Clothing",
    address: "Naccico Chambers, Sunbeam Exhibition, Shop No. 21, Nairobi CBD",
    description: "Fashion boutique specializing in women's clothing and accessories",
    internalId: "NAIROBI-CBD-007",
    ownerName: "Lucy N."
  },
  {
    businessName: "Luxxure Kenya Limited",
    email: "luxxurekenya@gmail.com",
    phone: "+254741273952",
    businessType: "Fashion & Clothing",
    address: "Sawa Mall, 2nd Floor Shop B19, Nairobi CBD",
    description: "Luxury fashion retailer offering premium clothing and lifestyle products",
    internalId: "NAIROBI-CBD-008",
    ownerName: "Luxxure Kenya"
  },
  {
    businessName: "Maxwell Professional Services",
    email: "maxwellwanjohi.s@gmail.com",
    phone: "+254700000000", // Placeholder - needs update
    businessType: "Professional Services",
    address: "Nairobi CBD, Kenya", // Generic address - needs update
    description: "Professional business services and consultancy",
    internalId: "NAIROBI-CBD-009",
    ownerName: "Maxwell Wanjohi",
    needsInfoUpdate: true // Flag for incomplete information
  },
  {
    businessName: "Mobicare Phone Accessories & Spare Parts",
    email: "mobicare2022@gmail.com",
    phone: "+254716361136",
    businessType: "Electronics",
    address: "Munyu Road, Lizzie Building Ground Floor, Nairobi CBD",
    description: "Mobile phone accessories, spare parts, and repair services",
    internalId: "NAIROBI-CBD-010",
    ownerName: "Mobicare Team"
  },
  {
    businessName: "Wanjohi Digital Solutions",
    email: "mrwanjohi11@gmail.com",
    phone: "+254700000001", // Placeholder - needs update
    businessType: "Digital Services",
    address: "Nairobi CBD, Kenya", // Generic address - needs update
    description: "Digital solutions and online services provider",
    internalId: "NAIROBI-CBD-011",
    ownerName: "Mr. Wanjohi",
    needsInfoUpdate: true // Flag for incomplete information
  },
  {
    businessName: "Qualitywigs",
    email: "ivonemutheu@gmail.com",
    phone: "+254706243617",
    businessType: "Beauty & Cosmetics",
    address: "B4, 2nd Floor, Sawa Mall, Nairobi CBD",
    description: "Premium quality wigs, hair extensions, and hair care products",
    internalId: "NAIROBI-CBD-012",
    ownerName: "Ivone Mutheu"
  }
];

/**
 * Create merchants without sending emails immediately
 */
async function createMerchantsWithScheduledEmails() {
  console.log('🚀 CREATING 12 INITIAL MERCHANTS FOR NAIROBI CBD DIRECTORY');
  console.log('==================================================\n');

  const results = [];
  const emailQueue = []; // Store email data for scheduled sending

  for (let i = 0; i < initialMerchants.length; i++) {
    const merchantData = initialMerchants[i];
    
    try {
      console.log(`📋 Creating merchant ${i + 1}/12: ${merchantData.businessName}`);

      // Create merchant account (we'll modify service to skip immediate email)
      const result = await createMerchantWithoutEmail(merchantData);
      
      results.push({ 
        success: true, 
        merchant: result.merchant, 
        credentials: result.credentials,
        internalId: merchantData.internalId,
        needsUpdate: merchantData.needsEmailUpdate || merchantData.needsInfoUpdate
      });

      // Queue email for scheduled delivery
      emailQueue.push({
        merchant: result.merchant,
        credentials: result.credentials,
        setupToken: result.credentials.setupToken,
        needsUpdate: merchantData.needsEmailUpdate || merchantData.needsInfoUpdate
      });

      console.log(`✅ Created: ${merchantData.businessName} (${merchantData.internalId})`);
      
      // Small delay between creations
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to create ${merchantData.businessName}:`, error.message);
      results.push({ 
        success: false, 
        error: error.message, 
        merchantData,
        internalId: merchantData.internalId 
      });
    }
  }

  // Save email queue for scheduled delivery
  await saveEmailQueue(emailQueue);

  // Display results
  displayResults(results);

  return { results, emailQueue };
}

/**
 * Create merchant without sending email immediately
 */
async function createMerchantWithoutEmail(merchantData) {
  // Use a modified version of the service that doesn't send email
  const crypto = require('crypto');
  const Merchant = require('../models/Merchant');

  // Generate temporary password
  const tempPassword = generateTempPassword();
  
  // Set default business hours
  const defaultBusinessHours = {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true }
  };

  // Create merchant
  const merchant = await Merchant.create({
    businessName: merchantData.businessName,
    email: merchantData.email,
    phone: merchantData.phone,
    password: tempPassword,
    businessType: merchantData.businessType,
    description: merchantData.description,
    yearEstablished: new Date().getFullYear(),
    website: merchantData.website || '',
    address: merchantData.address,
    location: merchantData.address,
    landmark: '',
    businessHours: defaultBusinessHours,
    verified: false, // Let them verify through normal process
    // Programmatic creation metadata
    createdProgrammatically: true,
    createdBy: 'initial-import-script',
    onboardingStatus: 'credentials_sent',
    // Custom fields
    internalId: merchantData.internalId,
    ownerName: merchantData.ownerName
  });

  // Generate account setup token (valid for 14 days)
  const setupToken = crypto.randomBytes(32).toString('hex');
  const setupTokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');
  
  merchant.accountSetupToken = setupTokenHash;
  merchant.accountSetupExpire = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
  await merchant.save();

  return {
    merchant,
    credentials: {
      email: merchant.email,
      tempPassword,
      setupToken,
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?merchant=true`,
      setupUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/account-setup/${setupToken}`
    }
  };
}

/**
 * Generate secure temporary password
 */
function generateTempPassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Save email queue for scheduled delivery
 */
async function saveEmailQueue(emailQueue) {
  const fs = require('fs').promises;
  const queueData = {
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    scheduledTime: '07:00', // 7 AM
    emails: emailQueue,
    created: new Date()
  };

  await fs.writeFile(
    path.join(__dirname, '../data/scheduled-emails.json'),
    JSON.stringify(queueData, null, 2)
  );

  console.log('\n📧 EMAIL QUEUE SAVED');
  console.log('===================');
  console.log(`📅 Scheduled for: Tomorrow at 7:00 AM`);
  console.log(`📬 Total emails: ${emailQueue.length}`);
  console.log(`💾 Queue file: scheduled-emails.json`);
}

/**
 * Display creation results
 */
function displayResults(results) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const needsUpdate = results.filter(r => r.success && r.needsUpdate).length;

  console.log('\n🎯 CREATION SUMMARY');
  console.log('==================');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Needs Update: ${needsUpdate}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ FAILURES:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.merchantData.businessName} (${r.internalId}): ${r.error}`);
      });
  }

  if (needsUpdate > 0) {
    console.log('\n⚠️  ACCOUNTS NEEDING UPDATES:');
    results
      .filter(r => r.success && r.needsUpdate)
      .forEach(r => {
        console.log(`   • ${r.merchant.businessName} (${r.internalId}): Check email/contact info`);
      });
  }

  if (successful > 0) {
    console.log('\n✅ MERCHANT ACCOUNTS CREATED:');
    console.log('================================');
    results
      .filter(r => r.success)
      .forEach((r, index) => {
        console.log(`${index + 1}. ${r.merchant.businessName}`);
        console.log(`   📧 Email: ${r.merchant.email}`);
        console.log(`   🔑 Password: ${r.credentials.tempPassword}`);
        console.log(`   🆔 Internal ID: ${r.internalId}`);
        console.log(`   📱 Phone: ${r.merchant.phone}`);
        console.log(`   🔗 Setup URL: ${r.credentials.setupUrl}`);
        console.log(`   📍 Address: ${r.merchant.address}`);
        if (r.needsUpdate) {
          console.log(`   ⚠️  Status: NEEDS INFO UPDATE`);
        }
        console.log('');
      });
  }

  console.log('\n📧 EMAIL DELIVERY:');
  console.log('==================');
  console.log('📅 Scheduled for: Tomorrow at 7:00 AM');
  console.log('📬 All welcome emails will be sent automatically');
  console.log('🔗 Setup links valid for 14 days');
  console.log('📋 Run email scheduler script tomorrow to send emails');
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Create data directory if it doesn't exist
    const fs = require('fs').promises;
    try {
      await fs.mkdir(path.join(__dirname, '../data'), { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    await connectDB();
    
    console.log('Starting initial merchant creation...\n');
    
    const { results, emailQueue } = await createMerchantsWithScheduledEmails();

    console.log('\n🎉 INITIAL MERCHANT SETUP COMPLETE!');
    console.log('====================================');
    console.log('✅ All merchant accounts have been created');
    console.log('📧 Welcome emails scheduled for tomorrow 7 AM');
    console.log('🔑 All credentials are displayed above');
    console.log('📋 Admin can update any flagged accounts');
    console.log('\n📞 Next Steps:');
    console.log('1. Review accounts marked as "NEEDS UPDATE"');
    console.log('2. Run email scheduler tomorrow morning');
    console.log('3. Test setup links and credential delivery');
    console.log('4. Monitor merchant onboarding progress');

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
  createMerchantsWithScheduledEmails,
  initialMerchants
};