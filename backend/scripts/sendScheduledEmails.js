#!/usr/bin/env node

/**
 * Send Scheduled Welcome Emails
 * Run this script tomorrow at 7 AM to send all queued welcome emails
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs').promises;
const { sendEmail } = require('../utils/emailService');

/**
 * Load email queue from file
 */
async function loadEmailQueue() {
  try {
    const queueFile = path.join(__dirname, '../data/scheduled-emails.json');
    const queueData = await fs.readFile(queueFile, 'utf8');
    return JSON.parse(queueData);
  } catch (error) {
    console.error('❌ Failed to load email queue:', error.message);
    return null;
  }
}

/**
 * Send welcome email for programmatically created merchant
 */
async function sendWelcomeEmail(merchant, credentials, setupToken) {
  const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/account-setup/${setupToken}`;
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?merchant=true`;

  const emailContent = {
    to: merchant.email,
    subject: '🎉 Welcome to Nairobi CBD Business Directory - Your Account is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Nairobi CBD!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business account has been created</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${merchant.businessName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Congratulations! Your business has been successfully registered in the Nairobi CBD Business Directory. 
            You can now access your merchant dashboard and start connecting with customers in Nairobi's business district.
          </p>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="color: #2e7d32; margin: 0; font-weight: bold;">
              🆔 Your Internal ID: ${merchant.internalId || 'NAIROBI-CBD-' + merchant._id.toString().slice(-3).toUpperCase()}
            </p>
          </div>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #2e7d32; margin-top: 0;">🔐 Your Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${merchant.email}</p>
          <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; color: #d32f2f; font-weight: bold;">${credentials.tempPassword}</code></p>
          <p style="color: #f57c00; font-size: 14px; margin-top: 15px;">
            ⚠️ <strong>Security Notice:</strong> Please change this password immediately after your first login.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
            🚀 Complete Account Setup
          </a>
          <a href="${loginUrl}" style="background: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
            🔑 Login to Dashboard
          </a>
        </div>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #ef6c00; margin-top: 0;">📋 Next Steps</h3>
          <ol style="color: #666; line-height: 1.8;">
            <li><strong>Complete Setup:</strong> Click the setup button above to finish your account</li>
            <li><strong>Set New Password:</strong> Replace the temporary password with your own secure password</li>
            <li><strong>Update Business Info:</strong> Add your business description, photos, and details</li>
            <li><strong>Set Business Hours:</strong> Configure when your business is open</li>
            <li><strong>Upload Documents:</strong> Complete verification for verified badge</li>
            <li><strong>Start Getting Customers:</strong> Your business will appear in search results</li>
          </ol>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1976d2; margin-top: 0;">🎯 Your Business Benefits</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>📍 <strong>Prime Location Listing:</strong> Featured in Nairobi CBD directory</li>
            <li>🔍 <strong>Search Visibility:</strong> Customers can easily find your business</li>
            <li>⭐ <strong>Customer Reviews:</strong> Build trust with customer feedback</li>
            <li>📊 <strong>Analytics Dashboard:</strong> Track visits and customer engagement</li>
            <li>📸 <strong>Photo Gallery:</strong> Showcase your products and services</li>
            <li>📱 <strong>Mobile Optimization:</strong> Reach customers on all devices</li>
            <li>✅ <strong>Verification Badge:</strong> Build customer trust and credibility</li>
          </ul>
        </div>

        <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #7b1fa2; margin-top: 0;">📞 Need Help?</h3>
          <p style="color: #666; line-height: 1.6;">
            Our support team is here to help you get started. If you have any questions about setting up 
            your account or using the platform, please don't hesitate to contact us.
          </p>
          <p style="color: #666;">
            📧 Email: support@nairobicbd.directory<br>
            📱 WhatsApp: +254 700 000 000<br>
            🕒 Support Hours: Monday - Friday, 8 AM - 6 PM
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fafafa; border-radius: 8px;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            <strong>⏰ Setup link expires in 14 days</strong><br>
            Account created via automated import<br>
            Created on: ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; line-height: 1.5;">
            This email was sent to ${merchant.email}<br>
            Nairobi CBD Business Directory | Connecting Businesses with Customers<br>
            Building the digital marketplace for Nairobi's Central Business District
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            If you didn't expect this email or believe it was sent in error, please contact our support team.
          </p>
        </div>
      </div>
    `
  };

  return sendEmail(emailContent);
}

/**
 * Send all queued emails
 */
async function sendQueuedEmails() {
  console.log('📧 SENDING SCHEDULED WELCOME EMAILS');
  console.log('===================================\n');

  const queueData = await loadEmailQueue();
  
  if (!queueData) {
    console.log('❌ No email queue found. Please run the merchant creation script first.');
    return;
  }

  console.log(`📅 Queue created: ${new Date(queueData.created).toLocaleString()}`);
  console.log(`📬 Total emails to send: ${queueData.emails.length}`);
  console.log(`⏰ Scheduled time: ${queueData.scheduledTime}\n`);

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < queueData.emails.length; i++) {
    const emailData = queueData.emails[i];
    const { merchant, credentials, setupToken } = emailData;

    try {
      console.log(`📤 Sending email ${i + 1}/${queueData.emails.length}: ${merchant.businessName}`);
      
      await sendWelcomeEmail(merchant, credentials, setupToken);
      
      results.push({
        success: true,
        business: merchant.businessName,
        email: merchant.email,
        internalId: merchant.internalId
      });

      successCount++;
      console.log(`✅ Sent to: ${merchant.email}`);

      // Add delay between emails to avoid overwhelming the email service
      if (i < queueData.emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }

    } catch (error) {
      console.error(`❌ Failed to send to ${merchant.businessName}:`, error.message);
      
      results.push({
        success: false,
        business: merchant.businessName,
        email: merchant.email,
        error: error.message,
        internalId: merchant.internalId
      });

      failureCount++;
    }
  }

  // Display final results
  console.log('\n🎯 EMAIL DELIVERY SUMMARY');
  console.log('========================');
  console.log(`✅ Successfully sent: ${successCount}`);
  console.log(`❌ Failed to send: ${failureCount}`);
  console.log(`📊 Total emails: ${queueData.emails.length}`);

  if (failureCount > 0) {
    console.log('\n❌ FAILED DELIVERIES:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.business} (${r.email}): ${r.error}`);
      });
  }

  if (successCount > 0) {
    console.log('\n✅ SUCCESSFUL DELIVERIES:');
    results
      .filter(r => r.success)
      .forEach((r, index) => {
        console.log(`   ${index + 1}. ${r.business} (${r.internalId}) - ${r.email}`);
      });
  }

  // Archive the queue file
  try {
    const archiveFile = path.join(__dirname, '../data/sent-emails-' + Date.now() + '.json');
    await fs.writeFile(archiveFile, JSON.stringify({
      ...queueData,
      sentAt: new Date(),
      results: results
    }, null, 2));
    
    // Remove the original queue file
    await fs.unlink(path.join(__dirname, '../data/scheduled-emails.json'));
    
    console.log('\n📁 Email queue archived and cleaned up');
  } catch (error) {
    console.log('\n⚠️  Warning: Could not archive email queue:', error.message);
  }

  console.log('\n🎉 EMAIL DELIVERY COMPLETE!');
  console.log('===========================');
  console.log('📧 All welcome emails have been sent');
  console.log('🔗 Merchants can now use their setup links');
  console.log('📊 Monitor merchant account completions');
  
  return results;
}

/**
 * Main execution function
 */
async function main() {
  try {
    const currentTime = new Date();
    console.log(`🕐 Current time: ${currentTime.toLocaleString()}`);
    console.log('Starting scheduled email delivery...\n');

    const results = await sendQueuedEmails();

    console.log('\n📈 NEXT STEPS:');
    console.log('===============');
    console.log('1. Monitor merchant setup completions');
    console.log('2. Follow up with any failed email deliveries');
    console.log('3. Check for merchants completing their accounts');
    console.log('4. Update any accounts flagged as needing information updates');

  } catch (error) {
    console.error('💥 EMAIL DELIVERY ERROR:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  sendQueuedEmails,
  sendWelcomeEmail
};