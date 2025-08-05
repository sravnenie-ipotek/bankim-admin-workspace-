#!/bin/bash

# Stop Local Development Environment
# This script stops the local development processes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping Local Development Environment...${NC}"

# Kill processes on local ports
echo -e "${YELLOW}🔌 Stopping processes on ports 4000, 4001, 4002...${NC}"
lsof -ti:4000,4001,4002 | xargs kill -9 2>/dev/null || echo "No processes found on local ports"

# Kill any node processes related to our project
echo -e "${YELLOW}🔌 Stopping Node.js processes...${NC}"
pkill -f "packages/server" 2>/dev/null || echo "No server processes found"
pkill -f "packages/client" 2>/dev/null || echo "No client processes found"

echo -e "${GREEN}✅ Local development environment stopped!${NC}"
echo -e "${BLUE}💡 Your production environment should remain unaffected${NC}" 