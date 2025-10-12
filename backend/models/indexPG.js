const { sequelize } = require('../config/postgres');
const UserPG = require('./UserPG');
const MerchantPG = require('./MerchantPG');
const ProductPG = require('./ProductPG');
const OrderPG = require('./OrderPG');
const AdminUserPG = require('./AdminUserPG');
const DocumentPG = require('./DocumentPG');
const CartPG = require('./CartPG');
const AddressPG = require('./AddressPG');
const SettingsPG = require('./SettingsPG');
const ReviewPG = require('./ReviewPG');
const FlashSalePG = require('./FlashSalePG');

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

// User has many Carts
UserPG.hasMany(CartPG, {
  foreignKey: 'userId',
  as: 'carts'
});
CartPG.belongsTo(UserPG, {
  foreignKey: 'userId',
  as: 'user'
});

// User has many Addresses
UserPG.hasMany(AddressPG, {
  foreignKey: 'userId',
  as: 'addresses'
});
AddressPG.belongsTo(UserPG, {
  foreignKey: 'userId',
  as: 'user'
});

// User has one Settings
UserPG.hasOne(SettingsPG, {
  foreignKey: 'userId',
  as: 'settings'
});
SettingsPG.belongsTo(UserPG, {
  foreignKey: 'userId',
  as: 'user'
});

// Review associations
// User has many Reviews
UserPG.hasMany(ReviewPG, {
  foreignKey: 'userId',
  as: 'reviews'
});
ReviewPG.belongsTo(UserPG, {
  foreignKey: 'userId',
  as: 'user'
});

// Product has many Reviews
ProductPG.hasMany(ReviewPG, {
  foreignKey: 'productId',
  as: 'reviews'
});
ReviewPG.belongsTo(ProductPG, {
  foreignKey: 'productId',
  as: 'product'
});

// Merchant has many Reviews
MerchantPG.hasMany(ReviewPG, {
  foreignKey: 'merchantId',
  as: 'reviews'
});
ReviewPG.belongsTo(MerchantPG, {
  foreignKey: 'merchantId',
  as: 'merchant'
});

// Order has many Reviews
OrderPG.hasMany(ReviewPG, {
  foreignKey: 'orderId',
  as: 'reviews'
});
ReviewPG.belongsTo(OrderPG, {
  foreignKey: 'orderId',
  as: 'order'
});

// FlashSale associations
// AdminUser creates FlashSales
AdminUserPG.hasMany(FlashSalePG, {
  foreignKey: 'createdBy',
  as: 'flashSales'
});
FlashSalePG.belongsTo(AdminUserPG, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  UserPG,
  MerchantPG,
  ProductPG,
  OrderPG,
  AdminUserPG,
  DocumentPG,
  CartPG,
  AddressPG,
  SettingsPG,
  ReviewPG,
  FlashSalePG
};