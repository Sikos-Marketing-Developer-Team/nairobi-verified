require('dotenv').config();
const mongoose = require('mongoose');
const { sequelize, UserPG, MerchantPG, ProductPG, OrderPG, AdminUserPG, DocumentPG } = require('../models/indexPG');
const { testConnection } = require('../config/postgres');

// Import MongoDB models
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AdminUser = require('../models/AdminUser');

async function migrateDataSimple() {
  try {
    console.log('Starting simple data migration from MongoDB to PostgreSQL...');

    // Test PostgreSQL connection
    await testConnection();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sync PostgreSQL tables
    await sequelize.sync({ force: false });
    console.log('PostgreSQL tables synced');

    // Create some sample data for testing
    console.log('Creating sample data for testing...');

    // Create admin user
    try {
      const admin = await AdminUserPG.create({
        username: 'admin',
        email: 'admin@nairobiverified.com',
        password: 'admin123456',
        role: 'super_admin',
        permissions: ['all'],
        isActive: true
      });
      console.log('Created admin user:', admin.email);
    } catch (error) {
      console.log('Error creating admin user:', error.message);
    }

    // Create sample user
    try {
      const user = await UserPG.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+254700000000',
        password: 'password123',
        address: {
          street: '123 Nairobi Street',
          city: 'Nairobi',
          state: 'Nairobi',
          country: 'Kenya'
        },
        isVerified: true
      });
      console.log('Created sample user:', user.email);
    } catch (error) {
      console.log('Error creating sample user:', error.message);
    }

    // Create sample merchant
    try {
      const merchant = await MerchantPG.create({
        businessName: 'Tech Solutions Ltd',
        ownerName: 'Jane Smith',
        email: 'info@techsolutions.co.ke',
        phone: '+254700000001',
        password: 'merchant123',
        businessRegistrationNumber: 'REG123456',
        businessAddress: {
          street: '456 Business Avenue',
          city: 'Nairobi',
          state: 'Nairobi',
          country: 'Kenya'
        },
        businessDescription: 'Leading provider of technology solutions',
        businessCategory: 'Technology',
        status: 'approved',
        verificationStatus: 'verified',
        isActive: true,
        isEmailVerified: true
      });
      console.log('Created sample merchant:', merchant.email);

      // Create sample documents for the merchant
      const documents = [
        {
          merchantId: merchant.id,
          documentType: 'business_license',
          documentName: 'Business License',
          originalFilename: 'business_license.pdf',
          filePath: '/uploads/documents/business_license.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          status: 'approved',
          uploadedBy: merchant.id
        },
        {
          merchantId: merchant.id,
          documentType: 'tax_certificate',
          documentName: 'Tax Certificate',
          originalFilename: 'tax_certificate.pdf',
          filePath: '/uploads/documents/tax_certificate.pdf',
          fileSize: 512000,
          mimeType: 'application/pdf',
          status: 'approved',
          uploadedBy: merchant.id
        }
      ];

      for (const doc of documents) {
        try {
          await DocumentPG.create(doc);
          console.log(`Created document: ${doc.documentName}`);
        } catch (error) {
          console.log(`Error creating document ${doc.documentName}:`, error.message);
        }
      }

      // Create sample product
      try {
        const product = await ProductPG.create({
          name: 'MacBook Pro 14-inch',
          description: 'Latest MacBook Pro with M3 chip',
          price: 299999.00,
          comparePrice: 349999.00,
          sku: 'MBP14-001',
          category: 'Electronics',
          subcategory: 'Laptops',
          tags: ['laptop', 'apple', 'macbook'],
          images: ['/uploads/products/macbook1.jpg', '/uploads/products/macbook2.jpg'],
          thumbnail: '/uploads/products/macbook_thumb.jpg',
          merchantId: merchant.id,
          status: 'active',
          inventoryQuantity: 10,
          trackInventory: true
        });
        console.log('Created sample product:', product.name);
      } catch (error) {
        console.log('Error creating sample product:', error.message);
      }
    } catch (error) {
      console.log('Error creating sample merchant:', error.message);
    }

    console.log('Sample data creation completed successfully!');
    
    // Close connections
    await mongoose.disconnect();
    await sequelize.close();

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDataSimple();
}

module.exports = migrateDataSimple;