#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping Nairobi Verified Development Environment${NC}"

# Kill backend process
if [ -f "backend/backend_pid.txt" ]; then
    BACKEND_PID=$(cat backend/backend_pid.txt)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
    rm -f backend/backend_pid.txt
fi

# Kill frontend process
if [ -f "frontend_pid.txt" ]; then
    FRONTEND_PID=$(cat frontend_pid.txt)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ Frontend server stopped${NC}"
    fi
    rm -f frontend_pid.txt
fi

# Kill any remaining processes
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo -e "${GREEN}🎉 All servers stopped successfully!${NC}"