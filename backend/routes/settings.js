const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Settings = require('../models/Settings');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        user: req.user._id,
        profile: {},
        preferences: {},
        notifications: {
          email: {
            orderUpdates: true,
            promotions: true,
            newsletter: false,
            flashSales: true
          },
          push: {
            orderUpdates: true,
            promotions: false,
            flashSales: true
          }
        },
        privacy: {
          profileVisibility: 'private',
          showOnlineStatus: true,
          allowMessages: true
        },
        security: {
          twoFactorEnabled: false,
          loginNotifications: true
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const {
      profile,
      preferences,
      notifications,
      privacy,
      security
    } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        profile: profile || {},
        preferences: preferences || {},
        notifications: notifications || {},
        privacy: privacy || {},
        security: security || {}
      });
    } else {
      // Update existing settings
      if (profile) settings.profile = { ...settings.profile, ...profile };
      if (preferences) settings.preferences = { ...settings.preferences, ...preferences };
      if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
      if (privacy) settings.privacy = { ...settings.privacy, ...privacy };
      if (security) settings.security = { ...settings.security, ...security };

      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update profile settings
// @route   PUT /api/settings/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      avatar,
      dateOfBirth,
      gender
    } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        profile: {
          firstName,
          lastName,
          bio,
          avatar,
          dateOfBirth,
          gender
        }
      });
    } else {
      settings.profile = {
        ...settings.profile,
        firstName,
        lastName,
        bio,
        avatar,
        dateOfBirth,
        gender
      };
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating profile settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
router.put('/notifications', protect, async (req, res) => {
  try {
    const { email, push } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        notifications: { email, push }
      });
    } else {
      settings.notifications = {
        ...settings.notifications,
        email: { ...settings.notifications.email, ...email },
        push: { ...settings.notifications.push, ...push }
      };
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update privacy settings
// @route   PUT /api/settings/privacy
// @access  Private
router.put('/privacy', protect, async (req, res) => {
  try {
    const {
      profileVisibility,
      showOnlineStatus,
      allowMessages
    } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        privacy: {
          profileVisibility,
          showOnlineStatus,
          allowMessages
        }
      });
    } else {
      settings.privacy = {
        ...settings.privacy,
        profileVisibility,
        showOnlineStatus,
        allowMessages
      };
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update security settings
// @route   PUT /api/settings/security
// @access  Private
router.put('/security', protect, async (req, res) => {
  try {
    const {
      twoFactorEnabled,
      loginNotifications
    } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        security: {
          twoFactorEnabled,
          loginNotifications
        }
      });
    } else {
      settings.security = {
        ...settings.security,
        twoFactorEnabled,
        loginNotifications
      };
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Reset settings to default
// @route   DELETE /api/settings
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await Settings.findOneAndDelete({ user: req.user._id });

    // Create new default settings
    const defaultSettings = await Settings.create({
      user: req.user._id,
      profile: {},
      preferences: {},
      notifications: {
        email: {
          orderUpdates: true,
          promotions: true,
          newsletter: false,
          flashSales: true
        },
        push: {
          orderUpdates: true,
          promotions: false,
          flashSales: true
        }
      },
      privacy: {
        profileVisibility: 'private',
        showOnlineStatus: true,
        allowMessages: true
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true
      }
    });

    res.json({
      success: true,
      message: 'Settings reset to default',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
