const crypto = require('crypto');
const { MerchantPG } = require('../models/indexPG');
const { sendEmail } = require('../utils/emailService');

/**
 * Merchant Onboarding Service
 * Handles merchant creation, credential generation, and notification workflows
 */
class MerchantOnboardingService {
  
  /**
   * Generate secure temporary password
   * @returns {string} Temporary password
   */
  static generateTempPassword() {
    // Generate a secure 12-character password with mixed case, numbers, and symbols
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Create merchant account with admin privileges
   * @param {Object} merchantData - Merchant information
   * @param {Object} adminUser - Admin user who created the merchant
   * @returns {Object} Created merchant and credentials
   */
  static async createMerchantByAdmin(merchantData, adminUser) {
    try {
      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      
      // Set default business hours if not provided
      const defaultBusinessHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      };

      // Create merchant with admin-set verification status
      const merchant = await MerchantPG.create({
        businessName: merchantData.businessName,
        email: merchantData.email,
        phone: merchantData.phone,
        password: tempPassword,
        businessType: merchantData.category || merchantData.businessType,
        description: merchantData.description || 'Business description to be updated',
        yearEstablished: merchantData.yearEstablished || new Date().getFullYear(),
        website: merchantData.website || '',
        address: merchantData.address,
        location: merchantData.location || merchantData.address,
        landmark: merchantData.landmark || '',
        businessHours: merchantData.businessHours || defaultBusinessHours,
        verified: merchantData.verificationStatus === 'verified',
        verifiedDate: merchantData.verificationStatus === 'verified' ? new Date() : null,
        // Admin metadata
        createdByAdmin: true,
        createdByAdminId: adminUser.id,
        createdByAdminName: `${adminUser.firstName} ${adminUser.lastName}`,
        onboardingStatus: 'credentials_sent'
      });

      // Generate account setup token (valid for 7 days)
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupTokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');
      
      await MerchantPG.update({
        accountSetupToken: setupTokenHash,
        accountSetupExpire: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      }, {
        where: { id: merchant.id }
      });

      // Send welcome email with credentials
      await this.sendWelcomeEmail(merchant, tempPassword, setupToken, adminUser);

      // Log admin action
      console.log(`Admin ${adminUser.email} created merchant account for ${merchant.email}`);

      return {
        merchant,
        credentials: {
          email: merchant.email,
          tempPassword,
          setupToken
        },
        message: 'Merchant account created successfully. Welcome email sent.'
      };

    } catch (error) {
      console.error('Error creating merchant by admin:', error);
      throw new Error(`Failed to create merchant account: ${error.message}`);
    }
  }

