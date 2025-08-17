#!/bin/bash

# BankIM Management Portal - Kill Ports 4000, 4001, 4002 Script
# This script kills any process using ports 4000, 4001, and 4002

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Array of ports to check
PORTS=(4000 4001 4002)

echo -e "${BLUE}🔍 Checking for processes using ports 4000, 4001, 4002...${NC}"

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    echo -e "${YELLOW}📋 Checking port $port...${NC}"
    
    # Find processes using the port
    PIDS=$(lsof -ti:$port 2>/dev/null)
    
    if [ -z "$PIDS" ]; then
        echo -e "${GREEN}✅ Port $port is already free${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}📋 Found processes using port $port:${NC}"
    echo "$PIDS"
    
    # Kill each process
    for PID in $PIDS; do
        echo -e "${YELLOW}🔄 Killing process $PID on port $port...${NC}"
        kill -9 $PID 2>/dev/null || echo -e "${RED}❌ Failed to kill process $PID${NC}"
    done
    
    # Verify port is free
    sleep 1
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is still in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is now free${NC}"
    fi
}

# Kill processes on each port
for port in "${PORTS[@]}"; do
    kill_port $port || true
done

echo -e "${GREEN}🎉 All ports 4000, 4001, 4002 have been checked and freed!${NC}"
