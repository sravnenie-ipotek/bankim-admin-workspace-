#!/bin/bash

# BankIM SSL Certificate Diagnosis Tool
# Comprehensive SSL certificate analysis for both domains

echo "🔍 BankIM SSL Certificate Diagnosis"
echo "===================================="
echo "Analyzing SSL certificates for:"
echo "  • bankimonline.com"
echo "  • admin.bankimonline.com"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
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

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

echo "📋 Test 1: SSL Certificate Details for Main Domain"
echo "=================================================="

# Test main domain SSL certificate
echo "Checking SSL certificate for bankimonline.com..."
MAIN_SSL_OUTPUT=$(openssl s_client -servername bankimonline.com -connect bankimonline.com:443 </dev/null 2>&1)

if echo "$MAIN_SSL_OUTPUT" | grep -q "Certificate chain"; then
    print_result 0 "SSL connection established for bankimonline.com"
    
    # Extract certificate details
    echo "$MAIN_SSL_OUTPUT" | openssl x509 -noout -text 2>/dev/null > /tmp/main_cert_details.txt
    
    if [ -s /tmp/main_cert_details.txt ]; then
        # Check certificate validity
        MAIN_NOT_BEFORE=$(echo "$MAIN_SSL_OUTPUT" | openssl x509 -noout -dates 2>/dev/null | grep "notBefore" | cut -d= -f2)
        MAIN_NOT_AFTER=$(echo "$MAIN_SSL_OUTPUT" | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)
        MAIN_SUBJECT=$(echo "$MAIN_SSL_OUTPUT" | openssl x509 -noout -subject 2>/dev/null | sed 's/subject=//')
        MAIN_ISSUER=$(echo "$MAIN_SSL_OUTPUT" | openssl x509 -noout -issuer 2>/dev/null | sed 's/issuer=//')
        
        print_info "Certificate Subject: $MAIN_SUBJECT"
        print_info "Certificate Issuer: $MAIN_ISSUER"
        print_info "Valid From: $MAIN_NOT_BEFORE"
        print_info "Valid Until: $MAIN_NOT_AFTER"
        
        # Check if certificate covers the main domain
        MAIN_CN=$(echo "$MAIN_SUBJECT" | grep -o "CN=[^,]*" | cut -d= -f2)
        if echo "$MAIN_CN" | grep -qi "bankimonline.com\|*.bankimonline.com"; then
            print_result 0 "Certificate Common Name covers bankimonline.com"
        else
            print_result 1 "Certificate Common Name ($MAIN_CN) does NOT cover bankimonline.com"
        fi
        
        # Check Subject Alternative Names
        MAIN_SAN=$(echo "$MAIN_SSL_OUTPUT" | openssl x509 -noout -text 2>/dev/null | grep -A1 "Subject Alternative Name" | tail -1)
        if [ -n "$MAIN_SAN" ]; then
            print_info "Subject Alternative Names: $MAIN_SAN"
            if echo "$MAIN_SAN" | grep -qi "bankimonline.com"; then
                print_result 0 "SAN includes bankimonline.com"
            else
                print_result 1 "SAN does NOT include bankimonline.com"
            fi
        else
            print_warning "No Subject Alternative Names found"
        fi
        
    else
        print_result 1 "Could not parse certificate details for bankimonline.com"
    fi
else
    print_result 1 "SSL connection failed for bankimonline.com"
    print_info "OpenSSL Error: $(echo "$MAIN_SSL_OUTPUT" | grep -i "error\|verify" | head -3)"
fi

echo ""
echo "📋 Test 2: SSL Certificate Details for Admin Subdomain"
echo "======================================================"

# Test admin subdomain SSL certificate
echo "Checking SSL certificate for admin.bankimonline.com..."
ADMIN_SSL_OUTPUT=$(openssl s_client -servername admin.bankimonline.com -connect admin.bankimonline.com:443 </dev/null 2>&1)

if echo "$ADMIN_SSL_OUTPUT" | grep -q "Certificate chain"; then
    print_result 0 "SSL connection established for admin.bankimonline.com"
    
    # Extract certificate details
    echo "$ADMIN_SSL_OUTPUT" | openssl x509 -noout -text 2>/dev/null > /tmp/admin_cert_details.txt
    
    if [ -s /tmp/admin_cert_details.txt ]; then
        # Check certificate validity
        ADMIN_NOT_BEFORE=$(echo "$ADMIN_SSL_OUTPUT" | openssl x509 -noout -dates 2>/dev/null | grep "notBefore" | cut -d= -f2)
        ADMIN_NOT_AFTER=$(echo "$ADMIN_SSL_OUTPUT" | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)
        ADMIN_SUBJECT=$(echo "$ADMIN_SSL_OUTPUT" | openssl x509 -noout -subject 2>/dev/null | sed 's/subject=//')
        ADMIN_ISSUER=$(echo "$ADMIN_SSL_OUTPUT" | openssl x509 -noout -issuer 2>/dev/null | sed 's/issuer=//')
        
        print_info "Certificate Subject: $ADMIN_SUBJECT"
        print_info "Certificate Issuer: $ADMIN_ISSUER"
        print_info "Valid From: $ADMIN_NOT_BEFORE"
        print_info "Valid Until: $ADMIN_NOT_AFTER"
        
        # Check if certificate covers the admin subdomain
        ADMIN_CN=$(echo "$ADMIN_SUBJECT" | grep -o "CN=[^,]*" | cut -d= -f2)
        if echo "$ADMIN_CN" | grep -qi "admin.bankimonline.com\|*.bankimonline.com"; then
            print_result 0 "Certificate Common Name covers admin.bankimonline.com"
        else
            print_result 1 "Certificate Common Name ($ADMIN_CN) does NOT cover admin.bankimonline.com"
        fi
        
        # Check Subject Alternative Names
        ADMIN_SAN=$(echo "$ADMIN_SSL_OUTPUT" | openssl x509 -noout -text 2>/dev/null | grep -A1 "Subject Alternative Name" | tail -1)
        if [ -n "$ADMIN_SAN" ]; then
            print_info "Subject Alternative Names: $ADMIN_SAN"
            if echo "$ADMIN_SAN" | grep -qi "admin.bankimonline.com\|*.bankimonline.com"; then
                print_result 0 "SAN includes admin.bankimonline.com"
            else
                print_result 1 "SAN does NOT include admin.bankimonline.com"
            fi
        else
            print_warning "No Subject Alternative Names found"
        fi
        
    else
        print_result 1 "Could not parse certificate details for admin.bankimonline.com"
    fi
