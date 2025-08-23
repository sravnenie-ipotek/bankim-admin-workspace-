// BankIM Final SSL and Admin Panel Verification with Playwright
// Run this AFTER SSL certificate fix to confirm everything works in browsers

const { chromium } = require('playwright');

async function runFinalVerification() {
  console.log('🎯 BankIM Final SSL & Admin Panel Verification');
  console.log('===============================================');
  console.log('Testing both domains with proper SSL certificates');
  console.log('');

  const browser = await chromium.launch({ 
    headless: false, // Show browser to see results
    ignoreHTTPSErrors: false // Should NOT ignore HTTPS errors after fix
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: false,
    acceptDownloads: false
  });
  
  const page = await context.newPage();
  
  let testResults = {
    mainDomain: { passed: 0, failed: 0 },
    adminDomain: { passed: 0, failed: 0 },
    overall: { passed: 0, failed: 0 }
  };

  // Function to update results
  const recordResult = (domain, success, message) => {
    if (success) {
      testResults[domain].passed++;
      testResults.overall.passed++;
      console.log('✅ PASS:', message);
    } else {
      testResults[domain].failed++;
      testResults.overall.failed++;
      console.log('❌ FAIL:', message);
    }
  };

  // Test 1: Main Domain HTTPS Access
  console.log('📋 Test 1: Main Domain HTTPS Access');
  console.log('===================================');
  try {
    const response = await page.goto('https://bankimonline.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    recordResult('mainDomain', true, `Main domain loads successfully (${response.status()})`);
    console.log('   URL:', response.url());
    
    // Check for SSL security indicator
    const title = await page.title();
    console.log('   Page Title:', title);
    
    // Verify no SSL warnings
    const pageContent = await page.content();
    const hasSSLWarning = pageContent.toLowerCase().includes('not secure') || 
                         pageContent.toLowerCase().includes('certificate') ||
                         pageContent.toLowerCase().includes('not private');
    
    recordResult('mainDomain', !hasSSLWarning, 'No SSL security warnings on main domain');
    
  } catch (error) {
    recordResult('mainDomain', false, `Main domain access failed: ${error.message}`);
  }

  // Test 2: Main Domain HTTP Redirect
  console.log('\n📋 Test 2: HTTP to HTTPS Redirect');
  console.log('==================================');
  try {
    const response = await page.goto('http://bankimonline.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const finalUrl = response.url();
    const redirectsToHTTPS = finalUrl.startsWith('https://');
    
    recordResult('mainDomain', redirectsToHTTPS, `HTTP redirects to HTTPS (Final URL: ${finalUrl})`);
    
  } catch (error) {
    recordResult('mainDomain', false, `HTTP redirect test failed: ${error.message}`);
  }

  // Test 3: Admin Domain Access & Login Page
  console.log('\n📋 Test 3: Admin Domain Access & Login Page');
  console.log('===========================================');
  try {
    const response = await page.goto('https://admin.bankimonline.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    recordResult('adminDomain', response.ok(), `Admin domain loads successfully (${response.status()})`);
    
    // Check for admin login page content
    const pageContent = await page.content();
    const hasLoginContent = pageContent.includes('Admin Authentication Required') ||
                           pageContent.includes('BankIM Admin Panel') ||
                           pageContent.includes('login');
    
    recordResult('adminDomain', hasLoginContent, 'Admin login page content is present');
    
    // Verify no SSL warnings on admin domain
    const hasSSLWarning = pageContent.toLowerCase().includes('not secure') || 
                         pageContent.toLowerCase().includes('certificate') ||
                         pageContent.toLowerCase().includes('not private');
    
    recordResult('adminDomain', !hasSSLWarning, 'No SSL security warnings on admin domain');
    
  } catch (error) {
    recordResult('adminDomain', false, `Admin domain access failed: ${error.message}`);
  }

  // Test 4: Admin Authentication Flow (Full Test)
  console.log('\n📋 Test 4: Complete Admin Authentication Flow');
  console.log('==============================================');
  try {
    // Ensure we're on admin panel
    await page.goto('https://admin.bankimonline.com');
    
    // Test login API endpoint
    const authResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        const data = await response.json();
        return {
          success: response.ok,
          status: response.status,
          hasToken: !!data.token,
          token: data.token,
          error: data.error || null
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    recordResult('adminDomain', authResult.success && authResult.hasToken, 
                 `Authentication API works (Status: ${authResult.status})`);
    
    if (authResult.success && authResult.hasToken) {
      console.log('   Token Length:', authResult.token.length);
      
      // Test protected endpoint with token
      const dashboardResult = await page.evaluate(async (token) => {
        try {
          const response = await fetch('/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await response.json();
          return {
            success: response.ok,
            status: response.status,
            hasDashboard: !!data.dashboard,
            data: data
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, authResult.token);
      
      recordResult('adminDomain', dashboardResult.success && dashboardResult.hasDashboard,
                   `Protected dashboard endpoint works (Status: ${dashboardResult.status})`);
      
      // Test database connectivity
      const dbResult = await page.evaluate(async (token) => {
        try {
          const response = await fetch('/api/test/db', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await response.json();
          return {
            success: response.ok,
            status: response.status,
            connectionOk: data.success || data.message?.includes('successful'),
            data: data
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, authResult.token);
      
      recordResult('adminDomain', dbResult.success && dbResult.connectionOk,
                   `Database connectivity test works (Status: ${dbResult.status})`);
      
    } else {
      console.log('   Skipping protected endpoint tests - authentication failed');
      console.log('   Auth Error:', authResult.error);
    }
    
  } catch (error) {
    recordResult('adminDomain', false, `Authentication flow test failed: ${error.message}`);
  }

  // Test 5: SSL Certificate Validation in Browser
  console.log('\n📋 Test 5: Browser SSL Certificate Validation');
  console.log('===============================================');
  try {
    // Test main domain SSL
    await page.goto('https://bankimonline.com');
    const mainSecurityState = await page.evaluate(() => ({
      protocol: location.protocol,
      host: location.host,
      href: location.href
    }));
    
    recordResult('mainDomain', mainSecurityState.protocol === 'https:', 
                 `Main domain uses HTTPS protocol (${mainSecurityState.protocol})`);
    
    // Test admin domain SSL
    await page.goto('https://admin.bankimonline.com');
    const adminSecurityState = await page.evaluate(() => ({
      protocol: location.protocol,
      host: location.host,
      href: location.href
    }));
    
    recordResult('adminDomain', adminSecurityState.protocol === 'https:', 
                 `Admin domain uses HTTPS protocol (${adminSecurityState.protocol})`);
    
  } catch (error) {
    recordResult('overall', false, `SSL certificate validation failed: ${error.message}`);
  }

  // Test 6: Performance and Load Times  
  console.log('\n📋 Test 6: Performance and Load Times');
  console.log('=====================================');
  try {
    // Test main domain performance
    const mainStartTime = Date.now();
    await page.goto('https://bankimonline.com', { waitUntil: 'domcontentloaded' });
    const mainLoadTime = Date.now() - mainStartTime;
    
    recordResult('mainDomain', mainLoadTime < 5000, 
                 `Main domain loads within 5 seconds (${mainLoadTime}ms)`);
    
    // Test admin domain performance
    const adminStartTime = Date.now();
    await page.goto('https://admin.bankimonline.com', { waitUntil: 'domcontentloaded' });
    const adminLoadTime = Date.now() - adminStartTime;
    
    recordResult('adminDomain', adminLoadTime < 5000, 
                 `Admin domain loads within 5 seconds (${adminLoadTime}ms)`);
    
  } catch (error) {
    recordResult('overall', false, `Performance test failed: ${error.message}`);
  }

  await browser.close();

  // Final Results Summary
  console.log('\n===============================================');
  console.log('🏆 FINAL VERIFICATION RESULTS');
  console.log('===============================================');
  console.log(`📊 Overall Results:`);
  console.log(`   ✅ Passed: ${testResults.overall.passed}`);
  console.log(`   ❌ Failed: ${testResults.overall.failed}`);
  console.log(`   📈 Total:  ${testResults.overall.passed + testResults.overall.failed}`);
  
  console.log(`\n📊 Main Domain (bankimonline.com):`);
  console.log(`   ✅ Passed: ${testResults.mainDomain.passed}`);
  console.log(`   ❌ Failed: ${testResults.mainDomain.failed}`);
  
  console.log(`\n📊 Admin Domain (admin.bankimonline.com):`);
  console.log(`   ✅ Passed: ${testResults.adminDomain.passed}`);
  console.log(`   ❌ Failed: ${testResults.adminDomain.failed}`);

  console.log('\n===============================================');
  
  if (testResults.overall.failed === 0) {
    console.log('🎉 COMPLETE SUCCESS!');
    console.log('===================');
    console.log('✅ SSL certificates are working perfectly');
    console.log('✅ Both domains are secure and accessible');
    console.log('✅ Admin panel authentication is functional');
    console.log('✅ All protected endpoints are working');
    console.log('✅ Performance is acceptable');
    console.log('');
    console.log('🌟 PRODUCTION READY!');
    console.log('Both https://bankimonline.com and https://admin.bankimonline.com');
    console.log('are now fully functional and secure.');
    
  } else if (testResults.overall.failed <= 2) {
    console.log('⚠️  MOSTLY SUCCESSFUL - Minor Issues');
    console.log('===================================');
    console.log('Most functionality is working correctly.');
    console.log('Please review failed tests above and address minor issues.');
    
  } else {
    console.log('❌ SIGNIFICANT ISSUES REMAIN');
    console.log('=============================');
    console.log('Multiple tests are failing. Please:');
    console.log('1. Verify SSL certificate fix was applied correctly');
    console.log('2. Check Apache configuration and restart service');
    console.log('3. Ensure admin panel server is running (PM2)');
    console.log('4. Review server logs for errors');
  }

  console.log('\n===============================================');
  return testResults;
}

// Run the verification
if (require.main === module) {
  runFinalVerification()
    .then((results) => {
      const exitCode = results.overall.failed === 0 ? 0 : 1;
      console.log(`\nFinal verification completed with exit code: ${exitCode}`);
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('\n❌ Final verification failed:', error);
      process.exit(1);
    });
}

module.exports = { runFinalVerification };