/**
 * Frontend Integration Test
 * Tests that the frontend can properly connect to and retrieve data from the bankim_content API
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Test configuration
const FRONTEND_URL = 'http://localhost:3004'; // Vite dev server running port
const API_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 30000;

async function testFrontendIntegration() {
  console.log('🧪 Starting Frontend Integration Test...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set up console logging
    page.on('console', (msg) => {
      const type = msg.type();
      if (['log', 'info', 'warn', 'error'].includes(type)) {
        console.log(`📱 [${type.toUpperCase()}] ${msg.text()}`);
      }
    });
    
    // Set up network monitoring
    const networkRequests = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/content') || url.includes('/health')) {
        networkRequests.push({
          url,
          method: request.method(),
          timestamp: Date.now()
        });
        console.log(`📡 API Request: ${request.method()} ${url}`);
      }
    });
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/content') || url.includes('/health')) {
        const status = response.status();
        console.log(`📡 API Response: ${status} ${url}`);
        
        if (status >= 400) {
          try {
            const text = await response.text();
            console.log(`❌ Response body:`, text.substring(0, 500));
          } catch (e) {
            console.log(`❌ Could not read response body`);
          }
        }
      }
    });
    
    console.log(`🌍 Navigating to ${FRONTEND_URL}/content/main...`);
    
    // Navigate to the content main page
    await page.goto(`${FRONTEND_URL}/content/main`, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait for the component to mount and make API calls
    console.log('⏳ Waiting for content to load...');
    
    // Wait for the content to appear - look for the page title
    try {
      await page.waitForSelector('.page-title', { timeout: 10000 });
      console.log('✅ Page title found');
    } catch (error) {
      console.log('⚠️ Page title not found, continuing...');
    }
    
    // Wait a bit more for API calls to complete
    await page.waitForTimeout(3000);
    
    // Check if there were API calls
    console.log(`\n📊 Network Analysis:`);
    console.log(`   Total API requests: ${networkRequests.length}`);
    
    if (networkRequests.length > 0) {
      console.log(`   API endpoints called:`);
      networkRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.method} ${req.url}`);
      });
    }
    
    // Check for error elements
    const errorElements = await page.$$('.error-state, .error');
    if (errorElements.length > 0) {
      console.log(`⚠️ Found ${errorElements.length} error elements on page`);
    }
    
    // Check for loading elements
    const loadingElements = await page.$$('.loading, .loading-spinner');
    if (loadingElements.length > 0) {
      console.log(`⏳ Found ${loadingElements.length} loading elements on page`);
    }
    
    // Check for content table
    const contentTable = await page.$('.content-table, .actions-table');
    if (contentTable) {
      console.log('✅ Content table found on page');
      
      // Try to count rows
      const rows = await page.$$('.content-table tbody tr, .actions-table tbody tr, .table-row');
      console.log(`   Table rows: ${rows.length}`);
    } else {
      console.log('⚠️ Content table not found');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({
      path: 'test-screenshot.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved as test-screenshot.png');
    
    // Get page content for analysis
    const pageTitle = await page.title();
    console.log(`📄 Page title: "${pageTitle}"`);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasContentText = bodyText.includes('Калькулятор ипотеки') || 
                          bodyText.includes('Основной источник дохода') ||
                          bodyText.includes('действий на странице');
    
    if (hasContentText) {
      console.log('✅ Russian content found on page');
    } else {
      console.log('⚠️ Expected Russian content not found');
      console.log('📋 Page text sample:', bodyText.substring(0, 200) + '...');
    }
    
    // Check final integration status
    const hasApiCalls = networkRequests.length > 0;
    const hasContent = hasContentText;
    const hasErrors = errorElements.length > 0;
    
    console.log(`\n🎯 Integration Test Results:`);
    console.log(`   ✅ API calls made: ${hasApiCalls}`);
    console.log(`   ✅ Content loaded: ${hasContent}`);
    console.log(`   ❌ Errors found: ${hasErrors}`);
    
    if (hasApiCalls && hasContent && !hasErrors) {
      console.log(`\n🎉 Frontend integration test PASSED!`);
      return true;
    } else {
      console.log(`\n❌ Frontend integration test FAILED`);
      console.log(`   Need to investigate: ${!hasApiCalls ? 'API calls' : ''} ${!hasContent ? 'content loading' : ''} ${hasErrors ? 'error handling' : ''}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Test API availability first
async function testApiAvailability() {
  console.log('🔍 Testing API availability...');
  
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      console.log('✅ API is healthy and available');
      return true;
    } else {
      console.log('❌ API is not healthy:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ API is not accessible:', error.message);
    console.log('💡 Make sure the backend server is running on port 3001');
    return false;
  }
}

// Main test execution
async function runIntegrationTest() {
  console.log('🚀 BankIM Content Management - Frontend Integration Test\n');
  
  // Test API first
  const apiAvailable = await testApiAvailability();
  if (!apiAvailable) {
    console.log('\n❌ Cannot proceed with frontend test - API is not available');
    process.exit(1);
  }
  
  console.log('');
  
  // Test frontend integration
  const testPassed = await testFrontendIntegration();
  
  if (testPassed) {
    console.log('\n🎉 All integration tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Integration tests failed');
    process.exit(1);
  }
}

// Use Node.js built-in fetch for Node 18+
const fetch = globalThis.fetch;

if (require.main === module) {
  runIntegrationTest().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { testFrontendIntegration, testApiAvailability };