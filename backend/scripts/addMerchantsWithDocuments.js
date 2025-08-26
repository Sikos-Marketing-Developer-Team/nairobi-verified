const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Merchant = require('../models/Merchant');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const sampleMerchantsWithDocuments = [
  {
    businessName: 'Nairobi Tech Solutions',
    email: 'info@naitech.co.ke',
    phone: '+254701234567',
    password: 'tempPassword123',
    businessType: 'Technology',
    description: 'Leading provider of IT solutions and software development services in Nairobi CBD',
    yearEstablished: 2018,
    website: 'https://naitech.co.ke',
    address: 'Kenyatta Avenue, Nairobi CBD',
    location: 'Nairobi CBD',
    landmark: 'Near KICC',
    businessHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    documents: {
      businessRegistration: {
        path: 'documents/sample-business-registration.pdf',
        uploadedAt: new Date(),
        originalName: 'Business Registration Certificate.pdf',
        fileSize: 245760,
        mimeType: 'application/pdf'
      },
      idDocument: {
        path: 'documents/sample-id-document.pdf',
        uploadedAt: new Date(),
        originalName: 'National ID.pdf',
        fileSize: 189440,
        mimeType: 'application/pdf'
      },
      utilityBill: {
        path: 'documents/sample-utility-bill.pdf',
        uploadedAt: new Date(),
        originalName: 'Electricity Bill - March 2024.pdf',
        fileSize: 156780,
        mimeType: 'application/pdf'
      },
      additionalDocs: [
        {
          path: 'documents/sample-business-permit.pdf',
          uploadedAt: new Date(),
          originalName: 'Business Permit.pdf',
          fileSize: 198320,
          mimeType: 'application/pdf',
          description: 'County business operating permit'
        }
      ],
      documentsSubmittedAt: new Date(),
      documentReviewStatus: 'pending'
    },
    verified: false,
    onboardingStatus: 'documents_submitted'
  },
  {
    businessName: 'CBD Fashion Hub',
    email: 'contact@cbdfashion.co.ke',
    phone: '+254702345678',
    password: 'tempPassword123',
    businessType: 'Fashion',
    description: 'Premium fashion boutique offering the latest trends and designer collections',
    yearEstablished: 2020,
    website: 'https://cbdfashion.co.ke',
    address: 'Moi Avenue, Nairobi CBD',
    location: 'Nairobi CBD',
    landmark: 'Opposite Nation Centre',
    businessHours: {
      monday: { open: '09:00', close: '19:00', closed: false },
      tuesday: { open: '09:00', close: '19:00', closed: false },
      wednesday: { open: '09:00', close: '19:00', closed: false },
      thursday: { open: '09:00', close: '19:00', closed: false },
      friday: { open: '09:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '20:00', closed: false },
      sunday: { open: '12:00', close: '18:00', closed: false }
    },
    documents: {
      businessRegistration: {
        path: 'documents/sample-fashion-registration.pdf',
        uploadedAt: new Date(),
        originalName: 'Fashion Hub Registration.pdf',
        fileSize: 267890,
        mimeType: 'application/pdf'
      },
      idDocument: {
        path: 'documents/sample-owner-id.pdf',
        uploadedAt: new Date(),
        originalName: 'Owner ID Document.pdf',
        fileSize: 178650,
        mimeType: 'application/pdf'
      },
      utilityBill: {
        path: 'documents/sample-shop-utility.pdf',
        uploadedAt: new Date(),
        originalName: 'Shop Electricity Bill.pdf',
        fileSize: 167340,
        mimeType: 'application/pdf'
      },
      documentsSubmittedAt: new Date(),
      documentReviewStatus: 'under_review'
    },
    verified: false,
    onboardingStatus: 'documents_submitted'
  },
  {
    businessName: 'Green Valley Restaurant',
    email: 'orders@greenvalley.co.ke',
    phone: '+254703456789',
    password: 'tempPassword123',
    businessType: 'Restaurant',
    description: 'Authentic Kenyan cuisine with a modern twist, located in the heart of Nairobi CBD',
    yearEstablished: 2019,
    address: 'Tom Mboya Street, Nairobi CBD',
    location: 'Nairobi CBD',
    landmark: 'Near Stanley Hotel',
    businessHours: {
      monday: { open: '07:00', close: '22:00', closed: false },
      tuesday: { open: '07:00', close: '22:00', closed: false },
      wednesday: { open: '07:00', close: '22:00', closed: false },
      thursday: { open: '07:00', close: '22:00', closed: false },
      friday: { open: '07:00', close: '23:00', closed: false },
      saturday: { open: '08:00', close: '23:00', closed: false },
      sunday: { open: '08:00', close: '21:00', closed: false }
    },
    documents: {
      businessRegistration: {
        path: 'documents/sample-restaurant-registration.pdf',
        uploadedAt: new Date(),
        originalName: 'Restaurant Business License.pdf',
        fileSize: 234560,
        mimeType: 'application/pdf'
      },
      // Missing some documents to show incomplete status
      documentsSubmittedAt: new Date(),
      documentReviewStatus: 'incomplete'
    },
    verified: false,
    onboardingStatus: 'documents_pending'
  }
];

async function createSampleDocuments() {
  const fs = require('fs');
  const path = require('path');
  
  // Create uploads/documents directory if it doesn't exist
  const documentsDir = path.join(__dirname, '..', 'uploads', 'documents');
  
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
    console.log('📁 Created documents directory');
  }
  
  // Create sample PDF files (placeholder content)
  const samplePdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Sample Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000211 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
304
%%EOF`;

  const sampleFiles = [
    'sample-business-registration.pdf',
    'sample-id-document.pdf',
    'sample-utility-bill.pdf',
    'sample-business-permit.pdf',
    'sample-fashion-registration.pdf',
    'sample-owner-id.pdf',
    'sample-shop-utility.pdf',
    'sample-restaurant-registration.pdf'
  ];
  
  for (const fileName of sampleFiles) {
    const filePath = path.join(documentsDir, fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, samplePdfContent);
      console.log(`📄 Created sample file: ${fileName}`);
    }
  }
}

async function addMerchantsWithDocuments() {
  try {
    await connectDB();
    
    console.log('🗑️ Cleaning existing sample merchants...');
    
    // Remove existing sample merchants
    const sampleEmails = sampleMerchantsWithDocuments.map(m => m.email);
    await Merchant.deleteMany({ email: { $in: sampleEmails } });
    
    console.log('📄 Creating sample document files...');
    await createSampleDocuments();
    
    console.log('🏢 Adding merchants with documents...');
    
    for (const merchantData of sampleMerchantsWithDocuments) {
      try {
        const merchant = await Merchant.create(merchantData);
        console.log(`✅ Created merchant: ${merchant.businessName} (${merchant.email})`);
        console.log(`   Documents: ${Object.keys(merchant.documents || {}).filter(key => 
          key !== 'documentsSubmittedAt' && 
          key !== 'documentReviewStatus' && 
          merchant.documents[key]
        ).join(', ')}`);
      } catch (error) {
        console.error(`❌ Failed to create merchant ${merchantData.businessName}:`, error.message);
      }
    }
    
    console.log('\n📊 Summary:');
    const totalMerchants = await Merchant.countDocuments();
    const merchantsWithDocs = await Merchant.countDocuments({
      $or: [
        { 'documents.businessRegistration.path': { $exists: true } },
        { 'documents.idDocument.path': { $exists: true } },
        { 'documents.utilityBill.path': { $exists: true } }
      ]
    });
    
    console.log(`Total merchants: ${totalMerchants}`);
    console.log(`Merchants with documents: ${merchantsWithDocs}`);
    console.log('\n🎉 Sample merchants with documents added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  addMerchantsWithDocuments();
}

module.exports = { addMerchantsWithDocuments, sampleMerchantsWithDocuments };
