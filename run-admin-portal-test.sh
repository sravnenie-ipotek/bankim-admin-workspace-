#!/bin/bash

# 🏦 BankIM Admin Portal Navigation Test Runner
# Tests all links except "Контент сайта" submenu and reports errors

echo "🏦 Starting BankIM Admin Portal Navigation Test"
echo "==============================================="

# Check if we're in the right directory
if [ ! -f "packages/client/cypress.config.ts" ]; then
    echo "❌ Error: Must run from project root directory"
    echo "Expected: /Users/michaelmishayev/Projects/bankIM_management_portal/"
    exit 1
fi

# Create reports directory
mkdir -p packages/client/cypress/reports

echo "📋 Test Configuration:"
echo "   Target: http://185.253.72.80:3002 (Admin Portal)"
echo "   Scope: All navigation except 'Контент сайта'"
echo "   Report: cypress/reports/navigation-test-results.json"
echo ""

# Check if admin portal is accessible
echo "🔍 Checking Admin Portal accessibility..."
if curl -s -I "http://185.253.72.80:3002" | grep -q "200\|301\|302"; then
    echo "✅ Admin Portal is accessible"
else
    echo "❌ Warning: Admin Portal may not be accessible"
    echo "   Make sure the admin portal is running on http://185.253.72.80:3002"
fi

echo ""
echo "🚀 Starting Cypress test..."
echo ""

# Navigate to client directory and run the test
cd packages/client

# Run the specific admin portal navigation test
npx cypress run \
    --spec "cypress/e2e/admin-portal-navigation.cy.ts" \
    --browser chrome \
    --headless \
    --reporter json \
    --reporter-options "output=cypress/reports/test-results-raw.json" \
    --config "defaultCommandTimeout=10000,requestTimeout=10000,responseTimeout=10000"

# Check if test completed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test completed successfully!"
else
    echo ""
    echo "⚠️  Test completed with issues (this may be expected for development pages)"
fi

echo ""
echo "📊 Test Reports Generated:"
echo "   Detailed JSON: packages/client/cypress/reports/navigation-test-results.json"
echo "   Raw Results: packages/client/cypress/reports/test-results-raw.json"

# Check if detailed report exists and show summary
if [ -f "cypress/reports/navigation-test-results.json" ]; then
    echo ""
    echo "📋 Quick Summary:"
    # Extract summary info from JSON report
    node -e "
        const fs = require('fs');
        try {
            const report = JSON.parse(fs.readFileSync('cypress/reports/navigation-test-results.json', 'utf8'));
            console.log('   Total Links Tested:', report.summary.total);
            console.log('   ✅ Passed:', report.summary.passed);
            console.log('   ❌ Failed:', report.summary.failed);
            console.log('   Success Rate:', report.summary.successRate + '%');
            
            if (report.results.filter(r => r.status === 'fail').length > 0) {
                console.log('');
                console.log('⚠️  Issues found:');
                report.results.filter(r => r.status === 'fail').slice(0, 5).forEach((result, i) => {
                    console.log('   ' + (i+1) + '. ' + result.section + ' -> ' + result.link);
                    console.log('      Error: ' + result.error);
                });
                
                if (report.results.filter(r => r.status === 'fail').length > 5) {
                    console.log('   ... and ' + (report.results.filter(r => r.status === 'fail').length - 5) + ' more issues');
                }
            }
        } catch (e) {
            console.log('   Report file not found or invalid');
        }
    " 2>/dev/null || echo "   (Summary extraction failed - check JSON report directly)"
else
    echo ""
    echo "⚠️  Detailed report not generated - check raw results"
fi

echo ""
echo "🔍 To view detailed results:"
echo "   cat packages/client/cypress/reports/navigation-test-results.json"
echo ""
echo "💡 Next Steps:"
echo "   1. Review failed tests in the report"
echo "   2. Expected: Most non-content pages should show 'В разработке'"
echo "   3. Fix any unexpected errors or broken links"
echo "   4. Re-run test after fixes: ./run-admin-portal-test.sh"

echo ""
echo "✅ Admin Portal Navigation Test Complete!"