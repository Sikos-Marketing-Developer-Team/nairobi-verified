/**
 * Password Reset Security Utilities
 * Enhanced security features for password reset functionality
 */

const User = require('../models/User');
const Merchant = require('../models/Merchant');

/**
 * Clean up expired password reset tokens
 * This should be called periodically to maintain database hygiene
 */
const cleanupExpiredTokens = async () => {
  try {
    const currentTime = Date.now();
    
    const userResult = await User.updateMany(
      { resetPasswordExpire: { $lt: currentTime } },
      { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } }
    );
    
    const merchantResult = await Merchant.updateMany(
      { resetPasswordExpire: { $lt: currentTime } },
      { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } }
    );
    
    const totalCleaned = userResult.modifiedCount + merchantResult.modifiedCount;
    
    if (totalCleaned > 0) {
      console.log(`🧹 Cleaned up ${totalCleaned} expired password reset tokens`);
    }
    
    return {
      success: true,
      cleaned: totalCleaned,
      users: userResult.modifiedCount,
      merchants: merchantResult.modifiedCount
    };
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get password reset token statistics
 * Useful for monitoring and security analysis
 */
const getTokenStatistics = async () => {
  try {
    const currentTime = Date.now();
    
    // Count active and expired tokens for users
    const activeUserTokens = await User.countDocuments({
      resetPasswordToken: { $exists: true },
      resetPasswordExpire: { $gt: currentTime }
    });
    
    const expiredUserTokens = await User.countDocuments({
      resetPasswordToken: { $exists: true },
      resetPasswordExpire: { $lte: currentTime }
    });
    
    // Count active and expired tokens for merchants
    const activeMerchantTokens = await Merchant.countDocuments({
      resetPasswordToken: { $exists: true },
      resetPasswordExpire: { $gt: currentTime }
    });
    
    const expiredMerchantTokens = await Merchant.countDocuments({
      resetPasswordToken: { $exists: true },
      resetPasswordExpire: { $lte: currentTime }
    });
    
    return {
      users: {
        active: activeUserTokens,
        expired: expiredUserTokens,
        total: activeUserTokens + expiredUserTokens
      },
      merchants: {
        active: activeMerchantTokens,
        expired: expiredMerchantTokens,
        total: activeMerchantTokens + expiredMerchantTokens
      },
      total: {
        active: activeUserTokens + activeMerchantTokens,
        expired: expiredUserTokens + expiredMerchantTokens,
        total: activeUserTokens + expiredUserTokens + activeMerchantTokens + expiredMerchantTokens
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting token statistics:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Validate token expiry time
 * Ensures consistent 10-minute expiry
 */
const generateTokenExpiry = () => {
  return Date.now() + 10 * 60 * 1000; // 10 minutes
};

/**
 * Check if a token expiry time is valid
 */
const isTokenExpired = (expiryTime) => {
  return Date.now() >= expiryTime;
};

/**
 * Get time remaining for a token
 */
const getTokenTimeRemaining = (expiryTime) => {
  const remaining = expiryTime - Date.now();
  return Math.max(0, Math.floor(remaining / 1000)); // seconds
};

module.exports = {
  cleanupExpiredTokens,
  getTokenStatistics,
  generateTokenExpiry,
  isTokenExpired,
  getTokenTimeRemaining
};

/**
 * Get password reset token statistics
 * Useful for monitoring and security analysis
 */
const getTokenStatistics = async () => {
  try {
    const currentTime = Date.now();
    
    const userStats = await User.aggregate([
      {
        $match: {
          resetPasswordToken: { $exists: true },
          resetPasswordExpire: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $gt: ['$resetPasswordExpire', currentTime] }, 1, 0]
            }
          },
          expired: {
            $sum: {
              $cond: [{ $lte: ['$resetPasswordExpire', currentTime] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    const merchantStats = await Merchant.aggregate([
      {
        $match: {
          resetPasswordToken: { $exists: true },
          resetPasswordExpire: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $gt: ['$resetPasswordExpire', currentTime] }, 1, 0]
            }
          },
          expired: {
            $sum: {
              $cond: [{ $lte: ['$resetPasswordExpire', currentTime] }, 1, 0]
            }
          }
        }
      }
    ]);\n    \n    const userResult = userStats[0] || { total: 0, active: 0, expired: 0 };\n    const merchantResult = merchantStats[0] || { total: 0, active: 0, expired: 0 };\n    \n    return {\n      users: userResult,\n      merchants: merchantResult,\n      total: {\n        total: userResult.total + merchantResult.total,\n        active: userResult.active + merchantResult.active,\n        expired: userResult.expired + merchantResult.expired\n      },\n      timestamp: new Date().toISOString()\n    };\n  } catch (error) {\n    console.error('Error getting token statistics:', error);\n    return {\n      error: error.message,\n      timestamp: new Date().toISOString()\n    };\n  }\n};\n\n/**\n * Validate token expiry time\n * Ensures consistent 10-minute expiry\n */\nconst generateTokenExpiry = () => {\n  return Date.now() + 10 * 60 * 1000; // 10 minutes\n};\n\n/**\n * Check if a token expiry time is valid\n */\nconst isTokenExpired = (expiryTime) => {\n  return Date.now() >= expiryTime;\n};\n\n/**\n * Get time remaining for a token\n */\nconst getTokenTimeRemaining = (expiryTime) => {\n  const remaining = expiryTime - Date.now();\n  return Math.max(0, Math.floor(remaining / 1000)); // seconds\n};\n\nmodule.exports = {\n  cleanupExpiredTokens,\n  getTokenStatistics,\n  generateTokenExpiry,\n  isTokenExpired,\n  getTokenTimeRemaining\n};