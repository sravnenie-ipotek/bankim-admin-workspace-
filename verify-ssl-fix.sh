#!/bin/bash

# BankIM SSL Fix Verification Script
# Run this AFTER executing the SSL certificate fix

echo "🧪 BankIM SSL Certificate Fix Verification"
echo "==========================================="
echo "Verifying that SSL certificates are now properly configured"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS:${NC} $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL:${NC} $2"
        ((TESTS_FAILED++))
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

echo "📋 Verification Test 1: Main Domain SSL Certificate"
echo "=================================================="

# Test main domain certificate
MAIN_SSL_TEST=$(openssl s_client -servername bankimonline.com -connect bankimonline.com:443 </dev/null 2>&1)
MAIN_SUBJECT=$(echo "$MAIN_SSL_TEST" | openssl x509 -noout -subject 2>/dev/null | sed 's/subject=//')
MAIN_SAN=$(echo "$MAIN_SSL_TEST" | openssl x509 -noout -text 2>/dev/null | grep -A1 "Subject Alternative Name" | tail -1)

if echo "$MAIN_SSL_TEST" | grep -q "Certificate chain"; then
    print_result 0 "Main domain SSL connection successful"
    print_info "Certificate Subject: $MAIN_SUBJECT"
    print_info "Subject Alternative Names: $MAIN_SAN"
    
    # Check if certificate covers main domain
    if echo "$MAIN_SUBJECT $MAIN_SAN" | grep -qi "bankimonline.com"; then
        print_result 0 "Certificate properly covers bankimonline.com"
    else
        print_result 1 "Certificate does not cover bankimonline.com"
    fi
else
    print_result 1 "Main domain SSL connection failed"
fi

echo ""
echo "📋 Verification Test 2: Admin Domain SSL Certificate"
echo "==================================================="

# Test admin domain certificate  
ADMIN_SSL_TEST=$(openssl s_client -servername admin.bankimonline.com -connect admin.bankimonline.com:443 </dev/null 2>&1)
ADMIN_SUBJECT=$(echo "$ADMIN_SSL_TEST" | openssl x509 -noout -subject 2>/dev/null | sed 's/subject=//')
ADMIN_SAN=$(echo "$ADMIN_SSL_TEST" | openssl x509 -noout -text 2>/dev/null | grep -A1 "Subject Alternative Name" | tail -1)

if echo "$ADMIN_SSL_TEST" | grep -q "Certificate chain"; then
    print_result 0 "Admin domain SSL connection successful"
    print_info "Certificate Subject: $ADMIN_SUBJECT"
    print_info "Subject Alternative Names: $ADMIN_SAN"
    
    # Check if certificate covers admin domain
    if echo "$ADMIN_SUBJECT $ADMIN_SAN" | grep -qi "admin.bankimonline.com"; then
        print_result 0 "Certificate properly covers admin.bankimonline.com"
    else
        print_result 1 "Certificate does not cover admin.bankimonline.com"
    fi
else
    print_result 1 "Admin domain SSL connection failed"
fi

echo ""
echo "📋 Verification Test 3: HTTP Response Tests"
echo "==========================================="

