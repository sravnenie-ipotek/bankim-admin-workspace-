#!/bin/bash

echo "🚀 Starting BankIM Management Portal..."

# Start backend in background
echo "📡 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Return to root and start frontend
echo "🌐 Starting frontend server..."
cd .. && npm start

# When frontend stops, also stop backend
kill $BACKEND_PID 2>/dev/null
