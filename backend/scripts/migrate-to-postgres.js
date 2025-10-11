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

async function migrateData() {
  try {
    console.log('Starting data migration from MongoDB to PostgreSQL...');

    // Test PostgreSQL connection
    await testConnection();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sync PostgreSQL tables
    await sequelize.sync({ force: false });
    console.log('PostgreSQL tables synced');

    // Migrate Users
    console.log('Migrating Users...');
    const mongoUsers = await User.find({});
    for (const user of mongoUsers) {
      try {
        await UserPG.create({
          id: user._id.toString(),
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Unknown',
          email: user.email,
          phone: user.phone,
          password: user.password,
          address: {
            street: user.address?.street,
            city: user.address?.city,
            state: user.address?.state,
            zipCode: user.address?.zipCode,
            country: user.address?.country
          },
          isVerified: user.isEmailVerified || user.isVerified || false,
          verificationToken: user.emailVerificationToken,
          verificationTokenExpires: user.emailVerificationExpires,
          passwordResetToken: user.resetPasswordToken,
          passwordResetExpires: user.resetPasswordExpire
        });
      } catch (error) {
        console.log(`Error migrating user ${user.email}:`, error.message);
      }
    }
    console.log(`Migrated ${mongoUsers.length} users`);

    // Migrate AdminUsers
    console.log('Migrating Admin Users...');
    const mongoAdmins = await AdminUser.find({});
    for (const admin of mongoAdmins) {
      try {
        await AdminUserPG.create({
          id: admin._id.toString(),
          username: admin.username,
          email: admin.email,
          password: admin.password,
          role: admin.role,
          permissions: admin.permissions || [],
          isActive: admin.isActive !== false,
          lastLogin: admin.lastLogin
        });
      } catch (error) {
        console.log(`Error migrating admin ${admin.email}:`, error.message);
      }
    }
    console.log(`Migrated ${mongoAdmins.length} admin users`);

    // Migrate Merchants
    console.log('Migrating Merchants...');
    const mongoMerchants = await Merchant.find({});
    for (const merchant of mongoMerchants) {
      try {
        await MerchantPG.create({
          id: merchant._id.toString(),
          businessName: merchant.businessName,
          ownerName: merchant.ownerName,
          email: merchant.email,
          phone: merchant.phone,
          password: merchant.password,
          businessRegistrationNumber: merchant.businessRegistrationNumber,
          businessAddress: merchant.businessAddress,
          businessDescription: merchant.businessDescription,
          businessCategory: merchant.businessCategory,
          website: merchant.website,
          socialMedia: merchant.socialMedia,
          operatingHours: merchant.operatingHours,
          deliveryAreas: merchant.deliveryAreas,
          minimumOrderAmount: merchant.minimumOrderAmount || 0,
          deliveryFee: merchant.deliveryFee || 0,
          status: merchant.status || 'pending',
          verificationStatus: merchant.verificationStatus || 'pending',
          rejectionReason: merchant.rejectionReason,
          adminNotes: merchant.adminNotes,
          isActive: merchant.isActive !== false,
          isFeatured: merchant.isFeatured || false,
          rating: merchant.rating || 0,
          totalOrders: merchant.totalOrders || 0,
          totalRevenue: merchant.totalRevenue || 0,
          commissionRate: merchant.commissionRate || 10.00,
          profileImage: merchant.profileImage,
          bannerImage: merchant.bannerImage,
          paymentMethods: merchant.paymentMethods,
          shippingMethods: merchant.shippingMethods,
          returnPolicy: merchant.returnPolicy,
          termsConditions: merchant.termsConditions,
          passwordResetToken: merchant.passwordResetToken,
          passwordResetExpires: merchant.passwordResetExpires,
          emailVerificationToken: merchant.emailVerificationToken,
          emailVerificationExpires: merchant.emailVerificationExpires,
          isEmailVerified: merchant.isEmailVerified || false,
          lastLogin: merchant.lastLogin
        });

        // Migrate documents for this merchant
        if (merchant.businessLicense || merchant.taxCertificate || merchant.businessPermit || 
            merchant.idDocument || merchant.bankStatement) {
          
          const documents = [];
          if (merchant.businessLicense) {
            documents.push({
              merchantId: merchant._id.toString(),
              documentType: 'business_license',
              documentName: 'Business License',
              originalFilename: 'business_license.pdf',
              filePath: merchant.businessLicense,
              fileData: null, // We'll need to handle file conversion separately
              status: 'pending'
            });
          }
          if (merchant.taxCertificate) {
            documents.push({
              merchantId: merchant._id.toString(),
              documentType: 'tax_certificate',
              documentName: 'Tax Certificate',
              originalFilename: 'tax_certificate.pdf',
              filePath: merchant.taxCertificate,
              fileData: null,
              status: 'pending'
            });
          }
          if (merchant.businessPermit) {
            documents.push({
              merchantId: merchant._id.toString(),
              documentType: 'business_permit',
              documentName: 'Business Permit',
              originalFilename: 'business_permit.pdf',
              filePath: merchant.businessPermit,
              fileData: null,
              status: 'pending'
            });
          }
          if (merchant.idDocument) {
            documents.push({
              merchantId: merchant._id.toString(),
              documentType: 'id_document',
              documentName: 'ID Document',
              originalFilename: 'id_document.pdf',
              filePath: merchant.idDocument,
              fileData: null,
              status: 'pending'
            });
          }
          if (merchant.bankStatement) {
            documents.push({
              merchantId: merchant._id.toString(),
              documentType: 'bank_statement',
              documentName: 'Bank Statement',
              originalFilename: 'bank_statement.pdf',
              filePath: merchant.bankStatement,
              fileData: null,
              status: 'pending'
            });
          }

          for (const doc of documents) {
            try {
              await DocumentPG.create(doc);
            } catch (error) {
              console.log(`Error migrating document for merchant ${merchant.email}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.log(`Error migrating merchant ${merchant.email}:`, error.message);
      }
    }
    console.log(`Migrated ${mongoMerchants.length} merchants`);

    // Migrate Products
    console.log('Migrating Products...');
    const mongoProducts = await Product.find({});
    for (const product of mongoProducts) {
      try {
        await ProductPG.create({
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          costPrice: product.costPrice,
          sku: product.sku,
          barcode: product.barcode,
          trackInventory: product.trackInventory || false,
          inventoryQuantity: product.inventoryQuantity || 0,
          lowStockThreshold: product.lowStockThreshold || 5,
          weight: product.weight,
          dimensions: product.dimensions,
          category: product.category,
          subcategory: product.subcategory,
          tags: product.tags,
          images: product.images,
          thumbnail: product.thumbnail,
          merchantId: product.merchant?.toString() || product.merchantId?.toString(),
          status: product.status || 'active',
          isFeatured: product.isFeatured || false,
          isDigital: product.isDigital || false,
          requiresShipping: product.requiresShipping !== false,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          metaKeywords: product.metaKeywords,
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          salesCount: product.salesCount || 0,
          viewCount: product.viewCount || 0,
          variants: product.variants,
          attributes: product.attributes,
          shippingInfo: product.shippingInfo
        });
      } catch (error) {
        console.log(`Error migrating product ${product.name}:`, error.message);
      }
    }
    console.log(`Migrated ${mongoProducts.length} products`);

    // Migrate Orders
    console.log('Migrating Orders...');
    const mongoOrders = await Order.find({});
    for (const order of mongoOrders) {
      try {
        await OrderPG.create({
          id: order._id.toString(),
          orderNumber: order.orderNumber || `ORD-${order._id.toString().substr(-8)}`,
          userId: order.user?.toString() || order.userId?.toString(),
          merchantId: order.merchant?.toString() || order.merchantId?.toString(),
          status: order.status || 'pending',
          paymentStatus: order.paymentStatus || 'pending',
          fulfillmentStatus: order.fulfillmentStatus || 'unfulfilled',
          subtotal: order.subtotal,
          taxAmount: order.taxAmount || 0,
          shippingAmount: order.shippingAmount || 0,
          discountAmount: order.discountAmount || 0,
          totalAmount: order.totalAmount,
          currency: order.currency || 'KES',
          paymentMethod: order.paymentMethod,
          paymentReference: order.paymentReference,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          deliveryInstructions: order.deliveryInstructions,
          estimatedDeliveryDate: order.estimatedDeliveryDate,
          deliveredAt: order.deliveredAt,
          cancelledAt: order.cancelledAt,
          cancellationReason: order.cancellationReason,
          refundAmount: order.refundAmount || 0,
          refundStatus: order.refundStatus,
          refundReason: order.refundReason,
          notes: order.notes,
          trackingNumber: order.trackingNumber,
          courierService: order.courierService
        });
      } catch (error) {
        console.log(`Error migrating order ${order.orderNumber}:`, error.message);
      }
    }
    console.log(`Migrated ${mongoOrders.length} orders`);

    console.log('Data migration completed successfully!');
    
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
  migrateData();
}

module.exports = migrateData;