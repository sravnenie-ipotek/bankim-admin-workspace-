#!/bin/bash

echo "Testing all drill endpoints..."
echo ""

echo "1. Testing Mortgage Drill - Step 1"
echo "URL: http://localhost:3001/api/content/mortgage/drill/mortgage_step1"
curl -s http://localhost:3001/api/content/mortgage/drill/mortgage_step1 | jq '.success, .error' 2>/dev/null || echo "PARSE ERROR"
echo ""

echo "2. Testing Credit Drill - Step 1"
echo "URL: http://localhost:3001/api/content/credit/drill/step.1.calculator"
curl -s http://localhost:3001/api/content/credit/drill/step.1.calculator | jq '.success, .error' 2>/dev/null || echo "PARSE ERROR"
echo ""

echo "3. Testing Menu Drill - Sidebar"
echo "URL: http://localhost:3001/api/content/menu/drill/sidebar"
curl -s http://localhost:3001/api/content/menu/drill/sidebar | jq '.success, .error' 2>/dev/null || echo "PARSE ERROR"
echo ""

echo "4. Testing Mortgage All Items"
echo "URL: http://localhost:3001/api/content/mortgage/all-items"
curl -s http://localhost:3001/api/content/mortgage/all-items | jq '.success, .error' 2>/dev/null || echo "PARSE ERROR"
echo ""

echo "5. Testing Credit All Items"
echo "URL: http://localhost:3001/api/content/credit/all-items"
curl -s http://localhost:3001/api/content/credit/all-items | jq '.success, .error' 2>/dev/null || echo "PARSE ERROR"
echo ""

echo "All tests complete!"