  /**
   * Create merchant account programmatically (direct database)
   * @param {Object} merchantData - Merchant information
   * @param {Object} options - Creation options
   * @returns {Object} Created merchant and credentials
   */
  static async createMerchantProgrammatically(merchantData, options = {}) {
    try {
      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      
      // Set default business hours
      const defaultBusinessHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      };

      // Create merchant
      const merchant = await MerchantPG.create({
        businessName: merchantData.businessName,
        email: merchantData.email,
        phone: merchantData.phone,
        password: tempPassword,
        businessType: merchantData.businessType || merchantData.category,
        description: merchantData.description || 'Business description to be updated',
        yearEstablished: merchantData.yearEstablished || new Date().getFullYear(),
        website: merchantData.website || '',
        address: merchantData.address,
        location: merchantData.location || merchantData.address,
        landmark: merchantData.landmark || '',
        businessHours: merchantData.businessHours || defaultBusinessHours,
        verified: options.autoVerify || false,
        verifiedDate: options.autoVerify ? new Date() : null,
        // Programmatic creation metadata
        createdProgrammatically: true,
        createdBy: options.createdBy || 'system',
        onboardingStatus: 'credentials_sent'
      });

      // Generate account setup token (valid for 14 days for programmatic creation)
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupTokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');
      
      merchant.accountSetupToken = setupTokenHash;
      merchant.accountSetupExpire = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
      await merchant.save();

      // Send welcome email
      await this.sendWelcomeEmailProgrammatic(merchant, tempPassword, setupToken, options);

      // Log system action
      console.log(`System created merchant account for ${merchant.email} programmatically`);

      return {
        merchant,
        credentials: {
          email: merchant.email,
          tempPassword,
          setupToken,
          loginUrl: `${process.env.FRONTEND_URL}/auth?merchant=true`,
          setupUrl: `${process.env.FRONTEND_URL}/merchant/account-setup/${setupToken}`
        },
        message: 'Merchant account created programmatically. Welcome email sent.'
      };

    } catch (error) {
      console.error('Error creating merchant programmatically:', error);
      throw new Error(`Failed to create merchant account: ${error.message}`);
    }
  }

  /**
   * Send welcome email for admin-created merchants
   */
  static async sendWelcomeEmail(merchant, tempPassword, setupToken, adminUser) {
    const setupUrl = `${process.env.FRONTEND_URL}/merchant/account-setup/${setupToken}`;
    const loginUrl = `${process.env.FRONTEND_URL}/auth?merchant=true`;

    const emailContent = {
      to: merchant.email,
      subject: '🎉 Welcome to Nairobi CBD Business Directory - Your Account is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nairobi CBD!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business account has been created</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Great news! Your business account has been created by our admin team. 
              You can now access your merchant dashboard and start managing your business profile.
            </p>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin-top: 0;">🔐 Your Login Credentials</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${merchant.email}</p>
            <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; color: #d32f2f; font-weight: bold;">${tempPassword}</code></p>
            <p style="color: #f57c00; font-size: 14px; margin-top: 15px;">
              ⚠️ <strong>Important:</strong> Please change this password immediately after your first login for security.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
              🚀 Complete Account Setup
            </a>
            <a href="${loginUrl}" style="background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
              🔑 Login Now
            </a>
          </div>

          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #ef6c00; margin-top: 0;">📋 Next Steps</h3>
            <ol style="color: #666; line-height: 1.8;">
              <li><strong>Login</strong> with your credentials above</li>
              <li><strong>Change your password</strong> to something secure</li>
              <li><strong>Complete your business profile</strong> with photos and details</li>
              <li><strong>Upload verification documents</strong> if not already verified</li>
              <li><strong>Start receiving customers!</strong></li>
            </ol>
          </div>

          <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #7b1fa2; margin-top: 0;">🎯 Account Benefits</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>✅ Business profile in Nairobi CBD directory</li>
              <li>📊 Analytics dashboard to track performance</li>
              <li>⭐ Customer reviews and ratings</li>
              <li>📸 Photo gallery for your business</li>
              <li>🕒 Business hours management</li>
              <li>📱 Mobile-friendly merchant portal</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fafafa; border-radius: 8px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Account created by: <strong>${adminUser.firstName} ${adminUser.lastName}</strong><br>
              Setup link valid for 7 days | Need help? Contact our support team
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              This email was sent to ${merchant.email}<br>
              Nairobi CBD Business Directory | Connecting Businesses with Customers<br>
              If you didn't expect this email, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    try {
      await sendEmail(emailContent);
      console.log(`Welcome email sent to ${merchant.email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${merchant.email}:`, error);
      // Don't throw error - account creation should succeed even if email fails
    }
  }

  /**
   * Send welcome email for programmatically created merchants
   */
  static async sendWelcomeEmailProgrammatic(merchant, tempPassword, setupToken, options) {
    const setupUrl = `${process.env.FRONTEND_URL}/merchant/account-setup/${setupToken}`;
    const loginUrl = `${process.env.FRONTEND_URL}/auth?merchant=true`;

    const emailContent = {
      to: merchant.email,
      subject: '🚀 Your Nairobi CBD Business Account is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nairobi CBD!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business account has been automatically created</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your business has been automatically registered in our Nairobi CBD Business Directory. 
              You can now access your merchant dashboard and start connecting with customers.
            </p>
          </div>

          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-top: 0;">🔐 Your Login Credentials</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${merchant.email}</p>
            <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; color: #d32f2f; font-weight: bold;">${tempPassword}</code></p>
            <p style="color: #f57c00; font-size: 14px; margin-top: 15px;">
              ⚠️ <strong>Security Notice:</strong> Change this password immediately after login.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
              🚀 Complete Setup
            </a>
            <a href="${loginUrl}" style="background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
              🔑 Login
            </a>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fff8e1; border-radius: 8px;">
            <p style="color: #ef6c00; margin: 0; font-size: 14px;">
              <strong>⏰ Setup link expires in 14 days</strong><br>
              Created by: ${options.createdBy || 'System'}<br>
              ${options.reason ? `Reason: ${options.reason}` : ''}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              Nairobi CBD Business Directory - Automated Account Creation<br>
              If you didn't expect this email, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    try {
      await sendEmail(emailContent);
      console.log(`Programmatic welcome email sent to ${merchant.email}`);
    } catch (error) {
      console.error(`Failed to send programmatic welcome email to ${merchant.email}:`, error);
    }
  }

  /**
   * Complete account setup with token
   */
  static async completeAccountSetup(setupToken, newPassword, additionalData = {}) {
    try {
      // Hash the token to compare with stored hash
      const setupTokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');

      // Find merchant with valid setup token
      const merchant = await Merchant.findOne({
        accountSetupToken: setupTokenHash,
        accountSetupExpire: { $gt: Date.now() }
      });

      if (!merchant) {
        throw new Error('Invalid or expired setup token');
      }

      // Update password and clear setup token
      merchant.password = newPassword;
      merchant.accountSetupToken = undefined;
      merchant.accountSetupExpire = undefined;
      merchant.onboardingStatus = 'completed';
      merchant.accountSetupDate = new Date();

      // Update additional profile data if provided
      if (additionalData.businessHours) merchant.businessHours = additionalData.businessHours;
      if (additionalData.description) merchant.description = additionalData.description;
      if (additionalData.website) merchant.website = additionalData.website;

      await merchant.save();

      // Send confirmation email
      await this.sendSetupCompleteEmail(merchant);

      return {
        success: true,
        message: 'Account setup completed successfully',
        merchant: {
          id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          verified: merchant.verified
        }
      };

    } catch (error) {
      console.error('Error completing account setup:', error);
      throw error;
    }
  }

  /**
   * Send setup completion confirmation email
   */
  static async sendSetupCompleteEmail(merchant) {
    const emailContent = {
      to: merchant.email,
      subject: '✅ Account Setup Complete - Welcome to Nairobi CBD!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Setup Complete!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Welcome to Nairobi CBD Business Directory</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Congratulations ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your account setup is now complete. You can start managing your business profile 
              and connecting with customers in Nairobi CBD.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/merchant/dashboard" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Go to Dashboard
            </a>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1976d2; margin-top: 0;">🚀 What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your business profile</li>
              <li>Upload high-quality photos</li>
              <li>Set your business hours</li>
              <li>Start receiving customer reviews</li>
            </ul>
          </div>
        </div>
      `
    };

    try {
      await sendEmail(emailContent);
    } catch (error) {
      console.error('Failed to send setup complete email:', error);
    }
  }
}

module.exports = MerchantOnboardingService;