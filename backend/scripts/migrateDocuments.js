// backend/scripts/migrateDocuments.js
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
require('dotenv').config();

const migrateDocuments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all merchants
    const merchants = await Merchant.find({});
    console.log(`📊 Found ${merchants.length} merchants to check\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const merchant of merchants) {
      try {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`Checking: ${merchant.businessName}`);
        
        // Check if merchant has documents object
        if (!merchant.documents) {
          console.log('  ⚠️  No documents object - initializing...');
          merchant.documents = {
            businessRegistration: { path: '', uploadedAt: null },
            idDocument: { path: '', uploadedAt: null },
            utilityBill: { path: '', uploadedAt: null },
            additionalDocs: [],
            documentReviewStatus: 'pending'
          };
          await merchant.save();
          migrated++;
          console.log('  ✅ Initialized empty documents structure');
          continue;
        }

        let needsUpdate = false;
        const updates = [];

        // Check and fix businessRegistration
        if (merchant.documents.businessRegistration) {
          if (typeof merchant.documents.businessRegistration === 'string') {
            // Convert string to object
            console.log('  🔧 Converting businessRegistration from string to object');
            merchant.documents.businessRegistration = {
              path: merchant.documents.businessRegistration,
              uploadedAt: new Date(),
              originalName: 'business-registration',
              mimeType: 'application/pdf'
            };
            needsUpdate = true;
            updates.push('businessRegistration');
          } else if (merchant.documents.businessRegistration.path) {
            // Check if path exists and is valid
            console.log('  ✅ businessRegistration structure correct');
          }
        }

        // Check and fix idDocument
        if (merchant.documents.idDocument) {
          if (typeof merchant.documents.idDocument === 'string') {
            console.log('  🔧 Converting idDocument from string to object');
            merchant.documents.idDocument = {
              path: merchant.documents.idDocument,
              uploadedAt: new Date(),
              originalName: 'id-document',
              mimeType: 'application/pdf'
            };
            needsUpdate = true;
            updates.push('idDocument');
          } else if (merchant.documents.idDocument.path) {
            console.log('  ✅ idDocument structure correct');
          }
        }

        // Check and fix utilityBill
        if (merchant.documents.utilityBill) {
          if (typeof merchant.documents.utilityBill === 'string') {
            console.log('  🔧 Converting utilityBill from string to object');
            merchant.documents.utilityBill = {
              path: merchant.documents.utilityBill,
              uploadedAt: new Date(),
              originalName: 'utility-bill',
              mimeType: 'application/pdf'
            };
            needsUpdate = true;
            updates.push('utilityBill');
          } else if (merchant.documents.utilityBill.path) {
            console.log('  ✅ utilityBill structure correct');
          }
        }

        // Ensure additionalDocs is an array
        if (!Array.isArray(merchant.documents.additionalDocs)) {
          console.log('  🔧 Fixing additionalDocs structure');
          merchant.documents.additionalDocs = [];
          needsUpdate = true;
        }

        // Ensure documentReviewStatus exists
        if (!merchant.documents.documentReviewStatus) {
          console.log('  🔧 Adding documentReviewStatus');
          merchant.documents.documentReviewStatus = 'pending';
          needsUpdate = true;
        }

        if (needsUpdate) {
          await merchant.save();
          migrated++;
          console.log(`  ✅ Updated: ${updates.join(', ')}`);
        } else {
          skipped++;
          console.log('  ⏭️  No changes needed');
        }

      } catch (error) {
        errors++;
        console.error(`  ❌ Error processing ${merchant.businessName}:`, error.message);
      }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total merchants: ${merchants.length}`);
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped (already correct): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const withDocs = await Merchant.countDocuments({
      $or: [
        { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
        { 'documents.idDocument.path': { $exists: true, $ne: '' } },
        { 'documents.utilityBill.path': { $exists: true, $ne: '' } }
      ]
    });

    console.log(`\n📈 Merchants with documents: ${withDocs}`);

    const complete = await Merchant.countDocuments({
      'documents.businessRegistration.path': { $exists: true, $ne: '' },
      'documents.idDocument.path': { $exists: true, $ne: '' },
      'documents.utilityBill.path': { $exists: true, $ne: '' }
    });

    console.log(`📋 Merchants with complete documents: ${complete}`);

    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run migration
migrateDocuments();