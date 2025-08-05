#!/bin/bash

# Local Development Environment Setup
# This script starts the local development environment on different ports
# to avoid conflicts with production SSH tunnel

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Local Development Environment${NC}"
echo -e "${YELLOW}This will run on different ports to avoid conflicts with production${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found, creating from .env${NC}"
    cp .env .env.local
    sed -i '' 's/PORT=3000/PORT=4000/' .env.local
    sed -i '' 's/VITE_API_URL=http:\/\/localhost:3000/VITE_API_URL=http:\/\/localhost:4000/' .env.local
    sed -i '' 's/NODE_ENV=production/NODE_ENV=development/' .env.local
fi

# Kill any existing processes on our local ports
echo -e "${YELLOW}🔄 Stopping any existing processes on local ports...${NC}"
lsof -ti:4000,4001,4002 | xargs kill -9 2>/dev/null || echo "No processes to kill"

# Start the backend server with local environment
echo -e "${GREEN}🔧 Starting Backend Server (Port 4000)...${NC}"
cd packages/server
source ../../.env.local
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend with local environment
echo -e "${GREEN}🎨 Starting Frontend (Port 4002)...${NC}"
cd ../client
source ../../.env.local
PORT=4002 npm run dev &
FRONTEND_PID=$!

# Wait for both to start
sleep 5

echo -e "${GREEN}✅ Local Development Environment Started!${NC}"
echo -e "${BLUE}📊 Services:${NC}"
echo -e "   🔧 Backend API: ${GREEN}http://localhost:4000${NC}"
echo -e "   🎨 Frontend: ${GREEN}http://localhost:4002${NC}"
echo -e "   📈 Health Check: ${GREEN}http://localhost:4000/health${NC}"
echo -e ""
echo -e "${YELLOW}💡 To stop the local environment:${NC}"
echo -e "   kill $BACKEND_PID $FRONTEND_PID"
echo -e "   or run: ./scripts/stop-local-dev.sh"
echo -e ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo -e "   🌐 Frontend: http://localhost:4002"
echo -e "   🔧 API Health: http://localhost:4000/health"
echo -e "   📋 API Menu: http://localhost:4000/api/content/menu"

# Keep the script running and show logs
echo -e "${YELLOW}📝 Press Ctrl+C to stop all services${NC}"
wait 