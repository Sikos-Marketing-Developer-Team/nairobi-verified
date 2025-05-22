const Notification = require('../models/Notification');
const EmailTemplate = require('../models/EmailTemplate');

// Get all notifications
const getNotifications = async (req, res) => {
  try {
    // In a real implementation, you would fetch this from a database
    // For this example, we'll return mock data
    const notifications = [
      {
        _id: '1',
        title: 'Welcome to Our Platform',
        message: 'Thank you for joining Nairobi Verified. We\'re excited to have you on board!',
        type: 'system',
        audience: 'all',
        status: 'sent',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        title: 'New Feature: Dark Mode',
        message: 'We\'ve added a new dark mode feature. Try it out in your settings!',
        type: 'system',
        audience: 'all',
        status: 'draft',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '3',
        title: 'Holiday Sale Coming Soon',
        message: 'Get ready for our biggest sale of the year! Starting next week.',
        type: 'marketing',
        audience: 'clients',
        status: 'scheduled',
        scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Create notification
const createNotification = async (req, res) => {
  try {
    const { title, message, type, audience, status, scheduledFor } = req.body;
    
    // In a real implementation, you would save this to a database
    // For this example, we'll return mock data
    const notification = {
      _id: Date.now().toString(),
      title,
      message,
      type,
      audience,
      status,
      scheduledFor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { title, message, type, audience, status, scheduledFor } = req.body;
    
    // In a real implementation, you would update this in a database
    // For this example, we'll return mock data
    const notification = {
      _id: notificationId,
      title,
      message,
      type,
      audience,
      status,
      scheduledFor,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // In a real implementation, you would delete this from a database
    // For this example, we'll return a success message
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Send notification
const sendNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // In a real implementation, you would send the notification
    // For this example, we'll return mock data
    const notification = {
      _id: notificationId,
      status: 'sent',
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message
    });
  }
};

// Get all email templates
const getEmailTemplates = async (req, res) => {
  try {
    // In a real implementation, you would fetch this from a database
    // For this example, we'll return mock data
    const templates = [
      {
        _id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to Nairobi Verified!',
        body: '<h1>Welcome, {{userName}}!</h1><p>Thank you for joining Nairobi Verified. We\'re excited to have you on board!</p><p>Your account has been created successfully. You can now start exploring our marketplace.</p><p>If you have any questions, please don\'t hesitate to contact our support team at {{supportEmail}}.</p><p>Best regards,<br>The Nairobi Verified Team</p>',
        description: 'Sent to new users after registration',
        variables: ['userName', 'supportEmail'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        name: 'Order Confirmation',
        subject: 'Your Order #{{orderNumber}} Confirmation',
        body: '<h1>Order Confirmation</h1><p>Dear {{userName}},</p><p>Thank you for your order! We\'ve received your order #{{orderNumber}} and are processing it now.</p><p>Order Total: {{orderTotal}}</p><p>You can track your order status in your account dashboard.</p><p>Best regards,<br>The Nairobi Verified Team</p>',
        description: 'Sent to customers after placing an order',
        variables: ['userName', 'orderNumber', 'orderTotal'],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '3',
        name: 'Password Reset',
        subject: 'Password Reset Request',
        body: '<h1>Password Reset</h1><p>Dear {{userName}},</p><p>We received a request to reset your password. Click the link below to set a new password:</p><p><a href="{{resetLink}}">Reset Password</a></p><p>If you didn\'t request this, please ignore this email or contact support if you have concerns.</p><p>This link will expire in 1 hour.</p><p>Best regards,<br>The Nairobi Verified Team</p>',
        description: 'Sent when a user requests a password reset',
        variables: ['userName', 'resetLink'],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email templates',
      error: error.message
    });
  }
};

// Create email template
const createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, description, variables } = req.body;
    
    // In a real implementation, you would save this to a database
    // For this example, we'll return mock data
    const template = {
      _id: Date.now().toString(),
      name,
      subject,
      body,
      description,
      variables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Create email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating email template',
      error: error.message
    });
  }
};

// Update email template
const updateEmailTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, subject, body, description, variables } = req.body;
    
    // In a real implementation, you would update this in a database
    // For this example, we'll return mock data
    const template = {
      _id: templateId,
      name,
      subject,
      body,
      description,
      variables,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email template',
      error: error.message
    });
  }
};

// Delete email template
const deleteEmailTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    // In a real implementation, you would delete this from a database
    // For this example, we'll return a success message
    
    res.status(200).json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Delete email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting email template',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate
};