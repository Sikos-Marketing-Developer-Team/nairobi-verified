const Setting = require('../models/Setting');

// Get all settings
const getSettings = async (req, res) => {
  try {
    // In a real implementation, you would fetch this from a database
    // For this example, we'll return mock data
    const settings = {
      general: {
        siteName: 'Nairobi Verified',
        siteDescription: 'A marketplace for verified products and trusted merchants',
        contactEmail: 'contact@nairobiverifed.com',
        supportPhone: '+254 123 456 789',
        logoUrl: 'https://example.com/logo.png',
        faviconUrl: 'https://example.com/favicon.ico',
        maintenanceMode: false
      },
      email: {
        fromEmail: 'noreply@nairobiverifed.com',
        smtpHost: 'smtp.example.com',
        smtpPort: '587',
        smtpUser: 'smtp_user',
        smtpPassword: '********',
        smtpSecure: true
      },
      payment: {
        currency: 'KES',
        currencySymbol: 'KSh',
        stripePublicKey: 'pk_test_example',
        stripeSecretKey: 'sk_test_example',
        paypalClientId: 'client_id_example',
        paypalSecret: 'client_secret_example',
        testMode: true
      },
      security: {
        enableTwoFactor: false,
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        maxLoginAttempts: 5,
        sessionTimeout: 60
      },
      seo: {
        metaTitle: 'Nairobi Verified - Trusted Marketplace',
        metaDescription: 'Buy and sell verified products from trusted merchants in Kenya',
        ogImage: 'https://example.com/og-image.jpg',
        googleAnalyticsId: 'G-EXAMPLE123',
        enableSitemap: true,
        enableRobotsTxt: true
      },
      legal: {
        termsOfService: '<h2>Terms of Service</h2><p>These are the terms of service...</p>',
        privacyPolicy: '<h2>Privacy Policy</h2><p>This is our privacy policy...</p>',
        refundPolicy: '<h2>Refund Policy</h2><p>This is our refund policy...</p>',
        cookiePolicy: '<h2>Cookie Policy</h2><p>This is our cookie policy...</p>'
      }
    };
    
    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// Update settings by section
const updateSettings = async (req, res) => {
  try {
    const { section } = req.params;
    const updatedSettings = req.body;
    
    // Validate section
    const validSections = ['general', 'email', 'payment', 'security', 'seo', 'legal'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section'
      });
    }
    
    // In a real implementation, you would update this in a database
    // For this example, we'll return a success message
    
    res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// Handle file uploads
const uploadFile = async (req, res) => {
  try {
    // In a real implementation, you would handle file uploads
    // For this example, we'll return a mock URL
    
    const { type } = req.body;
    let imageUrl = '';
    
    switch (type) {
      case 'logo':
        imageUrl = 'https://example.com/uploads/logo.png';
        break;
      case 'favicon':
        imageUrl = 'https://example.com/uploads/favicon.ico';
        break;
      case 'og-image':
        imageUrl = 'https://example.com/uploads/og-image.jpg';
        break;
      default:
        imageUrl = 'https://example.com/uploads/image.jpg';
    }
    
    res.status(200).json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadFile
};