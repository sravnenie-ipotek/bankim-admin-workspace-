#!/bin/bash

echo "Testing all content endpoints..."
echo ""

echo "1. Testing /api/content/credit"
curl -s http://localhost:3001/api/content/credit | jq '.success, .data.content_count' 2>/dev/null || echo "FAILED"
echo ""

echo "2. Testing /api/content/credit-refi"
curl -s http://localhost:3001/api/content/credit-refi | jq '.success, .data.content_count' 2>/dev/null || echo "FAILED"
echo ""

echo "3. Testing /api/content/mortgage"
curl -s http://localhost:3001/api/content/mortgage | jq '.success, .data.content_count' 2>/dev/null || echo "FAILED"
echo ""

echo "4. Testing /api/content/mortgage-refi"
curl -s http://localhost:3001/api/content/mortgage-refi | jq '.success, .data.content_count' 2>/dev/null || echo "FAILED"
echo ""

echo "5. Testing /api/content/general"
curl -s http://localhost:3001/api/content/general | jq '.success, .data.content_count' 2>/dev/null || echo "FAILED"
echo ""

echo "6. Testing /api/content/menu"
curl -s http://localhost:3001/api/content/menu | jq '.success, .data.content_count' 2>/dev/null || echo "FAILED"
echo ""

echo "All tests complete!"