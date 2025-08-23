#!/bin/bash

# BankIM Admin Panel Authentication Test Suite
# Comprehensive testing to validate the authentication system we implemented

echo "🔍 BankIM Admin Panel Authentication Test Suite"
echo "==============================================="
echo "Testing: https://admin.bankimonline.com"
echo "Validating: Authentication, SSL, URL behavior, and database connectivity"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS:${NC} $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL:${NC} $2"
        ((TESTS_FAILED++))
    fi
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

# Create temp directory for test files
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Using temp directory: $TEMP_DIR${NC}"
echo ""

echo "📋 Test 1: SSL Certificate and Basic Connectivity"
echo "================================================"
print_info "Checking SSL certificate validity and basic connectivity..."

# Test SSL and basic response
curl -s --connect-timeout 10 --max-time 30 \
    --write-out "HTTPSTATUS:%{http_code};CONNECT:%{time_connect};TOTAL:%{time_total};" \
    https://admin.bankimonline.com/ \
    -o "$TEMP_DIR/root_response.json" 2>/dev/null

if [ $? -eq 0 ]; then
    HTTP_STATUS=$(cat "$TEMP_DIR/root_response.json" | tail -n1 | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    CONNECT_TIME=$(cat "$TEMP_DIR/root_response.json" | tail -n1 | grep -o "CONNECT:[0-9.]*" | cut -d: -f2)
    
    if [ "$HTTP_STATUS" = "200" ]; then
        print_result 0 "SSL certificate valid and server responding (HTTP 200)"
        print_info "Connection time: ${CONNECT_TIME}s"
    else
        print_result 1 "Server responding but with HTTP $HTTP_STATUS"
    fi
else
    print_result 1 "SSL connection failed or server unreachable"
fi

echo ""
echo "📋 Test 2: Root URL Clean Access (No Unwanted Redirects)"
echo "======================================================="
print_info "Verifying that root URL serves login page directly without redirects..."

# Clean the response file first
sed -i '' '/HTTPSTATUS:/d' "$TEMP_DIR/root_response.json" 2>/dev/null || true

ROOT_CONTENT=$(cat "$TEMP_DIR/root_response.json" 2>/dev/null || echo "{}")
LOGIN_MESSAGE=$(echo "$ROOT_CONTENT" | grep -o "Admin Authentication Required" 2>/dev/null || echo "")
TITLE_CHECK=$(echo "$ROOT_CONTENT" | grep -o "BankIM Admin Panel" 2>/dev/null || echo "")

if [ -n "$LOGIN_MESSAGE" ] && [ -n "$TITLE_CHECK" ]; then
    print_result 0 "Root URL serves login page directly (no redirect to /content/menu)"
    print_info "Response contains expected authentication prompt"
else
    print_result 1 "Root URL doesn't serve expected login page content"
    print_info "Response preview: $(echo "$ROOT_CONTENT" | head -c 100)..."
fi

echo ""
echo "📋 Test 3: Authentication System"
echo "==============================="
print_info "Testing login endpoint with admin credentials..."

AUTH_RESPONSE=$(curl -s --max-time 30 \
    -X POST https://admin.bankimonline.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    --write-out "HTTPSTATUS:%{http_code};" \
    -o "$TEMP_DIR/auth_response.json" 2>/dev/null)

if [ $? -eq 0 ]; then
    AUTH_HTTP_STATUS=$(echo "$AUTH_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$AUTH_HTTP_STATUS" = "200" ]; then
        # Clean the response
        sed -i '' '/HTTPSTATUS:/d' "$TEMP_DIR/auth_response.json" 2>/dev/null || true
        
        AUTH_CONTENT=$(cat "$TEMP_DIR/auth_response.json" 2>/dev/null || echo "{}")
        TOKEN=$(echo "$AUTH_CONTENT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
        
        if [ -n "$TOKEN" ] && [ ${#TOKEN} -gt 20 ]; then
            print_result 0 "Authentication successful - JWT token received"
            print_info "Token length: ${#TOKEN} characters"
            print_info "Token preview: ${TOKEN:0:20}..."
        else
            print_result 1 "Authentication endpoint responded but no valid JWT token"
            print_info "Response: $(echo "$AUTH_CONTENT" | head -c 200)..."
        fi
    else
        print_result 1 "Authentication failed with HTTP $AUTH_HTTP_STATUS"
    fi
else
    print_result 1 "Authentication request failed - network or server error"
fi

echo ""
echo "📋 Test 4: Protected Route Security"
echo "=================================="
print_info "Testing that protected routes require authentication..."

# Test without token
PROTECTED_RESPONSE=$(curl -s --max-time 15 \
    https://admin.bankimonline.com/api/admin/dashboard \
    --write-out "HTTPSTATUS:%{http_code};" \
    -o "$TEMP_DIR/protected_unauth.json" 2>/dev/null)

if [ $? -eq 0 ]; then
    PROTECTED_HTTP_STATUS=$(echo "$PROTECTED_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$PROTECTED_HTTP_STATUS" = "401" ]; then
        print_result 0 "Protected route properly rejects unauthenticated requests (HTTP 401)"
    elif [ "$PROTECTED_HTTP_STATUS" = "403" ]; then
        print_result 0 "Protected route properly rejects unauthenticated requests (HTTP 403)"
    else
        print_result 1 "Protected route should reject unauthenticated requests but returned HTTP $PROTECTED_HTTP_STATUS"
    fi
else
    print_result 1 "Failed to test protected route - network error"
fi

echo ""
echo "📋 Test 5: Authenticated Access"
echo "==============================="
if [ -n "$TOKEN" ]; then
    print_info "Testing protected route access with valid JWT token..."
    
    PROTECTED_AUTH_RESPONSE=$(curl -s --max-time 15 \
        https://admin.bankimonline.com/api/admin/dashboard \
        -H "Authorization: Bearer $TOKEN" \
        --write-out "HTTPSTATUS:%{http_code};" \
        -o "$TEMP_DIR/protected_auth.json" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        PROTECTED_AUTH_HTTP_STATUS=$(echo "$PROTECTED_AUTH_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        
        if [ "$PROTECTED_AUTH_HTTP_STATUS" = "200" ]; then
            print_result 0 "Protected route grants access with valid JWT token"
            
            # Clean and check content
            sed -i '' '/HTTPSTATUS:/d' "$TEMP_DIR/protected_auth.json" 2>/dev/null || true
            DASHBOARD_CONTENT=$(cat "$TEMP_DIR/protected_auth.json" 2>/dev/null || echo "{}")
            print_info "Dashboard response preview: $(echo "$DASHBOARD_CONTENT" | head -c 100)..."
        else
            print_result 1 "Protected route denies access even with valid token (HTTP $PROTECTED_AUTH_HTTP_STATUS)"
        fi
    else
        print_result 1 "Failed to test authenticated access - network error"
    fi
else
    print_result 1 "Cannot test authenticated access - no valid token from authentication test"
fi

echo ""
echo "📋 Test 6: Database Connectivity Test"
echo "===================================="
if [ -n "$TOKEN" ]; then
    print_info "Testing database connection through authenticated endpoint..."
    
    DB_RESPONSE=$(curl -s --max-time 20 \
        https://admin.bankimonline.com/api/test/db \
        -H "Authorization: Bearer $TOKEN" \
        --write-out "HTTPSTATUS:%{http_code};" \
        -o "$TEMP_DIR/db_test.json" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        DB_HTTP_STATUS=$(echo "$DB_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        
        if [ "$DB_HTTP_STATUS" = "200" ]; then
            # Clean and check content
            sed -i '' '/HTTPSTATUS:/d' "$TEMP_DIR/db_test.json" 2>/dev/null || true
            DB_CONTENT=$(cat "$TEMP_DIR/db_test.json" 2>/dev/null || echo "{}")
            
            DB_SUCCESS=$(echo "$DB_CONTENT" | grep -o "Database connection successful\|connected successfully\|connection.*ok" 2>/dev/null || echo "")
            if [ -n "$DB_SUCCESS" ]; then
                print_result 0 "Database connection test successful"
                print_info "Database response: $(echo "$DB_CONTENT" | head -c 150)..."
            else
                print_result 1 "Database endpoint accessible but connection appears failed"
                print_info "Response: $(echo "$DB_CONTENT" | head -c 150)..."
            fi
        else
            print_result 1 "Database test endpoint returned HTTP $DB_HTTP_STATUS"
        fi
    else
        print_result 1 "Failed to test database connection - network error"
    fi
else
    print_result 1 "Cannot test database connection - no valid token available"
fi

echo ""
echo "📋 Test 7: Alternative Port Access Consistency"
echo "=============================================="
print_info "Testing that port 8005 serves the same content..."

PORT_RESPONSE=$(curl -s --max-time 15 \
    http://admin.bankimonline.com:8005/ \
    --write-out "HTTPSTATUS:%{http_code};" \
    -o "$TEMP_DIR/port_response.json" 2>/dev/null)

if [ $? -eq 0 ]; then
    PORT_HTTP_STATUS=$(echo "$PORT_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$PORT_HTTP_STATUS" = "200" ]; then
        # Clean and check content
        sed -i '' '/HTTPSTATUS:/d' "$TEMP_DIR/port_response.json" 2>/dev/null || true
        PORT_CONTENT=$(cat "$TEMP_DIR/port_response.json" 2>/dev/null || echo "{}")
        
        PORT_LOGIN_CHECK=$(echo "$PORT_CONTENT" | grep -o "Admin Authentication Required" 2>/dev/null || echo "")
        if [ -n "$PORT_LOGIN_CHECK" ]; then
            print_result 0 "Port 8005 access serves identical login content"
        else
            print_result 1 "Port 8005 serves different content than HTTPS domain"
            print_info "Port content preview: $(echo "$PORT_CONTENT" | head -c 100)..."
        fi
    else
        print_result 1 "Port 8005 access returned HTTP $PORT_HTTP_STATUS"
    fi
else
    print_result 1 "Port 8005 access failed - network or server error"
fi

echo ""
echo "📋 Test 8: Performance and Response Times"
echo "========================================"
print_info "Testing response performance..."

START_TIME=$(date +%s%N)
PERF_RESPONSE=$(curl -s --max-time 10 \
    https://admin.bankimonline.com/ \
    --write-out "%{http_code}" \
    -o /dev/null 2>/dev/null)
END_TIME=$(date +%s%N)

if [ $? -eq 0 ]; then
    RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))  # Convert to milliseconds
    
    if [ "$PERF_RESPONSE" = "200" ] && [ "$RESPONSE_TIME" -lt 3000 ]; then
        print_result 0 "Response time acceptable: ${RESPONSE_TIME}ms (< 3000ms threshold)"
    elif [ "$PERF_RESPONSE" = "200" ]; then
        print_result 1 "Response successful but slow: ${RESPONSE_TIME}ms (> 3000ms threshold)"
    else
        print_result 1 "Performance test failed - HTTP $PERF_RESPONSE"
    fi
else
    print_result 1 "Performance test failed - network error"
fi

# Cleanup temp files
echo ""
print_info "Cleaning up temporary test files..."
rm -rf "$TEMP_DIR"

echo ""
echo "==============================================="
echo "🏆 ADMIN PANEL TEST RESULTS SUMMARY"
echo "==============================================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo "📊 Total Tests: $(( TESTS_PASSED + TESTS_FAILED ))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}The admin panel authentication system is working correctly:${NC}"
    echo "   • SSL certificates are valid"
    echo "   • Root URL serves login page directly (no redirects)"
    echo "   • Authentication system is functional"
    echo "   • Protected routes are properly secured"
    echo "   • Database connectivity is working"
    echo "   • Performance is acceptable"
    echo ""
    echo -e "${BLUE}✨ Ready for production use at https://admin.bankimonline.com${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo "Please review the failed tests above and address any issues."
    echo ""
    echo -e "${YELLOW}Common issues to check:${NC}"
    echo "   • Server process running (PM2 status)"
    echo "   • Apache configuration and SSL certificates"
    echo "   • Database connectivity and permissions"
    echo "   • Network connectivity to admin.bankimonline.com"
    exit 1
fi