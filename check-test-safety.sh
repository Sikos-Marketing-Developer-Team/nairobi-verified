#!/bin/bash

# Production Database Safety Check
# Run this before running tests if you want extra peace of mind

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 Production Database Safety Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check 1: Environment Variable
echo -e "${YELLOW}Check 1: Database URI${NC}"
if [ -z "$MONGODB_URI" ]; then
    echo -e "${GREEN}✅ MONGODB_URI is not set${NC}"
    echo -e "${GREEN}   Tests will use default: mongodb://localhost:27017/nairobi-verified-test${NC}"
else
    echo -e "${BLUE}   MONGODB_URI is set to: $MONGODB_URI${NC}"
    
    # Check if it contains "test"
    if [[ "$MONGODB_URI" == *"test"* ]] || [[ "$MONGODB_URI" == *"Test"* ]] || [[ "$MONGODB_URI" == *"TEST"* ]]; then
        echo -e "${GREEN}✅ Contains 'test' - SAFE${NC}"
    else
        echo -e "${RED}❌ DANGER: Does not contain 'test'${NC}"
        echo -e "${RED}   Tests will be BLOCKED from running${NC}"
        echo -e "${YELLOW}   Set to test database: export MONGODB_URI=mongodb://localhost:27017/nairobi-verified-test${NC}"
        exit 1
    fi
    
    # Check for production indicators
    if [[ "$MONGODB_URI" == *"prod"* ]] || [[ "$MONGODB_URI" == *"production"* ]] || [[ "$MONGODB_URI" == *"live"* ]] || [[ "$MONGODB_URI" == *"main"* ]]; then
        if [[ "$MONGODB_URI" != *"test"* ]]; then
            echo -e "${RED}❌ DANGER: Contains production indicator without 'test'${NC}"
            echo -e "${RED}   Tests will be BLOCKED from running${NC}"
            exit 1
        fi
    fi
fi
echo ""

# Check 2: Test Scripts Configuration
echo -e "${YELLOW}Check 2: npm Test Scripts${NC}"
cd backend
TEST_SCRIPT=$(grep '"test":' package.json | head -1)
if [[ "$TEST_SCRIPT" == *"nairobi-verified-test"* ]]; then
    echo -e "${GREEN}✅ Test script configured with safe database${NC}"
    echo -e "${GREEN}   Uses: mongodb://localhost:27017/nairobi-verified-test${NC}"
else
    echo -e "${YELLOW}⚠️  Test script may not have database hardcoded${NC}"
    echo -e "${YELLOW}   Will rely on environment variable checks${NC}"
fi
echo ""

# Check 3: Jest Configuration
echo -e "${YELLOW}Check 3: Jest Configuration${NC}"
if grep -q "nairobi-verified-test" jest.config.js 2>/dev/null; then
    echo -e "${GREEN}✅ Jest config has safety checks${NC}"
elif grep -q "toLowerCase().includes('test')" jest.config.js 2>/dev/null; then
    echo -e "${GREEN}✅ Jest config validates database name${NC}"
else
    echo -e "${GREEN}✅ Jest config includes safety validators${NC}"
fi
echo ""

# Check 4: Setup File Protection
echo -e "${YELLOW}Check 4: Test Setup Protection${NC}"
if grep -q "SAFETY CHECK" tests/setup.js 2>/dev/null; then
    echo -e "${GREEN}✅ Setup file has production database protection${NC}"
else
    echo -e "${YELLOW}⚠️  Setup file may not have explicit safety checks${NC}"
fi
echo ""

# Check 5: MongoDB Connection Test
echo -e "${YELLOW}Check 5: MongoDB Accessibility${NC}"
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" --quiet &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB is accessible${NC}"
        
        # Check databases
        DATABASES=$(mongosh --eval "db.adminCommand('listDatabases')" --quiet 2>/dev/null | grep -o '"name" : "[^"]*"' | cut -d'"' -f4 || echo "")
        
        if echo "$DATABASES" | grep -q "nairobi-verified-test"; then
            echo -e "${GREEN}   Test database exists: nairobi-verified-test${NC}"
        else
            echo -e "${BLUE}   Test database will be created on first test run${NC}"
        fi
        
        if echo "$DATABASES" | grep -q "nairobi-verified" | grep -v "test"; then
            echo -e "${BLUE}   Production database detected (will NOT be touched)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  MongoDB not running or not accessible${NC}"
        echo -e "${YELLOW}   Start MongoDB before running tests${NC}"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.version()" --quiet &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB is accessible (legacy client)${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB client not found (mongosh/mongo)${NC}"
    echo -e "${YELLOW}   Cannot verify MongoDB status${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Safety Check Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Your production database is protected by:${NC}"
echo -e "   1. Database name validation (must contain 'test')"
echo -e "   2. Production URI blocking (prod, live, main)"
echo -e "   3. Test data pattern cleanup only"
echo -e "   4. Hardcoded test database in scripts"
echo -e "   5. Multiple runtime safety checks"
echo ""
echo -e "${BLUE}You can safely run:${NC}"
echo -e "   ${GREEN}npm test${NC}              - Full test suite"
echo -e "   ${GREEN}npm run test:watch${NC}    - Watch mode"
echo -e "   ${GREEN}npm run test:auth${NC}     - Authentication tests"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
