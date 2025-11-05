const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { EMAIL_CONFIG } = require('../config/constants');
const { emailSentCounter, emailFailedCounter, emailSendDuration } = require('./metrics'); // MONITORING: Import metrics

/**
 * Email Service for sending various types of emails
 * Uses SendGrid API (preferred) with SMTP fallback
 */
class EmailService {
  constructor() {
    // Initialize SendGrid if API key is available
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.useSendGrid = true;
      console.log('📧 Email service initialized with SendGrid');
    } else {
      this.transporter = this.createTransporter();
      this.useSendGrid = false;
      console.log('📧 Email service initialized with Nodemailer (Gmail SMTP)');
    }
  }

  /**
   * Create email transporter with Gmail SMTP (fallback)
   */
  createTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use STARTTLS port
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 45000, // 45 seconds
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 10
    });
  }

  /**
   * Send email using SendGrid or Nodemailer fallback
   * @param {Object} options - Email options
   */
  async sendEmail(options) {
    const end = emailSendDuration.startTimer(); // MONITORING: Start timer
    try {
      if (this.useSendGrid) {
        // Use SendGrid API
        const msg = {
          to: options.to,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
            name: EMAIL_CONFIG.FROM_NAME
          },
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
        };

        const response = await sgMail.send(msg);
        console.log('✅ Email sent via SendGrid to:', options.to);

        emailSentCounter.inc({ type: options.subject.toLowerCase().includes('welcome') ? 'welcome' : 'other' });
        end();

        return {
          success: true,
          messageId: response[0].headers['x-message-id'],
          provider: 'sendgrid'
        };
      } else {
        // Use Nodemailer SMTP fallback
        const mailOptions = {
          from: `${EMAIL_CONFIG.FROM_NAME} <${process.env.EMAIL_USER}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text
        };

        const info = await this.transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully to:', options.to);
        if (process.env.NODE_ENV === 'development') {
          console.log('Message ID:', info.messageId);
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        emailSentCounter.inc({ type: options.subject.toLowerCase().includes('welcome') ? 'welcome' : 'other' });
        end();

        return {
          success: true,
          messageId: info.messageId,
          provider: 'nodemailer'
        };
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      console.error('Error code:', error.code);
      emailFailedCounter.inc({ type: options.subject.toLowerCase().includes('welcome') ? 'welcome' : 'other', error_code: error.code || 'unknown' });
      end();
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
   * Send merchant welcome email (for admin-created accounts)
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
   * Send merchant welcome email (for Google OAuth sign-ins)
   */
  async sendMerchantGoogleWelcome(merchantData) {
    const emailOptions = {
      to: merchantData.email,
      subject: '🎉 Welcome to Nairobi Verified - Complete Your Merchant Profile',
      html: this.getMerchantGoogleWelcomeTemplate(merchantData)
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
   * Merchant welcome email template (for Google OAuth sign-ins)
   * No temporary credentials - welcomes merchant with profile completion guidelines
   */
  getMerchantGoogleWelcomeTemplate(merchantData) {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/dashboard`;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Nairobi Verified!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your merchant journey begins here</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${merchantData.businessName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome to Nairobi Verified! We're excited to have you join our community of trusted merchants. 
            Your account has been successfully created using Google Sign-In, making it easy and secure to access your dashboard.
          </p>
        </div>

        <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #2e7d32; margin-top: 0;">📋 Next Steps to Complete Your Profile</h3>
          <ol style="color: #666; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
            <li><strong>Complete Business Information:</strong> Add your business description, hours of operation, and contact details</li>
            <li><strong>Upload Business Photos:</strong> Add a logo, banner image, and gallery photos to showcase your business</li>
            <li><strong>Submit Verification Documents:</strong> Upload your Business Registration Certificate, ID Document, and Utility Bill</li>
            <li><strong>Set Up Your Products/Services:</strong> Add your offerings with photos and descriptions</li>
            <li><strong>Get Verified:</strong> Once documents are reviewed, you'll receive a verified badge</li>
          </ol>
        </div>

        <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #ef6c00; margin-top: 0;">📄 Document Requirements</h3>
          <p style="color: #666; line-height: 1.6; margin: 10px 0;">
            To become a verified merchant, please prepare and upload the following documents:
          </p>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
            <li><strong>Business Registration Certificate</strong> - Valid government-issued registration</li>
            <li><strong>National ID or Passport</strong> - Owner's identification document</li>
            <li><strong>Utility Bill</strong> - Recent bill (electricity, water, or internet) showing business address</li>
          </ul>
          <p style="color: #e65100; margin: 10px 0; font-size: 14px;">
            <strong>Note:</strong> All documents must be clear, legible, and up-to-date.
          </p>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1976d2; margin-top: 0;">✨ What You Get as a Verified Merchant</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
            <li>🎖️ <strong>Verified Badge</strong> - Build trust with customers</li>
            <li>🔍 <strong>Priority Listing</strong> - Appear higher in search results</li>
            <li>📊 <strong>Analytics Dashboard</strong> - Track views, clicks, and engagement</li>
            <li>💬 <strong>Customer Reviews</strong> - Receive and respond to customer feedback</li>
            <li>📱 <strong>Mobile Friendly</strong> - Reach customers on any device</li>
            <li>🌟 <strong>Featured Opportunities</strong> - Qualify for homepage features</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            🚀 Go to Your Dashboard
          </a>
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #333; margin-top: 0;">💡 Tips for Success</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
            <li>Use high-quality photos that showcase your business professionally</li>
            <li>Write detailed descriptions to help customers find you</li>
            <li>Keep your business hours and contact information up-to-date</li>
            <li>Respond promptly to customer inquiries and reviews</li>
            <li>Complete verification to unlock all features and boost visibility</li>
          </ul>
        </div>

        <div style="background: #fce4ec; border-left: 4px solid #e91e63; padding: 15px; margin-bottom: 25px;">
          <p style="color: #c2185b; margin: 0; font-size: 14px; line-height: 1.6;">
            <strong>📞 Need Help?</strong><br>
            Our support team is here to assist you with any questions:<br>
            <strong>Email:</strong> support@nairobiverified.com<br>
            <strong>Phone:</strong> +254 700 000 000
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; line-height: 1.5;">
            <strong>Nairobi Verified</strong><br>
            Connecting Businesses with Customers<br>
            Building Trust in Local Business
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Merchant welcome email template (for admin-created accounts with credentials)
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