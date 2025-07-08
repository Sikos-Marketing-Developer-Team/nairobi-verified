#!/bin/bash

# Script to stop all Nairobi Verified services

echo "🛑 Stopping all Nairobi Verified services..."
echo ""

# Function to stop service on a specific port
stop_service() {
    local service_name=$1
    local port=$2
    
    echo "🔍 Checking for $service_name on port $port..."
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "⏹️  Stopping $service_name..."
        kill -9 $(lsof -ti:$port) 2>/dev/null
        echo "✅ $service_name stopped"
    else
        echo "ℹ️  $service_name is not running"
    fi
    echo ""
}

# Stop all services
stop_service "Backend API" "5000"
stop_service "Main Frontend" "8080"  
stop_service "Admin Dashboard" "3001"

echo "✅ All services stopped successfully!"
echo ""
