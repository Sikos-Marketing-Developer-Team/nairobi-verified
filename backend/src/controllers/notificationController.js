const subscriptionNotifications = require('../utils/subscriptionNotifications');

// Check for expiring subscriptions and send notifications
const checkExpiringSubscriptions = async (req, res) => {
  try {
    // Only allow admin to manually trigger this (normally would be a cron job)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can trigger subscription checks'
      });
    }
    
    const result = await subscriptionNotifications.checkExpiringSubscriptions();
    
    res.status(200).json({
      success: true,
      message: `Checked ${result.checked} expiring subscriptions, sent ${result.sent} notifications`
    });
  } catch (error) {
    console.error('Check expiring subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking expiring subscriptions',
      error: error.message
    });
  }
};

module.exports = {
  checkExpiringSubscriptions
};