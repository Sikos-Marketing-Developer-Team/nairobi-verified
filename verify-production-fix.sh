#!/bin/bash

# Production Deployment Verification Script
# Run this after deploying to verify the fix is working

echo "🔍 Verifying Production Deployment..."
echo ""

FRONTEND_URL="${1:-https://nairobi-verified.onrender.com}"
BACKEND_URL="https://nairobi-verified-backend-4c1b.onrender.com"

echo "📍 Testing URLs:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo ""

# Test 1: Check if backend is responding
echo "🧪 Test 1: Backend Health Check"
if curl -s -f "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    echo "   ✅ Backend is responding"
else
    echo "   ⚠️  Backend health check failed (may not have /health endpoint)"
fi
echo ""

# Test 2: Check backend products endpoint (requires authentication)
echo "🧪 Test 2: Backend Products Endpoint"
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/products")
if [ "$RESPONSE_CODE" = "200" ] || [ "$RESPONSE_CODE" = "401" ]; then
    echo "   ✅ Backend API is accessible (Status: $RESPONSE_CODE)"
else
    echo "   ❌ Backend API issue (Status: $RESPONSE_CODE)"
fi
echo ""

# Test 3: Check if frontend is serving correctly
echo "🧪 Test 3: Frontend Deployment"
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "   ✅ Frontend is deployed and accessible"
else
    echo "   ❌ Frontend deployment issue (Status: $RESPONSE_CODE)"
fi
echo ""

# Test 4: Check CORS headers
echo "🧪 Test 4: CORS Configuration"
CORS_HEADER=$(curl -s -I "$BACKEND_URL/api/products" | grep -i "access-control-allow" | head -1)
if [ -n "$CORS_HEADER" ]; then
    echo "   ✅ CORS headers are configured"
    echo "      $CORS_HEADER"
else
    echo "   ⚠️  CORS headers not detected in simple request"
fi
echo ""

# Manual verification checklist
echo "📋 Manual Verification Checklist:"
echo ""
echo "   Browser Console Checks:"
echo "   ----------------------"
echo "   [ ] Open: $FRONTEND_URL"
echo "   [ ] Open Developer Console (F12)"
echo "   [ ] Log in as a merchant"
echo "   [ ] Look for log: '🌐 API Base URL: $BACKEND_URL/api'"
echo "   [ ] Navigate to Product Management"
echo "   [ ] Check Network tab:"
echo "       - Requests should go to: $BACKEND_URL/api/..."
echo "       - NOT to: $FRONTEND_URL/api/..."
echo "   [ ] Verify products load (check console for '✅ Products fetched')"
echo "   [ ] Try adding a new product with images"
echo "   [ ] Verify no HTML responses in console"
echo ""
echo "   Feature Tests:"
echo "   -------------"
echo "   [ ] Products list loads correctly"
echo "   [ ] Can create new products"
echo "   [ ] Can upload product images"
echo "   [ ] Can update existing products"
echo "   [ ] Can toggle product availability"
echo "   [ ] Can delete products"
echo ""
echo "   Error Checks:"
echo "   ------------"
echo "   [ ] No '✅ Products fetched: <!DOCTYPE html>' errors"
echo "   [ ] No 'Failed to create product' errors"
echo "   [ ] No empty upload responses"
echo "   [ ] Response Content-Type is 'application/json'"
echo ""

echo "✨ Verification script complete!"
echo ""
echo "💡 Tips:"
echo "   - If issues persist, check browser Network tab"
echo "   - Verify environment variables are set correctly"
echo "   - Check for any Cloudflare caching issues"
echo "   - Ensure cookies are being sent (withCredentials)"
echo ""
