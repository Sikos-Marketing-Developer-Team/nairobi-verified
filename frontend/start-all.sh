#!/bin/bash

# Script to start all Nairobi Verified services

echo "🚀 Starting Nairobi Verified Platform..."
echo ""

# Function to start a service in the background
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    local port=$4
    
    echo "📦 Starting $service_name on port $port..."
    cd "$directory"
    
    # Check if service is already running
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  Port $port is already in use. Stopping existing process..."
        kill -9 $(lsof -ti:$port) 2>/dev/null || true
        sleep 2
    fi
    
    # Start the service
    $command &
    echo "✅ $service_name started successfully"
    echo ""
}

# Change to the project root directory
PROJECT_ROOT="/home/joe/Work Projects/nairobi-verified"
cd "$PROJECT_ROOT"

echo "📍 Project directory: $PROJECT_ROOT"
echo ""

# Start Backend API (Port 5000)
start_service "Backend API" "$PROJECT_ROOT/backend" "npm start" "5000"

# Wait a moment for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Start Main Frontend (Port 8080)
start_service "Main Frontend" "$PROJECT_ROOT" "npm run dev" "8080"

# Start Admin Dashboard (Port 3001)
start_service "Admin Dashboard" "$PROJECT_ROOT/admin" "npm run dev" "3001"

echo "🎉 All services started successfully!"
echo ""
echo "📊 Service URLs:"
echo "   • Backend API:     http://localhost:5000"
echo "   • Main Frontend:   http://localhost:8080"
echo "   • Admin Dashboard: http://localhost:3001"
echo ""
echo "🔐 Admin Login Credentials:"
echo "   • Email:    admin@nairobiverified.com"
echo "   • Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the admin password after first login!"
echo ""
echo "🛑 To stop all services, press Ctrl+C and run: ./stop-all.sh"
