require('dotenv').config();
const mongoose = require('mongoose');
const { sequelize, UserPG, MerchantPG, ProductPG, OrderPG, AdminUserPG, DocumentPG } = require('../models/indexPG');
const { testConnection } = require('../config/postgres');

// Import MongoDB models
const User = require('./models/User');
const Merchant = require('./models/Merchant');
const Product = require('./models/Product');
const Order = require('./models/Order');
const AdminUser = require('./models/AdminUser');

async function fullMigration() {
  try {
    console.log('🚀 Starting FULL migration from MongoDB to PostgreSQL...');

    // Test PostgreSQL connection
    await testConnection();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear PostgreSQL data first (keep tables, clear data)
    console.log('🧹 Clearing existing PostgreSQL data...');
    await DocumentPG.destroy({ where: {}, force: true });
    await ProductPG.destroy({ where: {}, force: true });
    await OrderPG.destroy({ where: {}, force: true });
    await MerchantPG.destroy({ where: {}, force: true });
    await UserPG.destroy({ where: {}, force: true });
    await AdminUserPG.destroy({ where: {}, force: true });

    // Reset sequences if using auto-increment (PostgreSQL UUIDs don't need this)
    console.log('✅ PostgreSQL tables cleared');

    // Start migrations with progress tracking
    let successCount = 0;
    let errorCount = 0;

    // 1. Migrate Admin Users
    console.log('\n📋 Migrating Admin Users...');
    const mongoAdmins = await AdminUser.find({});
    console.log(`Found ${mongoAdmins.length} admin users to migrate`);
    
    for (const admin of mongoAdmins) {
      try {
        const adminData = {
          id: admin._id.toString(),
          username: admin.username || admin.email?.split('@')[0] || 'admin',
          email: admin.email,
          password: admin.password || '$2a$10$defaulthashedpassword', // Keep hashed password
          role: admin.role || 'admin',
          permissions: admin.permissions || [],
          isActive: admin.isActive !== false,
          lastLogin: admin.lastLogin
        };

        await AdminUserPG.create(adminData);
        successCount++;
        console.log(`✅ Migrated admin: ${admin.email}`);
      } catch (error) {
        errorCount++;
        console.log(`❌ Error migrating admin ${admin.email}:`, error.message);
      }
    }

    // 2. Migrate Users
    console.log('\n👥 Migrating Users...');
    const mongoUsers = await User.find({});
    console.log(`Found ${mongoUsers.length} users to migrate`);
    
    for (const user of mongoUsers) {
      try {
        const userData = {
          id: user._id.toString(),
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.name || user.firstName || user.lastName || 'Unknown User',
          email: user.email,
          phone: user.phone || null,
          password: user.password || '$2a$10$defaulthashedpassword', // Keep hashed password
          address: user.address ? {
            street: user.address.street,
            city: user.address.city,
            state: user.address.state,
            zipCode: user.address.zipCode,
            country: user.address.country || 'Kenya'
          } : null,
          isVerified: user.isEmailVerified || user.isVerified || false,
          verificationToken: user.emailVerificationToken || user.verificationToken,
          verificationTokenExpires: user.emailVerificationExpires || user.verificationTokenExpires,
          passwordResetToken: user.resetPasswordToken || user.passwordResetToken,
          passwordResetExpires: user.resetPasswordExpire || user.passwordResetExpires
        };

        await UserPG.create(userData);
        successCount++;
        console.log(`✅ Migrated user: ${user.email}`);
      } catch (error) {
        errorCount++;
        console.log(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    // 3. Migrate Merchants
    console.log('\n🏪 Migrating Merchants...');
    const mongoMerchants = await Merchant.find({});
    console.log(`Found ${mongoMerchants.length} merchants to migrate`);
    
    for (const merchant of mongoMerchants) {
      try {
        const merchantData = {
          id: merchant._id.toString(),
          businessName: merchant.businessName || 'Unknown Business',
          ownerName: merchant.ownerName || merchant.contactPerson || 'Unknown Owner',
          email: merchant.email,
          phone: merchant.phone || merchant.contactNumber || '',
          password: merchant.password || '$2a$10$defaulthashedpassword',
          businessRegistrationNumber: merchant.businessRegistrationNumber || merchant.registrationNumber,
          businessAddress: merchant.businessAddress || merchant.address,
          businessDescription: merchant.businessDescription || merchant.description,
          businessCategory: merchant.businessCategory || merchant.category,
          website: merchant.website,
          socialMedia: merchant.socialMedia,
          operatingHours: merchant.operatingHours,
          deliveryAreas: merchant.deliveryAreas,
          minimumOrderAmount: parseFloat(merchant.minimumOrderAmount) || 0,
          deliveryFee: parseFloat(merchant.deliveryFee) || 0,
          status: merchant.status || 'pending',
          verificationStatus: merchant.verificationStatus || merchant.status || 'pending',
          rejectionReason: merchant.rejectionReason,
          adminNotes: merchant.adminNotes || merchant.notes,
          isActive: merchant.isActive !== false,
          isFeatured: merchant.isFeatured || false,
          rating: parseFloat(merchant.rating) || 0,
          totalOrders: parseInt(merchant.totalOrders) || 0,
          totalRevenue: parseFloat(merchant.totalRevenue) || 0,
          commissionRate: parseFloat(merchant.commissionRate) || 10.00,
          profileImage: merchant.profileImage || merchant.logo,
          bannerImage: merchant.bannerImage || merchant.coverImage,
          paymentMethods: merchant.paymentMethods,
          shippingMethods: merchant.shippingMethods,
          returnPolicy: merchant.returnPolicy,
          termsConditions: merchant.termsConditions || merchant.terms,
          passwordResetToken: merchant.passwordResetToken,
          passwordResetExpires: merchant.passwordResetExpires,
          emailVerificationToken: merchant.emailVerificationToken,
          emailVerificationExpires: merchant.emailVerificationExpires,
          isEmailVerified: merchant.isEmailVerified || merchant.isVerified || false,
          lastLogin: merchant.lastLogin
        };

        await MerchantPG.create(merchantData);
        successCount++;
        console.log(`✅ Migrated merchant: ${merchant.businessName} (${merchant.email})`);

        // Migrate merchant documents if they exist
        const documentTypes = [
          { field: 'businessLicense', type: 'business_license', name: 'Business License' },
          { field: 'taxCertificate', type: 'tax_certificate', name: 'Tax Certificate' },
          { field: 'businessPermit', type: 'business_permit', name: 'Business Permit' },
          { field: 'idDocument', type: 'id_document', name: 'ID Document' },
          { field: 'bankStatement', type: 'bank_statement', name: 'Bank Statement' }
        ];

        for (const docType of documentTypes) {
          if (merchant[docType.field]) {
            try {
              await DocumentPG.create({
                merchantId: merchant._id.toString(),
                documentType: docType.type,
                documentName: docType.name,
                originalFilename: `${docType.type}.pdf`,
                filePath: merchant[docType.field],
                fileSize: 0, // Unknown size for migrated docs
                mimeType: 'application/pdf',
                fileData: null, // File content not available
                status: merchant.verificationStatus === 'approved' ? 'approved' : 'pending',
                uploadedBy: merchant._id.toString(),
                isActive: true,
                metadata: {
                  migratedFrom: 'mongodb',
                  originalField: docType.field
                }
              });
              console.log(`  📄 Migrated document: ${docType.name}`);
            } catch (docError) {
              console.log(`  ❌ Error migrating document ${docType.name}:`, docError.message);
            }
          }
        }

      } catch (error) {
        errorCount++;
        console.log(`❌ Error migrating merchant ${merchant.businessName}:`, error.message);
      }
    }

    // 4. Migrate Products
    console.log('\n🛍️ Migrating Products...');
    const mongoProducts = await Product.find({});
    console.log(`Found ${mongoProducts.length} products to migrate`);
    
    for (const product of mongoProducts) {
      try {
        const productData = {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          comparePrice: parseFloat(product.comparePrice) || null,
          costPrice: parseFloat(product.costPrice) || null,
          sku: product.sku,
          barcode: product.barcode,
          trackInventory: product.trackInventory || false,
          inventoryQuantity: parseInt(product.inventoryQuantity) || 0,
          lowStockThreshold: parseInt(product.lowStockThreshold) || 5,
          weight: parseFloat(product.weight) || null,
          dimensions: product.dimensions,
          category: product.category,
          subcategory: product.subcategory,
          tags: product.tags || [],
          images: product.images || [],
          thumbnail: product.thumbnail,
          merchantId: product.merchant?.toString() || product.merchantId?.toString(),
          status: product.status || 'active',
          isFeatured: product.isFeatured || product.featured || false,
          isDigital: product.isDigital || false,
          requiresShipping: product.requiresShipping !== false,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          metaKeywords: product.metaKeywords || [],
          rating: parseFloat(product.rating) || 0,
          reviewCount: parseInt(product.reviewCount) || parseInt(product.reviews?.length) || 0,
          salesCount: parseInt(product.salesCount) || parseInt(product.sold) || 0,
          viewCount: parseInt(product.viewCount) || parseInt(product.views) || 0,
          variants: product.variants,
          attributes: product.attributes,
          shippingInfo: product.shippingInfo || product.shipping
        };

        await ProductPG.create(productData);
        successCount++;
        console.log(`✅ Migrated product: ${product.name} (${product.category})`);
      } catch (error) {
        errorCount++;
        console.log(`❌ Error migrating product ${product.name}:`, error.message);
      }
    }

    // 5. Migrate Orders (if any exist)
    console.log('\n📦 Migrating Orders...');
    const mongoOrders = await Order.find({});
    console.log(`Found ${mongoOrders.length} orders to migrate`);
    
    for (const order of mongoOrders) {
      try {
        const orderData = {
          id: order._id.toString(),
          orderNumber: order.orderNumber || `ORD-${order._id.toString().substr(-8).toUpperCase()}`,
          userId: order.user?.toString() || order.userId?.toString() || order.customer?.toString(),
          merchantId: order.merchant?.toString() || order.merchantId?.toString(),
          status: order.status || 'pending',
          paymentStatus: order.paymentStatus || 'pending',
          fulfillmentStatus: order.fulfillmentStatus || 'unfulfilled',
          subtotal: parseFloat(order.subtotal) || parseFloat(order.amount) || 0,
          taxAmount: parseFloat(order.taxAmount) || parseFloat(order.tax) || 0,
          shippingAmount: parseFloat(order.shippingAmount) || parseFloat(order.shipping) || 0,
          discountAmount: parseFloat(order.discountAmount) || parseFloat(order.discount) || 0,
          totalAmount: parseFloat(order.totalAmount) || parseFloat(order.total) || parseFloat(order.amount) || 0,
          currency: order.currency || 'KES',
          paymentMethod: order.paymentMethod,
          paymentReference: order.paymentReference || order.transactionId,
          shippingAddress: order.shippingAddress || order.deliveryAddress || order.address,
          billingAddress: order.billingAddress,
          deliveryInstructions: order.deliveryInstructions || order.notes,
          estimatedDeliveryDate: order.estimatedDeliveryDate,
          deliveredAt: order.deliveredAt,
          cancelledAt: order.cancelledAt,
          cancellationReason: order.cancellationReason,
          refundAmount: parseFloat(order.refundAmount) || 0,
          refundStatus: order.refundStatus,
          refundReason: order.refundReason,
          notes: order.notes || order.adminNotes,
          trackingNumber: order.trackingNumber,
          courierService: order.courierService
        };

        await OrderPG.create(orderData);
        successCount++;
        console.log(`✅ Migrated order: ${order.orderNumber}`);
      } catch (error) {
        errorCount++;
        console.log(`❌ Error migrating order ${order.orderNumber}:`, error.message);
      }
    }

    // Summary
    console.log('\n🎉 Migration completed!');
    console.log('=================================');
    console.log(`✅ Successfully migrated: ${successCount} records`);
    console.log(`❌ Errors encountered: ${errorCount} records`);
    
    // Final count verification
    const finalCounts = {
      users: await UserPG.count(),
      merchants: await MerchantPG.count(),
      products: await ProductPG.count(),
      orders: await OrderPG.count(),
      admins: await AdminUserPG.count(),
      documents: await DocumentPG.count()
    };

    console.log('\n📊 Final PostgreSQL counts:');
    console.log(`Users: ${finalCounts.users}`);
    console.log(`Merchants: ${finalCounts.merchants}`);
    console.log(`Products: ${finalCounts.products}`);
    console.log(`Orders: ${finalCounts.orders}`);
    console.log(`Admin Users: ${finalCounts.admins}`);
    console.log(`Documents: ${finalCounts.documents}`);
    
    // Close connections
    await mongoose.disconnect();
    await sequelize.close();

    console.log('\n✅ Migration completed successfully!');
    console.log('🚀 Your PostgreSQL database is now ready with all your data!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fullMigration();
}

module.exports = fullMigration;