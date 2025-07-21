/**
 * API Test Script
 * Tests the bankim_content API endpoints
 */

const path = require('path');

// Use Node.js 18+ built-in fetch
const fetch = globalThis.fetch;

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_BASE_URL = process.env.VITE_CONTENT_API_URL || 'http://localhost:3001';

async function testApi() {
  console.log('🧪 Testing BankIM Content API...');
  console.log(`📡 API URL: ${API_BASE_URL}\n`);
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthData, null, 2)}\n`);
    
    // Test 2: Database Info
    console.log('2️⃣ Testing database info endpoint...');
    const dbInfoResponse = await fetch(`${API_BASE_URL}/api/db-info`);
    const dbInfoData = await dbInfoResponse.json();
    console.log(`   Status: ${dbInfoResponse.status}`);
    console.log(`   Tables: ${dbInfoData.success ? dbInfoData.data.tables.join(', ') : 'Error'}`);
    console.log(`   Content Stats: ${dbInfoData.success ? JSON.stringify(dbInfoData.data.content_stats) : 'Error'}\n`);
    
    // Test 3: Languages
    console.log('3️⃣ Testing languages endpoint...');
    const languagesResponse = await fetch(`${API_BASE_URL}/api/languages`);
    const languagesData = await languagesResponse.json();
    console.log(`   Status: ${languagesResponse.status}`);
    if (languagesData.success) {
      console.log(`   Languages: ${languagesData.data.map(l => `${l.code} (${l.name})`).join(', ')}`);
    }
    console.log();
    
    // Test 4: Content by Screen
    console.log('4️⃣ Testing main page content (Russian)...');
    const contentResponse = await fetch(`${API_BASE_URL}/api/content/main_page/ru`);
    const contentData = await contentResponse.json();
    console.log(`   Status: ${contentResponse.status}`);
    if (contentData.success) {
      console.log(`   Content Count: ${contentData.data.content_count}`);
      console.log(`   Sample Keys: ${Object.keys(contentData.data.content).slice(0, 3).join(', ')}`);
    } else {
      console.log(`   Error: ${contentData.error}`);
    }
    console.log();
    
    // Test 5: Content by Screen (Hebrew)
    console.log('5️⃣ Testing main page content (Hebrew)...');
    const contentHeResponse = await fetch(`${API_BASE_URL}/api/content/main_page/he`);
    const contentHeData = await contentHeResponse.json();
    console.log(`   Status: ${contentHeResponse.status}`);
    if (contentHeData.success) {
      console.log(`   Content Count: ${contentHeData.data.content_count}`);
      console.log(`   Sample Content: ${Object.values(contentHeData.data.content)[0]?.value || 'No content'}`);
    }
    console.log();
    
    // Test 6: Content by Key
    if (contentData.success && Object.keys(contentData.data.content).length > 0) {
      const testKey = Object.keys(contentData.data.content)[0];
      console.log('6️⃣ Testing content by key...');
      const keyResponse = await fetch(`${API_BASE_URL}/api/content/${testKey}/ru`);
      const keyData = await keyResponse.json();
      console.log(`   Status: ${keyResponse.status}`);
      if (keyData.success) {
        console.log(`   Key: ${keyData.data.content_key}`);
        console.log(`   Value: ${keyData.data.value}`);
        console.log(`   Language: ${keyData.data.language}`);
      }
      console.log();
    }
    
    // Test 7: Content Stats
    console.log('7️⃣ Testing content statistics...');
    const statsResponse = await fetch(`${API_BASE_URL}/api/content/stats`);
    const statsData = await statsResponse.json();
    console.log(`   Status: ${statsResponse.status}`);
    if (statsData.success) {
      console.log(`   Stats Records: ${statsData.data.length}`);
      statsData.data.forEach(stat => {
        console.log(`   - ${stat.screen_location} (${stat.language_code}): ${stat.content_count} items`);
      });
    }
    console.log();
    
    console.log('✅ API testing completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Make sure the API server is running and accessible.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testApi()
    .then(() => {
      console.log('🎉 All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testApi };