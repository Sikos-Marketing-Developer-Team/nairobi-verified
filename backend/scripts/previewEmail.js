#!/usr/bin/env node

/**
 * Preview Welcome Email for Merchants
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs').promises;
const { client } = require('../utils/metrics'); // MONITORING: Import client for script-local metrics

// MONITORING: Script-specific counter
const previewGeneratedCounter = new client.Counter({
  name: 'email_previews_generated_total',
  help: 'Total email previews generated'
});

/**
 * Generate email preview HTML
 */
function generateEmailPreview() {
  // Sample merchant data for preview
  const merchant = {
    businessName: "Amini Electronics",
    email: "bashkasiraaj@gmail.com",
    internalId: "NAIROBI-CBD-001",
    _id: "sample123"
  };

  const credentials = {
    tempPassword: "BDysO0!BGwH1"
  };

  const setupToken = "2537fa59122569a8d916ca3ae8dae61e51f07615b6a5c1a9139ae3e8bbb729d2";
  const setupUrl = `${process.env.FRONTEND_URL || 'https://yoursite.com'}/merchant/account-setup/${setupToken}`;
  const loginUrl = `${process.env.FRONTEND_URL || 'https://yoursite.com'}/auth?merchant=true`;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Nairobi CBD Business Directory</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
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
                    🆔 Your Internal ID: ${merchant.internalId}
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
                📱 WhatsApp: 0790120841 / 0116003008<br>
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
</body>
</html>
  `;
}

/**
 * Save email preview to file
 */
async function createEmailPreview() {
  try {
    const emailHtml = generateEmailPreview();
    const previewFile = path.join(__dirname, '../data/email-preview.html');
    
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(path.join(__dirname, '../data'), { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    await fs.writeFile(previewFile, emailHtml);
    
    console.log('📧 EMAIL PREVIEW GENERATED');
    console.log('=========================');
    console.log(`📁 File saved to: ${previewFile}`);
    console.log(`🌐 Open this file in your browser to see the email preview`);
    console.log(`📧 This is exactly what merchants will receive tomorrow at 7 AM`);
    console.log('');
    console.log('📋 Email includes:');
    console.log('   ✅ Professional welcome message');
    console.log('   🔑 Login credentials (email + temp password)');
    console.log('   🔗 Account setup link');
    console.log('   📋 Step-by-step next steps');
    console.log('   🎯 Business benefits overview');
    console.log('   📞 Support contact information');
    console.log('   ⏰ Important security notices');

    previewGeneratedCounter.inc(); // MONITORING: Increment preview counter
    console.log(await client.register.metrics()); // MONITORING: Log metrics for script (or push to Pushgateway in prod)

    return previewFile;
    
  } catch (error) {
    console.error('❌ Error creating email preview:', error);
  }
}

// Execute
createEmailPreview();