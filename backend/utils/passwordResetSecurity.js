/**
 * Password Reset Security Utilities
 * Enhanced security features for password reset functionality
 * TODO: Convert from MongoDB to PostgreSQL/Sequelize syntax
 */

const { UserPG, MerchantPG } = require('../models/indexPG');

/**
 * Clean up expired password reset tokens
 * This should be called periodically to maintain database hygiene
 */
const cleanupExpiredTokens = async () => {
  try {
    console.log('Password reset token cleanup temporarily disabled - needs PostgreSQL conversion');
    return { usersUpdated: 0, merchantsUpdated: 0 };
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    throw error;
  }
};

/**
 * Check if a user has too many recent password reset attempts
 */
const checkRateLimiting = async (email, userType = 'user') => {
  try {
    console.log('Password reset rate limiting temporarily disabled - needs PostgreSQL conversion');
    return { allowed: true, timeRemaining: 0 };
  } catch (error) {
    console.error('Error checking rate limiting:', error);
    throw error;
  }
};

/**
 * Get password reset statistics
 */
const getPasswordResetStats = async () => {
  try {
    console.log('Password reset stats temporarily disabled - needs PostgreSQL conversion');
    return {
      users: { total: 0, active: 0, expired: 0 },
      merchants: { total: 0, active: 0, expired: 0 }
    };
  } catch (error) {
    console.error('Error getting password reset stats:', error);
    throw error;
  }
};

module.exports = {
  cleanupExpiredTokens,
  checkRateLimiting,
  getPasswordResetStats
};