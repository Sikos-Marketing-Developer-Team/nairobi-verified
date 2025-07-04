#!/bin/bash

# Nairobi Verified Admin Dashboard Start Script

echo "🔐 Starting Nairobi Verified Admin Dashboard..."
echo ""

# Check if we're in the right directory
if [ ! -d "admin" ]; then
    echo "❌ Error: admin directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Navigate to admin directory
cd admin

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing admin dashboard dependencies..."
    npm install
    echo ""
fi

# Check if admin user exists in backend
echo "🔍 Checking admin user setup..."
cd ../backend
if [ -f "scripts/createAdminUser.js" ]; then
    echo "👤 Creating admin user if not exists..."
    node scripts/createAdminUser.js
    echo ""
else
    echo "⚠️  Warning: Admin user creation script not found"
fi

# Go back to admin directory
cd ../admin

# Start the admin dashboard
echo "🚀 Starting admin dashboard on http://localhost:3001"
echo ""
echo "📋 Admin Login Credentials:"
echo "   Email: admin@nairobiverfied.com"
echo "   Password: admin123"
echo ""
echo "🚨 IMPORTANT: Change the default password after first login!"
echo ""

# Start the development server
npm run dev
