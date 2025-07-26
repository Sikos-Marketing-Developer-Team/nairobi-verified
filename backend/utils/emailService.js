const nodemailer = require('nodemailer');
const { EMAIL_CONFIG } = require('../config/constants');

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
    // Production: Use configured email service (e.g., SendGrid, AWS SES)
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: EMAIL_CONFIG.SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
    // Development: Use Ethereal for testing
    return nodemailer.createTransport({
      host: EMAIL_CONFIG.DEV_HOST,
      port: EMAIL_CONFIG.DEV_PORT,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.pass',
      },
    });
  }

  /**
   * Send a single email
   * @param {Object} emailOptions - Email options (to, subject, html, text)
   */
  async sendEmail(emailOptions) {
    try {
      const mailOptions = {
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent successfully!');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : null,
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send multiple emails in parallel
   * @param {Array} emailOptionsArray - Array of email options
   */
  async sendBulkEmails(emailOptionsArray) {
    return Promise.all(emailOptionsArray.map((emailOptions) => this.sendEmail(emailOptions)));
  }

  /**
   * Send merchant welcome email
   */
  async sendMerchantWelcome(merchantData, credentials, setupUrl) {
    const emailOptions = {
      to: merchantData.email,
      subject: EMAIL_CONFIG.SUBJECTS.WELCOME,
      html: this.getMerchantWelcomeTemplate(merchantData, credentials, setupUrl),
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
      html: this.getPasswordResetTemplate(email, resetUrl, userType),
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
      html: this.getVerificationTemplate(merchantData, verificationUrl),
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
   * Password reset email template
   */
  getPasswordResetTemplate(email, resetUrl, userType) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f44336; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Reset your ${userType} account password</strong>
        </p>
        </div>
        <div style="background: #f8f9fa; padding: 25px; border-radius: 20px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset for your account: <strong>${account.email}</strong>
          </p>
          <p style="color: #666; line-height: 1.6;">
            <pp>Click the link below to reset your password. This link will expire in 10 minutes.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #f44336; color: white; padding: #fff333; padding-right: 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 25px;">
            Reset Password
          </a>
        </div>
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px;">
          <p style="color: #ef6c00; margin-bottom: 0px; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this password reset,
            please ignore this email. Your password will remain unchanged.
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
  getVerificationTemplate(merchant, verificationUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff9800; padding-bottom: 30px solid; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin-bottom: 0px; font-size: 25px;">
✅ Verify Your Business
</h1>
          <p style="color: white; margin: 10px 0px 0px 0px; font-size: 16px;">
Complete your tasks to verify your business
</p>
        </div>
        <div style="background-color: #f8f8fa; padding: 25px 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333333; margin-bottom: 0px;">
Hello, ${merchantData?.businessName || 'Merchant'}!
</h2>
          <p style="color: #666666; line-height: 1.6;">
            To complete your business profile and start building trust with customers,
            please verify your business by uploading your required documents.
          </p>
        </div>
        <div style="text-align: center; margin: 25px 0px;">
          <a href="${verificationUrl}" style="background-color: #007bff; color: 15px white; padding-right: 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-bottom: 25px;">
            Verify Your Business
          </a>
        </div>
        <div style="background-color: #e8f5e9; padding: 20px 10px; border-radius: 8px;">
          <h3 style="color: #2d7d32; margin-bottom: 0px;">
📋 Required Documents
</h3>
          <ul style="color: #666666; line-height: 1.8;">
            <li>Business Registration Certificate</li>
            <li>Valid Photo ID</li>
            <li>Utility Bill or Proof of Address</li>
          </ul>
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
  sendEmail,
};