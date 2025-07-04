#!/bin/bash

# Nairobi Verified - Production Deployment Script
# This script prepares the application for production deployment

echo "🚀 Nairobi Verified - Production Deployment Preparation"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔍 Running type check..."
npx tsc --noEmit

echo "🏗️  Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Production build successful!"
    echo ""
    echo "📊 Build Summary:"
    echo "=================="
    ls -lah dist/
    echo ""
    echo "📁 Deployment files ready in ./dist/"
    echo ""
    echo "🌐 Next Steps:"
    echo "1. Upload ./dist/ folder to your frontend hosting (Vercel, Netlify, etc.)"
    echo "2. Deploy backend/ folder to your backend hosting (Render, Railway, etc.)"
    echo "3. Update environment variables in production"
    echo "4. Test your live deployment"
    echo ""
    echo "📖 See DEPLOYMENT_FIX_GUIDE.md for detailed instructions"
    echo ""
    echo "🎉 Your Nairobi Verified application is ready for production!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
