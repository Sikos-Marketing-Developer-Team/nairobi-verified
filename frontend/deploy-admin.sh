#!/bin/bash

# Nairobi Verified Admin Dashboard Deployment Script
# This script builds and deploys the admin dashboard separately for security

set -e

echo "🔐 Building Nairobi Verified Admin Dashboard..."

# Navigate to admin directory
cd admin

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the admin dashboard
echo "🏗️  Building admin dashboard..."
npm run build

echo "✅ Admin dashboard build complete!"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Upload the 'dist' folder to your admin hosting service"
echo "2. Configure your web server to serve the admin dashboard"
echo "3. Set up proper SSL certificates"
echo "4. Configure access restrictions (IP whitelist, VPN, etc.)"
echo ""
echo "🚨 Security Reminders:"
echo "- Deploy to a separate domain/subdomain (e.g., admin.nairobiverfied.com)"
echo "- Implement IP whitelisting or VPN access"
echo "- Use strong admin passwords and enable 2FA when available"
echo "- Monitor admin access logs regularly"
echo "- Keep the admin dashboard updated"
echo ""
echo "📁 Build output location: admin/dist/"
