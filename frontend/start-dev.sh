#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Nairobi Verified Development Environment${NC}"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Kill existing processes
echo -e "${YELLOW}🔄 Cleaning up existing processes...${NC}"
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Check if MongoDB is running
echo -e "${YELLOW}🔍 Checking MongoDB connection...${NC}"
if ! mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
    echo -e "${RED}❌ MongoDB is not running. Please start MongoDB first.${NC}"
    echo -e "${YELLOW}💡 Try: sudo systemctl start mongod${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MongoDB is running${NC}"

# Start backend
echo -e "${YELLOW}🔧 Starting backend server...${NC}"
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend_pid.txt

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if check_port 5000; then
    echo -e "${GREEN}✅ Backend server started on port 5000${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for details.${NC}"
    cat ../backend.log
    exit 1
fi

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend server...${NC}"
cd ..

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend_pid.txt

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 5

# Check if frontend is running
if check_port 5173; then
    echo -e "${GREEN}✅ Frontend server started on port 5173${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for details.${NC}"
    cat frontend.log
    exit 1
fi

echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
echo -e "${BLUE}📊 API Health: http://localhost:5000/api/health${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "  Backend: tail -f backend.log"
echo -e "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}🛑 To stop servers:${NC}"
echo -e "  ./stop-dev.sh"
echo ""
echo -e "${GREEN}🌱 To seed enhanced data:${NC}"
echo -e "  cd backend && npm run seed:enhanced"