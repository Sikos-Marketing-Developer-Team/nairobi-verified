const { sequelize } = require('../config/postgres');
const UserPG = require('./UserPG');
const MerchantPG = require('./MerchantPG');
const ProductPG = require('./ProductPG');
const OrderPG = require('./OrderPG');
const AdminUserPG = require('./AdminUserPG');
const DocumentPG = require('./DocumentPG');

// Define associations
// Merchant has many Products
MerchantPG.hasMany(ProductPG, {
  foreignKey: 'merchantId',
  as: 'products'
});
ProductPG.belongsTo(MerchantPG, {
  foreignKey: 'merchantId',
  as: 'merchant'
});

// Merchant has many Orders
MerchantPG.hasMany(OrderPG, {
  foreignKey: 'merchantId',
  as: 'orders'
});
OrderPG.belongsTo(MerchantPG, {
  foreignKey: 'merchantId',
  as: 'merchant'
});

// User has many Orders
UserPG.hasMany(OrderPG, {
  foreignKey: 'userId',
  as: 'orders'
});
OrderPG.belongsTo(UserPG, {
  foreignKey: 'userId',
  as: 'user'
});

// Merchant has many Documents
MerchantPG.hasMany(DocumentPG, {
  foreignKey: 'merchantId',
  as: 'documents'
});
DocumentPG.belongsTo(MerchantPG, {
  foreignKey: 'merchantId',
  as: 'merchant'
});

// AdminUser can review Documents
AdminUserPG.hasMany(DocumentPG, {
  foreignKey: 'reviewedBy',
  as: 'reviewedDocuments'
});
DocumentPG.belongsTo(AdminUserPG, {
  foreignKey: 'reviewedBy',
  as: 'reviewer'
});

// Document uploaded by Merchant
DocumentPG.belongsTo(MerchantPG, {
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  UserPG,
  MerchantPG,
  ProductPG,
  OrderPG,
  AdminUserPG,
  DocumentPG
};