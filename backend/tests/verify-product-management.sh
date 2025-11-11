#!/bin/bash

# Merchant Product Management Verification Script
# This script checks if all components are properly configured

echo "🔍 MERCHANT PRODUCT MANAGEMENT - VERIFICATION SCRIPT"
echo "===================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Check function
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAIL++))
    fi
}

echo "1. Checking Backend Files..."
echo "----------------------------"

# Check controller
if [ -f "/workspaces/nairobi-verified/backend/controllers/merchantDashboard.js" ]; then
    echo -e "${GREEN}✓${NC} merchantDashboard.js exists"
    ((PASS++))
    
    # Check for key functions
    grep -q "createProduct" /workspaces/nairobi-verified/backend/controllers/merchantDashboard.js
    check "createProduct function exists"
    
    grep -q "updateProduct" /workspaces/nairobi-verified/backend/controllers/merchantDashboard.js
    check "updateProduct function exists"
    
    grep -q "deleteProduct" /workspaces/nairobi-verified/backend/controllers/merchantDashboard.js
    check "deleteProduct function exists"
    
    grep -q "uploadProductImages" /workspaces/nairobi-verified/backend/controllers/merchantDashboard.js
    check "uploadProductImages function exists"
else
    echo -e "${RED}✗${NC} merchantDashboard.js NOT found"
    ((FAIL++))
fi

# Check routes
if [ -f "/workspaces/nairobi-verified/backend/routes/merchantDashboard.js" ]; then
    echo -e "${GREEN}✓${NC} merchantDashboard routes exist"
    ((PASS++))
    
    grep -q "router.post('/products'" /workspaces/nairobi-verified/backend/routes/merchantDashboard.js
    check "POST /products route exists"
    
    grep -q "router.put('/products/:productId'" /workspaces/nairobi-verified/backend/routes/merchantDashboard.js
    check "PUT /products/:productId route exists"
    
    grep -q "router.delete('/products/:productId'" /workspaces/nairobi-verified/backend/routes/merchantDashboard.js
    check "DELETE /products/:productId route exists"
else
    echo -e "${RED}✗${NC} merchantDashboard routes NOT found"
    ((FAIL++))
fi

# Check upload routes
if [ -f "/workspaces/nairobi-verified/backend/routes/uploads.js" ]; then
    echo -e "${GREEN}✓${NC} uploads routes exist"
    ((PASS++))
    
    grep -q "router.post('/products'" /workspaces/nairobi-verified/backend/routes/uploads.js
    check "POST /uploads/products route exists"
else
    echo -e "${RED}✗${NC} uploads routes NOT found"
    ((FAIL++))
fi

echo ""
echo "2. Checking Frontend Files..."
echo "----------------------------"

# Check ProductManagement component
if [ -f "/workspaces/nairobi-verified/frontend/src/pages/merchant/ProductManagement.tsx" ]; then
    echo -e "${GREEN}✓${NC} ProductManagement.tsx exists"
    ((PASS++))
    
    grep -q "handleSubmit" /workspaces/nairobi-verified/frontend/src/pages/merchant/ProductManagement.tsx
    check "handleSubmit function exists"
    
    grep -q "handleImageSelect" /workspaces/nairobi-verified/frontend/src/pages/merchant/ProductManagement.tsx
    check "handleImageSelect function exists"
    
    grep -q "fetchProducts" /workspaces/nairobi-verified/frontend/src/pages/merchant/ProductManagement.tsx
    check "fetchProducts function exists"
else
    echo -e "${RED}✗${NC} ProductManagement.tsx NOT found"
    ((FAIL++))
fi

# Check interfaces
if [ -f "/workspaces/nairobi-verified/frontend/src/interfaces/productmanagement.ts" ] || [ -f "/workspaces/nairobi-verified/frontend/src/interfaces/productmanagement.tsx" ]; then
    echo -e "${GREEN}✓${NC} Product interfaces exist"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Product interfaces might be missing (optional)"
fi

echo ""
echo "3. Checking Dependencies..."
echo "----------------------------"

cd /workspaces/nairobi-verified/backend

# Check for multer
if npm list multer 2>/dev/null | grep -q "multer@"; then
    echo -e "${GREEN}✓${NC} multer installed"
    ((PASS++))
else
    echo -e "${RED}✗${NC} multer NOT installed"
    ((FAIL++))
fi

# Check for cloudinary
if npm list cloudinary 2>/dev/null | grep -q "cloudinary@"; then
    echo -e "${GREEN}✓${NC} cloudinary installed"
    ((PASS++))
else
    echo -e "${RED}✗${NC} cloudinary NOT installed"
    ((FAIL++))
fi

# Check for multer-storage-cloudinary
if npm list multer-storage-cloudinary 2>/dev/null | grep -q "multer-storage-cloudinary@"; then
    echo -e "${GREEN}✓${NC} multer-storage-cloudinary installed"
    ((PASS++))
else
    echo -e "${RED}✗${NC} multer-storage-cloudinary NOT installed"
    ((FAIL++))
fi

echo ""
echo "4. Checking Configuration..."
echo "----------------------------"

# Check .env file
if [ -f "/workspaces/nairobi-verified/backend/.env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    ((PASS++))
    
    if grep -q "CLOUDINARY_CLOUD_NAME" /workspaces/nairobi-verified/backend/.env; then
        echo -e "${GREEN}✓${NC} CLOUDINARY_CLOUD_NAME configured"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} CLOUDINARY_CLOUD_NAME not found in .env"
    fi
    
    if grep -q "CLOUDINARY_API_KEY" /workspaces/nairobi-verified/backend/.env; then
        echo -e "${GREEN}✓${NC} CLOUDINARY_API_KEY configured"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} CLOUDINARY_API_KEY not found in .env"
    fi
    
    if grep -q "CLOUDINARY_API_SECRET" /workspaces/nairobi-verified/backend/.env; then
        echo -e "${GREEN}✓${NC} CLOUDINARY_API_SECRET configured"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} CLOUDINARY_API_SECRET not found in .env"
    fi
else
    echo -e "${RED}✗${NC} .env file NOT found"
    ((FAIL++))
fi

echo ""
echo "5. Checking Database Models..."
echo "----------------------------"

if [ -f "/workspaces/nairobi-verified/backend/models/Product.js" ]; then
    echo -e "${GREEN}✓${NC} Product model exists"
    ((PASS++))
    
    grep -q "images:" /workspaces/nairobi-verified/backend/models/Product.js
    check "Product model has images field"
    
    grep -q "merchant:" /workspaces/nairobi-verified/backend/models/Product.js
    check "Product model has merchant reference"
else
    echo -e "${RED}✗${NC} Product model NOT found"
    ((FAIL++))
fi

echo ""
echo "6. Testing API Endpoints..."
echo "----------------------------"

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend server is running"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Backend server is not running (start with 'npm run dev')"
    echo -e "   ${BLUE}INFO:${NC} Cannot test API endpoints without running server"
fi

echo ""
echo "=================================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================================="
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${RED}Failed:${NC} $FAIL"

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASS * 100 / TOTAL))
    echo -e "Success Rate: $PERCENTAGE%"
    
    if [ $PERCENTAGE -ge 80 ]; then
        echo -e "\n${GREEN}✅ System is ready for testing!${NC}"
        exit 0
    elif [ $PERCENTAGE -ge 60 ]; then
        echo -e "\n${YELLOW}⚠️  System has some issues but may work${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ System has critical issues${NC}"
        exit 1
    fi
else
    echo -e "\n${RED}❌ No tests were run${NC}"
    exit 1
fi
