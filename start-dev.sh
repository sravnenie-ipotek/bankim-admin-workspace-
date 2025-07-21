#!/bin/bash

# BankIM Development Server Startup Script
# Starts both backend API server and frontend development server

echo "🚀 Starting BankIM Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend is already running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}⚠️  Backend server is already running on port 3001${NC}"
else
    echo -e "${BLUE}📦 Starting backend server...${NC}"
    cd backend
    nohup node server.js > server.log 2>&1 & 
    BACKEND_PID=$!
    echo $BACKEND_PID > server.pid
    cd ..
    
    # Wait for backend to start
    echo -n "Waiting for backend to be ready"
    for i in {1..10}; do
        if curl -s http://localhost:3001/health >/dev/null 2>&1; then
            echo -e "\n${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

# Check backend health
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend API is healthy at http://localhost:3001${NC}"
    echo "   - Content API: http://localhost:3001/api/content/main_page/ru"
    echo "   - UI Settings: http://localhost:3001/api/ui-settings"
else
    echo -e "${RED}❌ Backend API health check failed${NC}"
    exit 1
fi

# Start frontend
echo -e "\n${BLUE}🎨 Starting frontend development server...${NC}"
echo -e "${GREEN}✅ Frontend will be available at http://localhost:3002${NC}"
echo -e "\n${BLUE}📝 Logs:${NC}"
echo "   - Backend logs: backend/server.log"
echo "   - Frontend logs: Console output below"
echo -e "\n${GREEN}Press Ctrl+C to stop both servers${NC}\n"

# Start frontend (this will block and show output)
npm run dev

# When frontend is stopped, optionally stop backend
echo -e "\n${BLUE}Frontend stopped.${NC}"
read -p "Stop backend server as well? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f backend/server.pid ]; then
        BACKEND_PID=$(cat backend/server.pid)
        kill $BACKEND_PID 2>/dev/null
        rm backend/server.pid
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
fi