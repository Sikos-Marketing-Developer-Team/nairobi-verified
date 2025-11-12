#!/bin/bash

# Backend Deployment Script - Category Fix
# This script deploys the category enum fix to production

set -e

echo "🚀 Deploying Category Fix to Backend..."
echo ""

cd "$(dirname "$0")/../backend"

echo "📋 Changes to deploy:"
echo "   ✅ Updated Product model with new category enum"
echo "   ✅ Added /api/products/categories/valid endpoint"
echo "   ✅ Created migration script for existing products"
echo ""

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Commit changes
echo "💾 Committing changes..."
git add models/Product.js
git add controllers/products.js
git add routes/products.js
git add scripts/migrate-product-categories.js

if git diff --staged --quiet; then
    echo "   No changes to commit"
else
    git commit -m "Fix: Update product categories to match frontend

- Updated Product model category enum
- Added Beauty & Cosmetics, Fashion & Apparel, Health & Wellness, Services, Other
- Removed Sports, Books, Automotive
- Added /api/products/categories/valid endpoint
- Created migration script for existing products

Fixes product creation validation error in production"
    echo "   ✅ Changes committed"
fi

echo ""
echo "📤 Pushing to remote..."
git push origin $CURRENT_BRANCH

echo ""
echo "✅ Deployment Steps Complete!"
echo ""
echo "🔄 Next Steps:"
echo "   1. Wait for Render to deploy the changes (usually 2-5 minutes)"
echo "   2. Run the migration script:"
echo "      $ node backend/scripts/migrate-product-categories.js"
echo "   3. Test product creation on the live site"
echo ""
echo "🧪 Testing Checklist:"
echo "   [ ] Try creating a product with 'Beauty & Cosmetics' category"
echo "   [ ] Try creating a product with 'Fashion & Apparel' category"
echo "   [ ] Verify existing products still display correctly"
echo "   [ ] Check /api/products/categories/valid endpoint"
echo ""
