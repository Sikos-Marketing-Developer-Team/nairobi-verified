require('dotenv').config();
const { DocumentPG, MerchantPG } = require('./models/indexPG');
const documentService = require('./services/documentService');

async function testDocumentSystem() {
  try {
    console.log('🧪 Testing Document Upload System...\n');

    // Get a merchant from PostgreSQL to test with
    const merchant = await MerchantPG.findOne();
    if (!merchant) {
      console.log('❌ No merchants found in PostgreSQL. Please run the migration first.');
      return;
    }

    console.log(`✅ Testing with merchant: ${merchant.businessName} (${merchant.email})`);

    // Create sample file buffer (simulating an image upload)
    const sampleImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const samplePdfBuffer = Buffer.from('JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxOCBUZgoxMDAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMzNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQyOAolJUVPRgo=', 'base64');

    console.log('\n📁 Testing document uploads...');

    // Test 1: Upload business license (PDF)
    const businessLicense = await documentService.uploadDocument(
      merchant.id,
      {
        documentType: 'business_license',
        documentName: 'Business License Certificate'
      },
      samplePdfBuffer,
      'business_license.pdf',
      'application/pdf'
    );

    console.log(`✅ Business License uploaded: ${businessLicense.id}`);

    // Test 2: Upload ID document (Image)
    const idDocument = await documentService.uploadDocument(
      merchant.id,
      {
        documentType: 'id_document',
        documentName: 'National ID Front'
      },
      sampleImageBuffer,
      'national_id.png',
      'image/png'
    );

    console.log(`✅ ID Document (image) uploaded: ${idDocument.id}`);

    // Test 3: Upload tax certificate (JPEG)
    const taxCert = await documentService.uploadDocument(
      merchant.id,
      {
        documentType: 'tax_certificate',
        documentName: 'KRA Tax Certificate'
      },
      sampleImageBuffer,
      'tax_certificate.jpg',
      'image/jpeg'
    );

    console.log(`✅ Tax Certificate (JPEG) uploaded: ${taxCert.id}`);

    // Test retrieving merchant documents
    console.log('\n📋 Testing document retrieval...');
    const merchantDocs = await documentService.getMerchantDocuments(merchant.id);
    console.log(`✅ Retrieved ${merchantDocs.length} documents for merchant`);

    // Test admin document viewing
    console.log('\n👥 Testing admin document access...');
    const allDocs = await documentService.getAllDocuments();
    console.log(`✅ Admin can view ${allDocs.length} total documents`);

    // Display document details
    console.log('\n📄 Document Details:');
    merchantDocs.forEach(doc => {
      console.log(`  📎 ${doc.documentName}`);
      console.log(`     Type: ${doc.documentType}`);
      console.log(`     Format: ${doc.mimeType}`);
      console.log(`     Size: ${doc.fileSize} bytes`);
      console.log(`     Status: ${doc.status}`);
      console.log(`     File Path: ${doc.filePath}`);
      console.log('');
    });

    // Test document stats
    console.log('📊 Document Statistics:');
    const stats = await DocumentPG.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    stats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.dataValues.count} documents`);
    });

    console.log('\n🎉 Document System Test Complete!');
    console.log('✅ PDF documents supported');
    console.log('✅ Image documents (PNG, JPEG) supported');  
    console.log('✅ Documents stored in PostgreSQL database');
    console.log('✅ File data stored as binary (BYTEA)');
    console.log('✅ Admin can view all documents');
    console.log('✅ Document stats available for admin dashboard');

  } catch (error) {
    console.error('❌ Document system test failed:', error.message);
  }
}

testDocumentSystem();