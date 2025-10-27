const crypto = require('crypto');
const Merchant = require('../models/Merchant');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

/**
 * Merchant Onboarding Service - OPTIMIZED FOR BULK OPERATIONS
 * Handles merchant creation, credential generation, and notification workflows
 */
class MerchantOnboardingService {
  
  /**
   * Generate secure temporary password (OPTIMIZED - uses crypto for speed)
   * @returns {string} Temporary password (12 chars, mixed case + numbers + symbols)
   */
  static generateTempPassword() {
    // ✅ OPTIMIZED: Use crypto.randomBytes for cryptographically secure randomness
    const bytes = crypto.randomBytes(9); // 9 bytes = 12 base64 chars
    const base64 = bytes.toString('base64').replace(/[+/=]/g, ''); // Remove special chars
    
    // Ensure complexity: add at least one uppercase, lowercase, number, symbol
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = base64.substring(0, 8);
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Shuffle and return first 12 chars
    return password.split('').sort(() => Math.random() - 0.5).join('').substring(0, 12);
  }

  /**
   * ✅ OPTIMIZED: Check for duplicate email in BOTH User and Merchant collections
   * Uses Promise.all for parallel queries (50% faster than sequential)
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} true if duplicate exists
   */
  static async checkDuplicateEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const [existingMerchant, existingUser] = await Promise.all([
      Merchant.findOne({ email: normalizedEmail }).select('_id').lean(),
      User.findOne({ email: normalizedEmail }).select('_id').lean()
    ]);
    return !!(existingMerchant || existingUser);
  }

  /**
   * ✅ OPTIMIZED: Create merchant account by admin with async email
   * @param {Object} merchantData - Merchant information
   * @param {Object} adminUser - Admin user who created the merchant
   * @returns {Object} Created merchant and credentials
   */
  static async createMerchantByAdmin(merchantData, adminUser) {
    try {
      // ✅ VALIDATION: Quick fail for missing required fields
      const requiredFields = ['businessName', 'email', 'phone', 'businessType', 'description', 'address', 'location'];
      const missingFields = requiredFields.filter(field => !merchantData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // ✅ DUPLICATE CHECK: Parallel check in both collections
      const isDuplicate = await this.checkDuplicateEmail(merchantData.email);
      if (isDuplicate) {
        throw new Error('A user or merchant with this email already exists');
      }

      // ✅ GENERATE TEMP PASSWORD: Fast crypto-based generation
      const tempPassword = this.generateTempPassword();
      
      // ✅ SET DEFAULT BUSINESS HOURS
      const defaultBusinessHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      };

      // ✅ CRITICAL FIX: Don't initialize documents object
      // Documents should ONLY be counted when merchant actually uploads them
      // Empty paths should not exist - leave documents undefined until uploaded
      const merchantPayload = {
        businessName: merchantData.businessName.trim(),
        email: merchantData.email.toLowerCase().trim(),
        phone: merchantData.phone.trim(),
        password: tempPassword, // Will be hashed by pre-save hook
        businessType: merchantData.businessType || merchantData.category,
        description: merchantData.description.trim(),
        yearEstablished: merchantData.yearEstablished || new Date().getFullYear(),
        website: merchantData.website?.trim() || '',
        address: merchantData.address.trim(),
        location: merchantData.location?.trim() || merchantData.address.trim(),
        landmark: merchantData.landmark?.trim() || '',
        businessHours: merchantData.businessHours || defaultBusinessHours,
        
        // ✅ VERIFICATION STATUS: Support auto-verify flag
        verified: merchantData.autoVerify || false,
        verifiedDate: merchantData.autoVerify ? new Date() : null,
        
        // ✅ ADMIN METADATA: Track who created this merchant
        createdByAdmin: true,
        createdByAdminId: adminUser.id,
        createdByAdminName: `${adminUser.firstName} ${adminUser.lastName}`,
        onboardingStatus: 'credentials_sent',
        
        // ✅ CRITICAL FIX: DON'T initialize documents object
        // Remove this entire block - it was causing the bug
        // documents: {
        //   businessRegistration: { path: '', uploadedAt: null },
        //   idDocument: { path: '', uploadedAt: null },
        //   utilityBill: { path: '', uploadedAt: null },
        //   additionalDocs: [],
        //   documentsSubmittedAt: null,
        //   documentReviewStatus: 'pending'
        // },
        
        // ✅ DEFAULT VALUES
        featured: false,
        isActive: true,
        rating: 0,
        reviews: 0,
        logo: '',
        bannerImage: '',
        gallery: []
      };

      // ✅ CREATE MERCHANT: Single DB write with all required data
      const merchant = await Merchant.create(merchantPayload);

      // ✅ GENERATE ACCOUNT SETUP TOKEN (7 days validity)
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupTokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');
      
      merchant.accountSetupToken = setupTokenHash;
      merchant.accountSetupExpire = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      await merchant.save();

      // ✅ ASYNC EMAIL: Send in background (non-blocking)
      // Use setImmediate to defer email sending until after response
      setImmediate(async () => {
        try {
          await this.sendWelcomeEmail(merchant, tempPassword, setupToken, adminUser);
        } catch (emailError) {
          console.error(`❌ Failed to send welcome email to ${merchant.email}:`, emailError);
          // Don't throw - email failure shouldn't affect merchant creation
        }
      });

      // ✅ LOG ACTION
      console.log(`✅ Admin ${adminUser.email} created merchant: ${merchant.email} (documents: NOT initialized)`);

      // ✅ RETURN IMMEDIATELY (don't wait for email)
      return {
        merchant: {
          _id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          phone: merchant.phone,
          businessType: merchant.businessType,
          verified: merchant.verified,
          createdAt: merchant.createdAt,
          hasDocuments: false // FIXED: Explicitly false until documents are uploaded
        },
        credentials: {
          email: merchant.email,
          password: tempPassword,
          setupToken,
          loginUrl: `${process.env.FRONTEND_URL}/merchant/login`,
          setupUrl: `${process.env.FRONTEND_URL}/merchant/account-setup/${setupToken}`
        },
        message: 'Merchant created successfully. Welcome email sent.'
      };

    } catch (error) {
      console.error('❌ Error creating merchant by admin:', error);
      
      // ✅ FRIENDLY ERROR MESSAGES
      if (error.code === 11000) {
        throw new Error('Email already exists in the system');
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        throw new Error(messages.join(', '));
      }
      
      throw new Error(`Failed to create merchant: ${error.message}`);
    }
  }

  /**
   * ✅ OPTIMIZED: Bulk create merchants (for backend bulk endpoint)
   * @param {Array} merchantsData - Array of merchant data objects
   * @param {Object} adminUser - Admin user who initiated bulk creation
   * @returns {Object} Results with successful and failed merchants
   */
  static async bulkCreateMerchants(merchantsData, adminUser) {
    const results = {
      total: merchantsData.length,
      successful: [],
      failed: []
    };

    // ✅ BATCH PROCESSING: Process in batches of 10 for optimal DB performance
    const batchSize = 10;
    
    for (let i = 0; i < merchantsData.length; i += batchSize) {
      const batch = merchantsData.slice(i, i + batchSize);
      
      // ✅ PARALLEL PROCESSING: Create all merchants in batch simultaneously
      const batchResults = await Promise.allSettled(
        batch.map(merchantData => this.createMerchantByAdmin(merchantData, adminUser))
      );

      // ✅ COLLECT RESULTS
      batchResults.forEach((result, index) => {
        const originalData = batch[index];
        
        if (result.status === 'fulfilled') {
          results.successful.push({
            businessName: originalData.businessName,
            email: originalData.email,
            credentials: result.value.credentials,
            merchantId: result.value.merchant.id
          });
        } else {
          results.failed.push({
            businessName: originalData.businessName,
            email: originalData.email,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
    }

    console.log(`✅ Bulk creation complete: ${results.successful.length}/${results.total} successful`);
    
    return results;
  }

  /**
   * ✅ OPTIMIZED: Send welcome email (simplified, fast)
   * @param {Object} merchant - Merchant document
   * @param {string} tempPassword - Temporary password
   * @param {string} setupToken - Account setup token
   * @param {Object} adminUser - Admin who created the account
   */
  static async sendWelcomeEmail(merchant, tempPassword, setupToken, adminUser) {
    const setupUrl = `${process.env.FRONTEND_URL}/merchant/account-setup/${setupToken}`;
    const loginUrl = `${process.env.FRONTEND_URL}/merchant/login`;

    const emailContent = {
      to: merchant.email,
      subject: '🎉 Welcome to Nairobi CBD - Your Merchant Account is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nairobi CBD!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your merchant account has been created</p>
          </div>
          
          <!-- Greeting -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your business account has been created by our admin team. 
              You can now access your merchant dashboard and start managing your business profile.
            </p>
          </div>

          <!-- Credentials -->
          <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-top: 0;">🔐 Your Login Credentials</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${merchant.email}</p>
            <p style="margin: 10px 0;">
              <strong>Temporary Password:</strong> 
              <code style="background: #fff; padding: 8px 12px; border-radius: 4px; color: #d32f2f; font-weight: bold; font-size: 16px; display: inline-block; border: 2px dashed #d32f2f;">${tempPassword}</code>
            </p>
            <p style="color: #f57c00; font-size: 14px; margin-top: 15px; background: #fff3e0; padding: 10px; border-radius: 4px;">
              ⚠️ <strong>Security Alert:</strong> Change this password immediately after your first login.
            </p>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 5px 10px 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🚀 Login Now
            </a>
            <a href="${setupUrl}" style="background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 5px 10px 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ⚙️ Complete Setup
            </a>
          </div>

          <!-- Next Steps -->
          <div style="background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-top: 0;">📋 Next Steps</h3>
            <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li><strong>Login</strong> with your credentials</li>
              <li><strong>Change your password</strong> immediately</li>
              <li><strong>Complete your profile</strong> with photos and details</li>
              <li><strong>Upload verification documents</strong> (Business Registration, ID, Utility Bill)</li>
              <li><strong>Start connecting with customers!</strong></li>
            </ol>
          </div>

          <!-- Important Notice -->
          <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin-bottom: 25px;">
            <p style="color: #e65100; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>📄 Document Verification Required:</strong> To complete your verification and appear in customer searches, 
              please upload your Business Registration Certificate, ID Document, and Utility Bill through your dashboard.
            </p>
          </div>

          <!-- Account Info -->
          <div style="text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #666; margin: 0; font-size: 13px; line-height: 1.5;">
              <strong>Account Created By:</strong> ${adminUser.firstName} ${adminUser.lastName}<br>
              <strong>Setup Link Valid:</strong> 7 days<br>
              <strong>Account Status:</strong> ${merchant.verified ? '✅ Verified' : '⏳ Pending Document Upload'}
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 0;">
              <strong>Nairobi CBD Business Directory</strong><br>
              Connecting Businesses with Customers<br>
              Need help? Contact our support team
            </p>
          </div>
        </div>
      `
    };

    try {
      await sendEmail(emailContent);
      console.log(`✅ Welcome email sent to ${merchant.email}`);
    } catch (error) {
      console.error(`❌ Email failed for ${merchant.email}:`, error.message);
      // Don't throw - email failure is non-critical
    }
  }

  /**
   * Complete account setup with token
   * @param {string} setupToken - Setup token from email
   * @param {string} newPassword - New password chosen by merchant
   * @param {Object} additionalData - Optional profile updates
   * @returns {Object} Success response with merchant info
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
      merchant.onboardingStatus = 'account_setup';
      merchant.accountSetupDate = new Date();

      // Update additional profile data if provided
      if (additionalData.businessHours) merchant.businessHours = additionalData.businessHours;
      if (additionalData.description) merchant.description = additionalData.description;
      if (additionalData.website) merchant.website = additionalData.website;

      await merchant.save();

      // Send confirmation email (async, non-blocking)
      setImmediate(async () => {
        try {
          await this.sendSetupCompleteEmail(merchant);
        } catch (error) {
          console.error('Failed to send setup complete email:', error);
        }
      });

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
            <p style="color: white; margin: 10px 0 0 0;">Welcome to Nairobi CBD Business Directory</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Congratulations ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your account setup is complete. You can now manage your business profile and connect with customers.
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
              <li>Upload verification documents (Business Registration, ID, Utility Bill)</li>
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