# Test main domain HTTP response
MAIN_HTTP_RESPONSE=$(curl -s -I https://bankimonline.com/ --max-time 10 2>/dev/null | head -1)
if echo "$MAIN_HTTP_RESPONSE" | grep -q "200\|301\|302"; then
    print_result 0 "Main domain HTTPS responds successfully"
    print_info "Response: $MAIN_HTTP_RESPONSE"
else
    print_result 1 "Main domain HTTPS failed or no response"
    print_info "Response: ${MAIN_HTTP_RESPONSE:-No response}"
fi

# Test admin domain HTTP response
ADMIN_HTTP_RESPONSE=$(curl -s -I https://admin.bankimonline.com/ --max-time 10 2>/dev/null | head -1)
if echo "$ADMIN_HTTP_RESPONSE" | grep -q "200"; then
    print_result 0 "Admin domain HTTPS responds successfully"
    print_info "Response: $ADMIN_HTTP_RESPONSE"
else
    print_result 1 "Admin domain HTTPS failed or no response"
    print_info "Response: ${ADMIN_HTTP_RESPONSE:-No response}"
fi

echo ""
echo "📋 Verification Test 4: Admin Panel Authentication"
echo "================================================="

# Test admin panel authentication
AUTH_RESPONSE=$(curl -s -X POST https://admin.bankimonline.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    --max-time 15 2>/dev/null)

if echo "$AUTH_RESPONSE" | grep -q '"token":'; then
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    print_result 0 "Admin authentication successful"
    print_info "Token received (${#TOKEN} characters)"
    
    # Test protected endpoint
    DASHBOARD_RESPONSE=$(curl -s https://admin.bankimonline.com/api/admin/dashboard \
        -H "Authorization: Bearer $TOKEN" \
        --max-time 15 2>/dev/null)
    
    if echo "$DASHBOARD_RESPONSE" | grep -q '"dashboard":'; then
        print_result 0 "Protected dashboard endpoint working"
    else
        print_result 1 "Protected dashboard endpoint failed"
    fi
else
    print_result 1 "Admin authentication failed"
    print_info "Response: $(echo "$AUTH_RESPONSE" | head -c 100)..."
fi

echo ""
echo "📋 Verification Test 5: Certificate Expiry Check"
echo "==============================================="

# Check certificate expiry
MAIN_EXPIRY=$(echo "$MAIN_SSL_TEST" | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)
ADMIN_EXPIRY=$(echo "$ADMIN_SSL_TEST" | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)

if [ -n "$MAIN_EXPIRY" ]; then
    print_result 0 "Main domain certificate expiry found"
    print_info "Main domain expires: $MAIN_EXPIRY"
else
    print_result 1 "Could not determine main domain certificate expiry"
fi

if [ -n "$ADMIN_EXPIRY" ]; then
    print_result 0 "Admin domain certificate expiry found"
    print_info "Admin domain expires: $ADMIN_EXPIRY"
else
    print_result 1 "Could not determine admin domain certificate expiry"
fi

echo ""
echo "==============================================="
echo "🏆 SSL FIX VERIFICATION RESULTS"
echo "==============================================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo "📊 Total Tests: $(( TESTS_PASSED + TESTS_FAILED ))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 SSL CERTIFICATE FIX SUCCESSFUL!${NC}"
    echo "============================================"
    echo "✅ Both domains have valid SSL certificates"
    echo "✅ Certificates properly cover their respective domains"
    echo "✅ HTTPS responses are working"
    echo "✅ Admin panel authentication is functional"
    echo "✅ Protected endpoints are accessible"
    echo ""
    echo -e "${BLUE}🌟 READY FOR PRODUCTION USE${NC}"
    echo "Both https://bankimonline.com and https://admin.bankimonline.com are now secure!"
    
elif [ $TESTS_FAILED -le 2 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  PARTIAL SUCCESS - Minor Issues Remain${NC}"
    echo "=========================================="
    echo "Most SSL certificate issues have been resolved."
    echo "Please review the failed tests above and address remaining issues."
    
else
    echo ""
    echo -e "${RED}❌ SSL CERTIFICATE FIX INCOMPLETE${NC}"
    echo "===================================="
    echo "Multiple tests are still failing. Please:"
    echo "1. Review the SSL certificate fix deployment steps"
    echo "2. Ensure all commands were executed successfully"
    echo "3. Check Apache error logs for issues"
    echo "4. Verify certificate generation was successful"
fi

echo ""
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo "=============="
if [ $TESTS_FAILED -eq 0 ]; then
    echo "✅ Run comprehensive Playwright tests to confirm browser compatibility"
    echo "✅ Monitor SSL certificate auto-renewal (Let's Encrypt)"
    echo "✅ Update any hardcoded HTTP URLs to HTTPS"
else
    echo "🔧 Address remaining SSL certificate issues"
    echo "🔍 Check Apache error logs: sudo tail -f /var/log/apache2/error.log"
    echo "🔄 Re-run SSL certificate fix commands if needed"
fi

exit $([ $TESTS_FAILED -eq 0 ] && echo 0 || echo 1)