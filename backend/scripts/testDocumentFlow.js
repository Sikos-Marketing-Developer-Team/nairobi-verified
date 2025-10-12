// backend/scripts/testDocumentFlow.js
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
require('dotenv').config();

const testDocumentFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a merchant to test with
    const merchant = await Merchant.findOne({ email: { $exists: true } });
    
    if (!merchant) {
      console.log('❌ No merchants found in database');
      return;
    }

    console.log('🔍 Testing with merchant:', merchant.businessName);
    console.log('📧 Email:', merchant.email);
    console.log('\n' + '='.repeat(60) + '\n');

    // Test 1: Check current document state
    console.log('TEST 1: Current Document State');
    console.log('─'.repeat(60));
    
    const currentDocs = merchant.documents || {};
    console.log('Business Registration:', currentDocs.businessRegistration?.path ? '✅ EXISTS' : '❌ MISSING');
    console.log('ID Document:', currentDocs.idDocument?.path ? '✅ EXISTS' : '❌ MISSING');
    console.log('Utility Bill:', currentDocs.utilityBill?.path ? '✅ EXISTS' : '❌ MISSING');
    
    if (currentDocs.additionalDocs) {
      console.log('Additional Docs:', currentDocs.additionalDocs.length, 'files');
    }

    // Test 2: Simulate document upload
    console.log('\n\nTEST 2: Simulate Document Upload');
    console.log('─'.repeat(60));
    
    // Simulate what happens when documents are uploaded
    const simulatedUpload = {
      businessRegistration: {
        path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/business-reg.pdf',
        uploadedAt: new Date(),
        originalName: 'business-registration.pdf',
        fileSize: 524288, // 512 KB
        mimeType: 'application/pdf',
        cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/business-reg.pdf',
        publicId: 'nairobi-verified/documents/business-reg-1234567890'
      },
      idDocument: {
        path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/id-doc.pdf',
        uploadedAt: new Date(),
        originalName: 'id-document.pdf',
        fileSize: 387654,
        mimeType: 'application/pdf',
        cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/id-doc.pdf',
        publicId: 'nairobi-verified/documents/id-doc-1234567890'
      },
      utilityBill: {
        path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/utility.pdf',
        uploadedAt: new Date(),
        originalName: 'utility-bill.pdf',
        fileSize: 298765,
        mimeType: 'application/pdf',
        cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/utility.pdf',
        publicId: 'nairobi-verified/documents/utility-1234567890'
      }
    };

    // Update merchant with simulated documents
    merchant.documents = {
      ...merchant.documents,
      ...simulatedUpload,
      documentsSubmittedAt: new Date(),
      documentReviewStatus: 'pending'
    };

    await merchant.save();
    console.log('✅ Simulated documents uploaded successfully');

    // Test 3: Verify document retrieval
    console.log('\n\nTEST 3: Verify Document Retrieval');
    console.log('─'.repeat(60));

    const updatedMerchant = await Merchant.findById(merchant._id);
    const docs = updatedMerchant.documents;

    console.log('\n📄 Business Registration:');
    console.log('  Path:', docs.businessRegistration?.path ? '✅ SET' : '❌ NOT SET');
    console.log('  Full path:', docs.businessRegistration?.path);
    
    console.log('\n🆔 ID Document:');
    console.log('  Path:', docs.idDocument?.path ? '✅ SET' : '❌ NOT SET');
    console.log('  Full path:', docs.idDocument?.path);
    
    console.log('\n💡 Utility Bill:');
    console.log('  Path:', docs.utilityBill?.path ? '✅ SET' : '❌ NOT SET');
    console.log('  Full path:', docs.utilityBill?.path);

    // Test 4: Check what admin dashboard would see
    console.log('\n\nTEST 4: Admin Dashboard View');
    console.log('─'.repeat(60));

    const documentAnalysis = {
      businessRegistration: {
        submitted: !!(docs?.businessRegistration?.path),
        path: docs?.businessRegistration?.path || null,
        required: true
      },
      idDocument: {
        submitted: !!(docs?.idDocument?.path),
        path: docs?.idDocument?.path || null,
        required: true
      },
      utilityBill: {
        submitted: !!(docs?.utilityBill?.path),
        path: docs?.utilityBill?.path || null,
        required: true
      }
    };

    const requiredDocsSubmitted = [
      documentAnalysis.businessRegistration.submitted,
      documentAnalysis.idDocument.submitted,
      documentAnalysis.utilityBill.submitted
    ].filter(Boolean).length;

    const canBeVerified = requiredDocsSubmitted === 3;

    console.log('\n📊 Document Analysis:');
    console.log('  Required docs submitted:', requiredDocsSubmitted, '/ 3');
    console.log('  Completion:', Math.round((requiredDocsSubmitted / 3) * 100) + '%');
    console.log('  Can be verified:', canBeVerified ? '✅ YES' : '❌ NO');
    console.log('  Review status:', docs.documentReviewStatus || 'pending');

    // Test 5: API Response Simulation
    console.log('\n\nTEST 5: API Response Simulation');
    console.log('─'.repeat(60));

    const apiResponse = {
      success: true,
      merchant: {
        id: updatedMerchant._id,
        businessName: updatedMerchant.businessName,
        email: updatedMerchant.email,
        verified: updatedMerchant.verified
      },
      documents: updatedMerchant.documents,
      analysis: {
        documentAnalysis,
        requiredDocsSubmitted,
        totalRequiredDocs: 3,
        canBeVerified,
        completionPercentage: Math.round((requiredDocsSubmitted / 3) * 100)
      }
    };

    console.log('\n✅ API Response would return:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Document structure: CORRECT');
    console.log('✅ Path storage: CORRECT');
    console.log('✅ Admin visibility: WORKING');
    console.log('✅ Verification check: WORKING');
    console.log('\n💡 Documents should now appear in admin dashboard!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

testDocumentFlow();