else
    print_result 1 "SSL connection failed for admin.bankimonline.com"
    print_info "OpenSSL Error: $(echo "$ADMIN_SSL_OUTPUT" | grep -i "error\|verify" | head -3)"
fi

echo ""
echo "📋 Test 3: Certificate Chain Validation"
echo "======================================="

# Test certificate chain validation
echo "Testing certificate chain validation..."

MAIN_CHAIN_VERIFY=$(echo "$MAIN_SSL_OUTPUT" | grep "Verify return code")
ADMIN_CHAIN_VERIFY=$(echo "$ADMIN_SSL_OUTPUT" | grep "Verify return code")

if echo "$MAIN_CHAIN_VERIFY" | grep -q "0 (ok)"; then
    print_result 0 "Main domain certificate chain is valid"
else
    print_result 1 "Main domain certificate chain validation failed"
    print_info "Chain verification: $MAIN_CHAIN_VERIFY"
fi

if echo "$ADMIN_CHAIN_VERIFY" | grep -q "0 (ok)"; then
    print_result 0 "Admin domain certificate chain is valid"
else
    print_result 1 "Admin domain certificate chain validation failed"
    print_info "Chain verification: $ADMIN_CHAIN_VERIFY"
fi

echo ""
echo "📋 Test 4: DNS Resolution Check"
echo "==============================="

# Test DNS resolution
MAIN_DNS=$(dig +short bankimonline.com 2>/dev/null)
ADMIN_DNS=$(dig +short admin.bankimonline.com 2>/dev/null)

if [ -n "$MAIN_DNS" ]; then
    print_result 0 "Main domain DNS resolves"
    print_info "bankimonline.com → $MAIN_DNS"
else
    print_result 1 "Main domain DNS resolution failed"
fi

if [ -n "$ADMIN_DNS" ]; then
    print_result 0 "Admin subdomain DNS resolves"
    print_info "admin.bankimonline.com → $ADMIN_DNS"
else
    print_result 1 "Admin subdomain DNS resolution failed"
fi

echo ""
echo "📋 Test 5: Port Connectivity"
echo "============================"

# Test port 443 connectivity
if timeout 5 bash -c "</dev/tcp/bankimonline.com/443" 2>/dev/null; then
    print_result 0 "Main domain port 443 is reachable"
else
    print_result 1 "Main domain port 443 is not reachable"
fi

if timeout 5 bash -c "</dev/tcp/admin.bankimonline.com/443" 2>/dev/null; then
    print_result 0 "Admin subdomain port 443 is reachable"
else
    print_result 1 "Admin subdomain port 443 is not reachable"
fi

# Test port 8005 for admin panel
if timeout 5 bash -c "</dev/tcp/admin.bankimonline.com/8005" 2>/dev/null; then
    print_result 0 "Admin panel port 8005 is reachable"
else
    print_result 1 "Admin panel port 8005 is not reachable"
fi

echo ""
echo "==============================================="
echo "🏆 SSL CERTIFICATE DIAGNOSIS SUMMARY"
echo "==============================================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo "📊 Total Tests: $(( TESTS_PASSED + TESTS_FAILED ))"

echo ""
echo -e "${YELLOW}🔧 RECOMMENDED ACTIONS:${NC}"
echo "========================"

if [ $TESTS_FAILED -gt 0 ]; then
    echo "Based on the test results, here are the recommended actions:"
    echo ""
    echo "1. 🔍 Check Apache VirtualHost Configuration:"
    echo "   sudo nano /etc/apache2/conf/httpd.conf"
    echo "   Look for VirtualHost entries for both domains"
    echo ""
    echo "2. 🔑 Verify SSL Certificate Files:"
    echo "   ls -la /etc/letsencrypt/live/bankimonline.com/"
    echo "   ls -la /etc/letsencrypt/live/admin.bankimonline.com/"
    echo ""
    echo "3. 🔄 Regenerate Let's Encrypt Certificates:"
    echo "   sudo certbot --apache -d bankimonline.com -d admin.bankimonline.com"
    echo ""
    echo "4. 🔃 Restart Apache Service:"
    echo "   sudo systemctl restart apache2"
    echo ""
    echo "5. 🧪 Test After Changes:"
    echo "   Run this diagnosis script again to verify fixes"
else
    echo -e "${GREEN}🎉 All SSL certificate tests passed!${NC}"
    echo "Both domains have valid SSL certificates."
fi

# Cleanup temporary files
rm -f /tmp/main_cert_details.txt /tmp/admin_cert_details.txt

exit $([ $TESTS_FAILED -eq 0 ] && echo 0 || echo 1)