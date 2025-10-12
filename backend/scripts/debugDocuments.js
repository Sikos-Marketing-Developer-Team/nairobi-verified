// backend/scripts/debugDocuments.js
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
require('dotenv').config();

const debugDocuments = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all merchants with documents
    const merchants = await Merchant.find({
      $or: [
        { 'documents.businessRegistration.path': { $exists: true } },
        { 'documents.idDocument.path': { $exists: true } },
        { 'documents.utilityBill.path': { $exists: true } }
      ]
    }).select('businessName email documents verified');

    console.log(`\n📊 Found ${merchants.length} merchant(s) with documents\n`);

    merchants.forEach((merchant, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Merchant ${index + 1}: ${merchant.businessName}`);
      console.log(`Email: ${merchant.email}`);
      console.log(`Verified: ${merchant.verified}`);
      console.log(`${'='.repeat(60)}`);
      
      const docs = merchant.documents;
      
      // Business Registration
      console.log('\n📄 Business Registration:');
      if (docs?.businessRegistration?.path) {
        console.log(`  ✅ Uploaded: ${docs.businessRegistration.path}`);
        console.log(`  📅 Date: ${docs.businessRegistration.uploadedAt || 'Unknown'}`);
        console.log(`  📎 Original: ${docs.businessRegistration.originalName || 'N/A'}`);
        console.log(`  💾 Size: ${docs.businessRegistration.fileSize ? `${(docs.businessRegistration.fileSize / 1024).toFixed(2)} KB` : 'N/A'}`);
      } else {
        console.log('  ❌ NOT UPLOADED');
      }
      
      // ID Document
      console.log('\n🆔 ID Document:');
      if (docs?.idDocument?.path) {
        console.log(`  ✅ Uploaded: ${docs.idDocument.path}`);
        console.log(`  📅 Date: ${docs.idDocument.uploadedAt || 'Unknown'}`);
        console.log(`  📎 Original: ${docs.idDocument.originalName || 'N/A'}`);
        console.log(`  💾 Size: ${docs.idDocument.fileSize ? `${(docs.idDocument.fileSize / 1024).toFixed(2)} KB` : 'N/A'}`);
      } else {
        console.log('  ❌ NOT UPLOADED');
      }
      
      // Utility Bill
      console.log('\n💡 Utility Bill:');
      if (docs?.utilityBill?.path) {
        console.log(`  ✅ Uploaded: ${docs.utilityBill.path}`);
        console.log(`  📅 Date: ${docs.utilityBill.uploadedAt || 'Unknown'}`);
        console.log(`  📎 Original: ${docs.utilityBill.originalName || 'N/A'}`);
        console.log(`  💾 Size: ${docs.utilityBill.fileSize ? `${(docs.utilityBill.fileSize / 1024).toFixed(2)} KB` : 'N/A'}`);
      } else {
        console.log('  ❌ NOT UPLOADED');
      }
      
      // Additional Documents
      if (docs?.additionalDocs && docs.additionalDocs.length > 0) {
        console.log(`\n📎 Additional Documents (${docs.additionalDocs.length}):`);
        docs.additionalDocs.forEach((doc, i) => {
          console.log(`  ${i + 1}. ${doc.originalName || doc.path}`);
        });
      }
      
      // Summary
      const hasBusinessReg = !!(docs?.businessRegistration?.path);
      const hasIdDoc = !!(docs?.idDocument?.path);
      const hasUtilityBill = !!(docs?.utilityBill?.path);
      const completionCount = [hasBusinessReg, hasIdDoc, hasUtilityBill].filter(Boolean).length;
      
      console.log(`\n📈 Document Completion: ${completionCount}/3 (${Math.round((completionCount/3)*100)}%)`);
      console.log(`📋 Review Status: ${docs?.documentReviewStatus || 'pending'}`);
      console.log(`📅 Submitted At: ${docs?.documentsSubmittedAt || 'Not submitted'}`);
      console.log(`🆔 Merchant ID: ${merchant._id}`);
    });

    console.log(`\n${'='.repeat(60)}\n`);

    // Summary statistics
    const totalMerchants = await Merchant.countDocuments();
    const withDocs = merchants.length;
    const verified = merchants.filter(m => m.verified).length;
    
    console.log('📊 SUMMARY STATISTICS:');
    console.log(`Total Merchants: ${totalMerchants}`);
    console.log(`With Documents: ${withDocs}`);
    console.log(`Verified: ${verified}`);
    console.log(`Pending Verification: ${withDocs - verified}`);

    // Show merchants without documents
    const withoutDocs = totalMerchants - withDocs;
    if (withoutDocs > 0) {
      console.log(`\n⚠️  Merchants without documents: ${withoutDocs}`);
      
      const merchantsWithoutDocs = await Merchant.find({
        $and: [
          { 'documents.businessRegistration.path': { $exists: false } },
          { 'documents.idDocument.path': { $exists: false } },
          { 'documents.utilityBill.path': { $exists: false } }
        ]
      }).select('businessName email').limit(5);
      
      console.log('\nFirst 5 merchants without documents:');
      merchantsWithoutDocs.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.businessName} (${m.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

debugDocuments();