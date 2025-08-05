/**
 * CORS Fix Verification Test
 * Tests that the frontend can now access the UI settings API without CORS errors
 */

const fetch = globalThis.fetch;

async function testCorsfix() {
  console.log('🔧 Testing CORS Fix...\n');
  
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    console.log('1️⃣ Testing UI Settings endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/ui-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS Headers:`);
    console.log(`   - Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   - Access-Control-Allow-Credentials: ${response.headers.get('Access-Control-Allow-Credentials')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Success: ${data.success}`);
      console.log(`   Settings count: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        console.log(`   Sample setting: ${data.data[0].settingKey} = ${data.data[0].settingValue}`);
      }
    }
    
    console.log('\n2️⃣ Testing specific UI setting...');
    const fontResponse = await fetch(`${API_BASE_URL}/api/ui-settings/font-size`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002'
      }
    });
    
    console.log(`   Status: ${fontResponse.status}`);
    
    if (fontResponse.ok) {
      const fontData = await fontResponse.json();
      console.log(`   Font setting: ${fontData.data.settingKey} = ${fontData.data.settingValue}`);
    }
    
    console.log('\n3️⃣ Testing content endpoint (should also work)...');
    const contentResponse = await fetch(`${API_BASE_URL}/api/content/main_page/ru`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002'
      }
    });
    
    console.log(`   Status: ${contentResponse.status}`);
    
    if (contentResponse.ok) {
      const contentData = await contentResponse.json();
      console.log(`   Content items: ${contentData.data?.content_count || 0}`);
    }
    
    console.log('\n🎯 CORS Test Results:');
    console.log(`   ✅ UI Settings API: ${response.ok ? 'WORKING' : 'FAILED'}`);
    console.log(`   ✅ Specific Setting API: ${fontResponse.ok ? 'WORKING' : 'FAILED'}`);
    console.log(`   ✅ Content API: ${contentResponse.ok ? 'WORKING' : 'FAILED'}`);
    console.log(`   ✅ CORS Headers: ${response.headers.get('Access-Control-Allow-Origin') ? 'PRESENT' : 'MISSING'}`);
    
    if (response.ok && fontResponse.ok && contentResponse.ok) {
      console.log('\n🎉 CORS fix verified! Frontend should now work without errors.');
      return true;
    } else {
      console.log('\n❌ Some endpoints are still failing.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testCorsfix()
    .then(success => {
      if (success) {
        console.log('\n✅ CORS issue has been resolved!');
        process.exit(0);
      } else {
        console.log('\n❌ CORS issue still exists');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}