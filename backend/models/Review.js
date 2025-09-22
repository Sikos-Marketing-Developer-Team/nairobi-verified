const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Merchant = require('./Merchant');
const User = require('./User');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: true, // allow null during cutover for legacy data
    references: {
      model: 'merchants',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  // legacy support for ObjectId strings during migration
  merchantLegacyId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userLegacyId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  helpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  helpfulBy: {
    type: DataTypes.JSONB,
    defaultValue: [] // array of user ids (numbers or strings during cutover)
  },
  reply: {
    type: DataTypes.JSONB,
    defaultValue: null // { author, content, date }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reviews',
  indexes: [
    { fields: ['merchantId', 'createdAt'] },
    { fields: ['rating'] },
    { fields: ['createdAt'] },
    { unique: true, fields: ['merchantId', 'userId'] }
  ],
  hooks: {
    beforeUpdate: (review) => { review.updatedAt = new Date(); },
    afterSave: async (review) => { await Review.updateMerchantRating(review.merchantId); },
    afterDestroy: async (review) => { await Review.updateMerchantRating(review.merchantId); }
  }
});

// Associations (optional until we wire globally)
// Review.belongsTo(Merchant, { foreignKey: 'merchantId' });
// Review.belongsTo(User, { foreignKey: 'userId' });

// Aggregate helper
Review.updateMerchantRating = async function(merchantId) {
  if (!merchantId) return;
  try {
    const rows = await Review.findAll({
      where: { merchantId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
      ],
      raw: true
    });

    const avg = rows[0]?.avgRating ? Number(rows[0].avgRating).toFixed(1) : 0;
    const count = rows[0]?.reviewCount ? parseInt(rows[0].reviewCount, 10) : 0;

    const merchant = await Merchant.findByPk(merchantId);
    if (merchant) {
      merchant.rating = Number(avg);
      merchant.reviews = count;
      await merchant.save();
    }
  } catch (err) {
    console.error('Error updating merchant rating:', err);
  }
};

module.exports = Review;