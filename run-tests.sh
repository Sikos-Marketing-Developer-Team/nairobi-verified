#!/bin/bash

# Quick Test Runner Script
# Usage: ./run-tests.sh [option]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Nairobi Verified Test Runner${NC}\n"

# Change to backend directory
cd "$(dirname "$0")/backend"

# Function to run tests
run_tests() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}Running ${test_name}...${NC}"
    eval "$test_command"
    echo -e "${GREEN}✅ ${test_name} completed${NC}\n"
}

# Parse command line argument
case "${1:-all}" in
    auth)
        run_tests "Authentication Tests" "npm run test:auth"
        ;;
    products)
        run_tests "Product Management Tests" "npm run test:products"
        ;;
    reviews)
        run_tests "Review System Tests" "npm run test:reviews"
        ;;
    merchants)
        run_tests "Merchant Features Tests" "npm run test:merchants"
        ;;
    watch)
        echo -e "${YELLOW}Starting test watch mode...${NC}"
        npm run test:watch
        ;;
    coverage)
        run_tests "Coverage Report" "npm run test:coverage"
        echo -e "${BLUE}📊 Opening coverage report...${NC}"
        if command -v xdg-open &> /dev/null; then
            xdg-open coverage/lcov-report/index.html
        elif command -v open &> /dev/null; then
            open coverage/lcov-report/index.html
        fi
        ;;
    ci)
        run_tests "CI/CD Tests" "npm run test:ci"
        ;;
    all)
        echo -e "${BLUE}Running complete test suite...${NC}\n"
        npm test
        echo -e "${GREEN}✅ All tests completed${NC}"
        ;;
    help)
        echo "Usage: ./run-tests.sh [option]"
        echo ""
        echo "Options:"
        echo "  auth        - Run authentication tests only"
        echo "  products    - Run product management tests only"
        echo "  reviews     - Run review system tests only"
        echo "  merchants   - Run merchant features tests only"
        echo "  watch       - Run tests in watch mode"
        echo "  coverage    - Generate and view coverage report"
        echo "  ci          - Run tests in CI mode"
        echo "  all         - Run all tests (default)"
        echo "  help        - Show this help message"
        ;;
    *)
        echo -e "${YELLOW}Unknown option: $1${NC}"
        echo "Use './run-tests.sh help' for usage information"
        exit 1
        ;;
esac
