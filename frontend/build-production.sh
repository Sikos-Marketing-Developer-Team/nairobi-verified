#!/bin/bash

# Frontend Production Build and Deploy Script
# This script ensures the correct API URL is used in production

set -e

echo "🚀 Building Nairobi Verified Frontend for Production..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found. Creating one..."
    cat > .env.production << EOF
# Production Environment Variables
VITE_API_URL=https://nairobi-verified-backend-4c1b.onrender.com/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
EOF
    echo "✅ Created .env.production"
fi

# Display environment configuration
echo "📋 Environment Configuration:"
echo "   VITE_API_URL=$(grep VITE_API_URL .env.production | cut -d '=' -f2)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Clean previous build
if [ -d "dist" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf dist
    echo ""
fi

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not created."
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📊 Build Statistics:"
echo "   Total files: $(find dist -type f | wc -l)"
echo "   Build size: $(du -sh dist | cut -f1)"
echo ""

# Display next steps
echo "🎯 Next Steps:"
echo "   1. Deploy the 'dist' folder to your hosting service"
echo "   2. Ensure environment variables are set:"
echo "      - VITE_API_URL=https://nairobi-verified-backend-4c1b.onrender.com/api"
echo "   3. Test the deployment:"
echo "      - Open browser dev console"
echo "      - Look for: '🌐 API Base URL: https://nairobi-verified-backend-4c1b.onrender.com/api'"
echo "      - Verify products load correctly for merchants"
echo ""
echo "🔍 Deployment Verification:"
echo "   - Check Network tab: requests should go to backend domain"
echo "   - Check Response: should be JSON, not HTML"
echo "   - Test merchant product management features"
echo ""

# Optional: Create a zip file for manual deployment
if command -v zip &> /dev/null; then
    echo "📦 Creating deployment archive..."
    cd dist
    zip -r ../dist.zip . > /dev/null 2>&1
    cd ..
    echo "   Created: dist.zip ($(du -sh dist.zip | cut -f1))"
    echo ""
fi

echo "✨ All done! Your frontend is ready for production deployment."
