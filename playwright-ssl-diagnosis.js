// BankIM SSL Certificate and Domain Diagnosis with Playwright
// This script tests both main domain and admin subdomain

const { chromium } = require('playwright');

async function runSSLDiagnosis() {
  console.log('🔍 BankIM SSL Certificate and Domain Diagnosis');
  console.log('===============================================');
  console.log('Testing: bankimonline.com and admin.bankimonline.com');
  console.log('');

  const browser = await chromium.launch({ 
    headless: false, // Show browser for visual debugging
    ignoreHTTPSErrors: false // Don't ignore SSL errors - we want to catch them
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: false,
    acceptDownloads: false
  });
  
  const page = await context.newPage();
  
  let testResults = {
    mainDomain: {},
    adminDomain: {},
    summary: { passed: 0, failed: 0 }
  };

  // Test 1: Main Domain HTTPS
  console.log('📋 Test 1: Main Domain HTTPS (bankimonline.com)');
  console.log('================================================');
  try {
    const response = await page.goto('https://bankimonline.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    testResults.mainDomain.httpsStatus = response.status();
    testResults.mainDomain.httpsError = null;
    console.log('✅ PASS: Main domain HTTPS accessible');
    console.log(`   Status: ${response.status()}`);
    console.log(`   URL: ${response.url()}`);
    testResults.summary.passed++;
  } catch (error) {
    testResults.mainDomain.httpsError = error.message;
    console.log('❌ FAIL: Main domain HTTPS failed');
    console.log(`   Error: ${error.message}`);
    testResults.summary.failed++;
  }

  // Test 2: Main Domain HTTP (check for redirect)
  console.log('\n📋 Test 2: Main Domain HTTP Redirect');
  console.log('====================================');
  try {
    const response = await page.goto('http://bankimonline.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    testResults.mainDomain.httpStatus = response.status();
    testResults.mainDomain.httpFinalUrl = response.url();
    
    if (response.url().startsWith('https://')) {
      console.log('✅ PASS: HTTP redirects to HTTPS');
      console.log(`   Final URL: ${response.url()}`);
      testResults.summary.passed++;
    } else {
      console.log('⚠️  WARNING: HTTP does not redirect to HTTPS');
      console.log(`   Final URL: ${response.url()}`);
    }
  } catch (error) {
    testResults.mainDomain.httpError = error.message;
    console.log('❌ FAIL: Main domain HTTP redirect failed');
    console.log(`   Error: ${error.message}`);
    testResults.summary.failed++;
  }

  // Test 3: Admin Subdomain HTTPS
  console.log('\n📋 Test 3: Admin Subdomain HTTPS (admin.bankimonline.com)');
  console.log('=======================================================');
  try {
    const response = await page.goto('https://admin.bankimonline.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    testResults.adminDomain.httpsStatus = response.status();
    testResults.adminDomain.httpsError = null;
    console.log('✅ PASS: Admin subdomain HTTPS accessible');
    console.log(`   Status: ${response.status()}`);
    
    // Check if it shows login page
    const content = await page.content();
    if (content.includes('Admin Authentication Required') || content.includes('BankIM Admin Panel')) {
      console.log('✅ PASS: Admin login page loads correctly');
      testResults.adminDomain.loginPageVisible = true;
      testResults.summary.passed++;
    } else {
      console.log('⚠️  WARNING: Admin login page content not found');
      testResults.adminDomain.loginPageVisible = false;
    }
    
    testResults.summary.passed++;
  } catch (error) {
    testResults.adminDomain.httpsError = error.message;
    console.log('❌ FAIL: Admin subdomain HTTPS failed');
    console.log(`   Error: ${error.message}`);
    testResults.summary.failed++;
  }

  // Test 4: Admin Authentication Flow
  console.log('\n📋 Test 4: Admin Authentication Flow');
  console.log('===================================');
  try {
    // Navigate to admin panel
    await page.goto('https://admin.bankimonline.com');
    
    // Test authentication via API
    const authResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        return {
          status: response.status,
          ok: response.ok,
          data: await response.json()
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (authResponse.ok && authResponse.data.token) {
      console.log('✅ PASS: Admin authentication successful');
      console.log(`   Token received: ${authResponse.data.token.substring(0, 20)}...`);
      testResults.adminDomain.authWorking = true;
      testResults.summary.passed++;
      
      // Test protected endpoint
      const dashboardResponse = await page.evaluate(async (token) => {
        try {
          const response = await fetch('/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return {
            status: response.status,
            ok: response.ok,
            data: await response.json()
          };
        } catch (error) {
          return { error: error.message };
        }
      }, authResponse.data.token);
      
      if (dashboardResponse.ok) {
        console.log('✅ PASS: Protected dashboard endpoint working');
        testResults.adminDomain.protectedEndpointsWorking = true;
        testResults.summary.passed++;
      } else {
        console.log('❌ FAIL: Protected dashboard endpoint not working');
        console.log(`   Status: ${dashboardResponse.status}`);
        testResults.adminDomain.protectedEndpointsWorking = false;
        testResults.summary.failed++;
      }
      
    } else {
      console.log('❌ FAIL: Admin authentication failed');
      console.log(`   Response: ${JSON.stringify(authResponse)}`);
      testResults.adminDomain.authWorking = false;
      testResults.summary.failed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Admin authentication flow failed');
    console.log(`   Error: ${error.message}`);
    testResults.summary.failed++;
  }

  // Test 5: SSL Certificate Details
  console.log('\n📋 Test 5: SSL Certificate Details');
  console.log('==================================');
  try {
    // Get certificate info for main domain
    await page.goto('https://bankimonline.com');
    const mainCertInfo = await page.evaluate(() => {
      // Try to get certificate information
      return {
        protocol: location.protocol,
        host: location.host,
        securityState: 'unknown' // Browser API limitations
      };
    });
    
    console.log(`Main domain protocol: ${mainCertInfo.protocol}`);
    testResults.mainDomain.certInfo = mainCertInfo;
    
    // Get certificate info for admin domain
    await page.goto('https://admin.bankimonline.com');
    const adminCertInfo = await page.evaluate(() => {
      return {
        protocol: location.protocol,
        host: location.host,
        securityState: 'unknown'
      };
    });
    
    console.log(`Admin domain protocol: ${adminCertInfo.protocol}`);
    testResults.adminDomain.certInfo = adminCertInfo;
    
    testResults.summary.passed++;
  } catch (error) {
    console.log('❌ FAIL: SSL certificate details check failed');
    console.log(`   Error: ${error.message}`);
    testResults.summary.failed++;
  }

  await browser.close();

  // Summary Report
  console.log('\n===============================================');
  console.log('🏆 SSL DIAGNOSIS SUMMARY REPORT');
  console.log('===============================================');
  console.log(`✅ Tests Passed: ${testResults.summary.passed}`);
  console.log(`❌ Tests Failed: ${testResults.summary.failed}`);
  console.log(`📊 Total Tests: ${testResults.summary.passed + testResults.summary.failed}`);
  
  console.log('\n📊 DETAILED RESULTS:');
  console.log('====================');
  console.log('Main Domain (bankimonline.com):');
  console.log(`  • HTTPS Status: ${testResults.mainDomain.httpsStatus || 'FAILED'}`);
  console.log(`  • HTTPS Error: ${testResults.mainDomain.httpsError || 'None'}`);
  console.log(`  • HTTP Status: ${testResults.mainDomain.httpStatus || 'FAILED'}`);
  console.log(`  • HTTP Final URL: ${testResults.mainDomain.httpFinalUrl || 'N/A'}`);
  
  console.log('\nAdmin Domain (admin.bankimonline.com):');
  console.log(`  • HTTPS Status: ${testResults.adminDomain.httpsStatus || 'FAILED'}`);
  console.log(`  • HTTPS Error: ${testResults.adminDomain.httpsError || 'None'}`);
  console.log(`  • Login Page: ${testResults.adminDomain.loginPageVisible ? 'Visible' : 'Not Found'}`);
  console.log(`  • Authentication: ${testResults.adminDomain.authWorking ? 'Working' : 'Failed'}`);
  console.log(`  • Protected Routes: ${testResults.adminDomain.protectedEndpointsWorking ? 'Working' : 'Failed'}`);

  // Specific SSL Recommendations
  console.log('\n🔧 SSL CERTIFICATE RECOMMENDATIONS:');
  console.log('====================================');
  
  if (testResults.mainDomain.httpsError) {
    console.log('❌ CRITICAL: Main domain SSL certificate is broken');
    console.log('   Actions needed:');
    console.log('   1. Check Apache VirtualHost configuration');
    console.log('   2. Verify SSL certificate paths and permissions');
    console.log('   3. Ensure certificate is valid and not expired');
    console.log('   4. Check if wildcard certificate covers main domain');
  }
  
  if (testResults.adminDomain.httpsError) {
    console.log('❌ CRITICAL: Admin subdomain SSL certificate is broken');
    console.log('   Actions needed:');
    console.log('   1. Check admin.bankimonline.com VirtualHost configuration');
    console.log('   2. Verify SSL certificate includes subdomain');
    console.log('   3. Check certificate file paths and Apache SSL directives');
  }

  // Return results for further processing
  return testResults;
}

// Run the diagnosis
if (require.main === module) {
  runSSLDiagnosis()
    .then((results) => {
      console.log('\n✅ SSL Diagnosis completed successfully');
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('\n❌ SSL Diagnosis failed:', error);
      process.exit(1);
    });
}

module.exports = { runSSLDiagnosis };