const nodemailer = require('nodemailer');

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
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration (use services like SendGrid, AWS SES, etc.)
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Development configuration (using Ethereal for testing)
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
          pass: process.env.EMAIL_PASS || 'ethereal.pass'
        }
      });
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Nairobi CBD Directory'} <${process.env.EMAIL_FROM || 'noreply@nairobicbd.com'}>`,
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

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : null
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send merchant welcome email
   */
  async sendMerchantWelcome(merchantData, credentials, setupUrl) {
    const emailOptions = {
      to: merchantData.email,
      subject: '🎉 Welcome to Nairobi CBD Business Directory!',
      html: this.getMerchantWelcomeTemplate(merchantData, credentials, setupUrl)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email, resetUrl, userType = 'user') {
    const emailOptions = {
      to: email,
      subject: '🔐 Password Reset Request - Nairobi CBD',
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
      subject: '✅ Business Verification Required - Nairobi CBD',
      html: this.getVerificationTemplate(merchantData, verificationUrl)
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