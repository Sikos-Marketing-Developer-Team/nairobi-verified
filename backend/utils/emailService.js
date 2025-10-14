const nodemailer = require('nodemailer');
const { EMAIL_CONFIG } = require('../config/constants');
const { emailSentCounter, emailFailedCounter, emailSendDuration } = require('./metrics'); // MONITORING: Import metrics

/**
 * Email Service for sending various types of emails
 */
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter based on environment
   */
  createTransporter() {
    // Always use Gmail for email sending (both production and development)
    return nodemailer.createTransport({
      service: EMAIL_CONFIG.SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Send email
   * @param {Object} options - Email options
   */
  async sendEmail(options) {
    const end = emailSendDuration.startTimer(); // MONITORING: Start timer
    try {
      const mailOptions = {
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent successfully!');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      emailSentCounter.inc({ type: options.subject.toLowerCase().includes('welcome') ? 'welcome' : 'other' }); // MONITORING: Increment sent
      end(); // MONITORING: Record duration

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : null
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      emailFailedCounter.inc({ type: options.subject.toLowerCase().includes('welcome') ? 'welcome' : 'other', error_code: error.code || 'unknown' }); // MONITORING: Increment failed
      end(); // MONITORING: Record duration
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send bulk emails in parallel
   * @param {Array} emailOptionsArray - Array of email options
   */
  async sendBulkEmails(emailOptionsArray) {
    try {
      const emailPromises = emailOptionsArray.map(options => this.sendEmail(options));
      return await Promise.all(emailPromises);
    } catch (error) {
      throw error; // Re-throw the error from sendEmail
    }
  }

  /**
   * Send merchant welcome email
   */
  async sendMerchantWelcome(merchantData, credentials, setupUrl) {
    const emailOptions = {
      to: merchantData.email,
      subject: EMAIL_CONFIG.SUBJECTS.WELCOME,
      html: this.getMerchantWelcomeTemplate(merchantData, credentials, setupUrl)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send user welcome email
   */
  async sendUserWelcome(userData) {
    const emailOptions = {
      to: userData.email,
      subject: 'Welcome to Nairobi Verified!',
      html: this.getUserWelcomeTemplate(userData)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email, resetUrl, userType = 'user') {
    const emailOptions = {
      to: email,
      subject: EMAIL_CONFIG.SUBJECTS.PASSWORD_RESET,
      html: this.getPasswordResetTemplate(email, resetUrl, userType)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(merchantData, verificationUrl) {
    const emailOptions = {
      to: merchantData.email,
      subject: EMAIL_CONFIG.SUBJECTS.VERIFICATION,
      html: this.getVerificationTemplate(merchantData, verificationUrl)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send admin notification about new merchant registration
   */
  async sendAdminMerchantNotification(merchantData) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nairobiverified.com';
    
    const emailOptions = {
      to: adminEmail,
      subject: '🏪 New Merchant Registration - Nairobi Verified',
      html: this.getAdminMerchantNotificationTemplate(merchantData)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send merchant registration confirmation email
   */
  async sendMerchantRegistrationConfirmation(merchantData) {
    const emailOptions = {
      to: merchantData.email,
      subject: '🏪 Registration Received - Profile Under Review | Nairobi Verified',
      html: this.getMerchantRegistrationConfirmationTemplate(merchantData)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Merchant welcome email template
   */
  getMerchantWelcomeTemplate(merchantData, credentials, setupUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nairobi CBD!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business account is ready</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${merchantData.businessName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your merchant account has been created successfully. You can now access your dashboard 
            and start managing your business profile.
          </p>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1976d2; margin-top: 0;">🔐 Your Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${credentials.email}</p>
          <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; color: #d32f2f; font-weight: bold;">${credentials.tempPassword}</code></p>
          <p style="color: #f57c00; font-size: 14px; margin-top: 15px;">
            ⚠️ <strong>Important:</strong> Please change this password after your first login.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🚀 Complete Account Setup
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Nairobi CBD Business Directory | Connecting Businesses with Customers
          </p>
        </div>
      </div>
    `;
  }

  /**
   * User welcome email template
   */
  getUserWelcomeTemplate(userData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nairobi Verified!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your account is ready to explore</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userData.firstName} ${userData.lastName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining Nairobi Verified! Your account has been created successfully. 
            You can now explore verified merchants, discover great products, and enjoy a safe shopping experience.
          </p>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #2e7d32; margin-top: 0;">🌟 What you can do now:</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li>Browse verified merchants and products</li>
            <li>Add items to your favorites</li>
            <li>Leave reviews for merchants</li>
            <li>Get personalized recommendations</li>
            <li>Enjoy secure and verified shopping</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            🛍️ Start Exploring
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Nairobi Verified | Connecting You with Trusted Merchants
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Merchant registration confirmation email template
   */
  getMerchantRegistrationConfirmationTemplate(merchantData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏪 Registration Received!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business profile is under review</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${merchantData.businessName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering your business with Nairobi Verified! We've received your application 
            and our verification team is now reviewing your business profile.
          </p>
        </div>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ff9800;">
          <h3 style="color: #ef6c00; margin-top: 0;">📋 What happens next?</h3>
          <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li><strong>Document Review</strong> - Our team will verify your business registration and documents</li>
            <li><strong>Profile Verification</strong> - We'll confirm your business details and authenticity</li>
            <li><strong>Account Activation</strong> - Once approved, you'll receive login credentials via email</li>
            <li><strong>Dashboard Access</strong> - Start managing your business profile and products</li>
          </ol>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #2e7d32; margin-top: 0;">⏱️ Review Timeline</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            <strong>Business Category:</strong> ${merchantData.businessType}<br>
            <strong>Expected Review Time:</strong> 1-3 business days<br>
            <strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">Under Review</span>
          </p>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1976d2; margin-top: 0;">📞 Need Help?</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            If you have any questions about the verification process, please contact our support team:<br>
            <strong>Email:</strong> support@nairobiverified.com<br>
            <strong>Phone:</strong> +254 700 000 000
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Nairobi Verified | Building Trust in Local Business
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Password reset email template
   */
  getPasswordResetTemplate(email, resetUrl, userType) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f44336; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Reset your ${userType} account password</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset for your account: <strong>${email}</strong>
          </p>
          <p style="color: #666; line-height: 1.6;">
            Click the button below to reset your password. This link will expire in 10 minutes.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #ef6c00; margin: 0; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Nairobi CBD Business Directory Security Team
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Verification email template
   */
  getVerificationTemplate(merchantData, verificationUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ff9800; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Verification Required</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Complete your business verification</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${merchantData.businessName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            To complete your business profile and gain customer trust, please verify your business 
            by uploading the required documents.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Complete Verification
          </a>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px;">
          <h3 style="color: #2e7d32; margin-top: 0;">📋 Required Documents</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Business registration certificate</li>
            <li>Valid ID document</li>
            <li>Utility bill or proof of address</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Admin notification template for new merchant registrations
   */
  getAdminMerchantNotificationTemplate(merchantData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏪 New Merchant Registration</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">A new business has registered on Nairobi Verified</p>
        </div>

        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Business Details</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Business Name:</strong> 
            <span style="color: #6b7280;">${merchantData.businessName}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Business Type:</strong> 
            <span style="color: #6b7280;">${merchantData.businessType}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Email:</strong> 
            <span style="color: #6b7280;">${merchantData.email}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Phone:</strong> 
            <span style="color: #6b7280;">${merchantData.phone}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Address:</strong> 
            <span style="color: #6b7280;">${merchantData.address || 'Not provided'}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Year Established:</strong> 
            <span style="color: #6b7280;">${merchantData.yearEstablished || 'Not provided'}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Website:</strong> 
            <span style="color: #6b7280;">${merchantData.website || 'Not provided'}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Registration Date:</strong> 
            <span style="color: #6b7280;">${new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
          <h3 style="color: #92400e; margin-top: 0;">⚠️ Action Required</h3>
          <p style="color: #78350f; margin-bottom: 15px;">This merchant requires verification. Please review their application and documents when submitted.</p>
          <ul style="color: #78350f; line-height: 1.8;">
            <li>Review business information</li>
            <li>Verify documents when uploaded</li>
            <li>Approve or reject the application</li>
            <li>Send verification status to merchant</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.ADMIN_URL || 'http://localhost:3001'}/merchants" 
             style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            📋 Review in Admin Panel
          </a>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
          <p>Nairobi Verified Admin System</p>
          <p>This is an automated notification email.</p>
        </div>
      </div>
    `;
  }
}

// Export singleton instance
const emailService = new EmailService();

// Export the sendEmail function for backward compatibility
const sendEmail = (options) => emailService.sendEmail(options);

module.exports = {
  EmailService,
  emailService,
  sendEmail
};