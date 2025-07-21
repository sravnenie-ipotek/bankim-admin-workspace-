/**
 * Simple API Integration Test
 * Tests the exact API calls that the frontend ContentMain component makes
 */

const fetch = globalThis.fetch;

const API_BASE_URL = 'http://localhost:3001';

async function testApiIntegration() {
  console.log('🧪 Testing API Integration for ContentMain Component\n');
  
  try {
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'healthy') {
      console.log('✅ API is healthy');
    } else {
      throw new Error(`API not healthy: ${healthData.message}`);
    }
    
    console.log('\n2️⃣ Testing main page content (Russian)...');
    const ruResponse = await fetch(`${API_BASE_URL}/api/content/main_page/ru`);
    const ruData = await ruResponse.json();
    
    console.log(`   Status: ${ruResponse.status}`);
    console.log(`   Content count: ${ruData.data?.content_count || 0}`);
    
    if (!ruData.success) {
      throw new Error(`Russian content failed: ${ruData.error}`);
    }
    
    console.log('\n3️⃣ Testing main page content (Hebrew)...');
    const heResponse = await fetch(`${API_BASE_URL}/api/content/main_page/he`);
    const heData = await heResponse.json();
    
    console.log(`   Status: ${heResponse.status}`);
    console.log(`   Content count: ${heData.data?.content_count || 0}`);
    
    if (!heData.success) {
      throw new Error(`Hebrew content failed: ${heData.error}`);
    }
    
    console.log('\n4️⃣ Testing main page content (English)...');
    const enResponse = await fetch(`${API_BASE_URL}/api/content/main_page/en`);
    const enData = await enResponse.json();
    
    console.log(`   Status: ${enResponse.status}`);
    console.log(`   Content count: ${enData.data?.content_count || 0}`);
    
    if (!enData.success) {
      throw new Error(`English content failed: ${enData.error}`);
    }
    
    console.log('\n📊 Analyzing API Response Data...');
    
    // Simulate the frontend transformation logic
    const apiResponses = [ruData.data, heData.data, enData.data];
    const contentPages = transformApiToContentPages(apiResponses);
    
    console.log(`   Transformed pages: ${contentPages.length}`);
    
    if (contentPages.length > 0) {
      console.log(`   Sample page:`);
      console.log(`   - ID: ${contentPages[0].id}`);
      console.log(`   - Title: ${contentPages[0].title}`);
      console.log(`   - Russian: ${contentPages[0].titleRu}`);
      console.log(`   - Hebrew: ${contentPages[0].titleHe}`);
      console.log(`   - English: ${contentPages[0].titleEn}`);
      console.log(`   - Status: ${contentPages[0].status}`);
      console.log(`   - Action Count: ${contentPages[0].actionCount}`);
    }
    
    console.log('\n🎯 Integration Test Results:');
    console.log(`   ✅ Health check: PASS`);
    console.log(`   ✅ Russian content: PASS (${ruData.data.content_count} items)`);
    console.log(`   ✅ Hebrew content: PASS (${heData.data.content_count} items)`);
    console.log(`   ✅ English content: PASS (${enData.data.content_count} items)`);
    console.log(`   ✅ Data transformation: PASS (${contentPages.length} pages)`);
    
    console.log('\n🎉 All API integration tests PASSED!');
    console.log('   The frontend should be able to load real data from the bankim_content API');
    
    return true;
    
  } catch (error) {
    console.error('❌ API integration test failed:', error.message);
    return false;
  }
}

// Simplified version of the frontend transformation logic
function transformApiToContentPages(apiResponses) {
  const contentMap = new Map();
  
  apiResponses.forEach(response => {
    if (response && response.content) {
      Object.entries(response.content).forEach(([contentKey, contentData]) => {
        // Extract action number from content_key pattern
        // Expected: app.main.action.{number}.dropdown.{name}
        const actionMatch = contentKey.match(/app\.main\.action\.(\d+)\./);
        if (actionMatch) {
          const actionNumber = parseInt(actionMatch[1]);
          const actionId = `action-${actionNumber}`;
          
          if (!contentMap.has(actionId)) {
            contentMap.set(actionId, {
              id: actionId,
              pageNumber: actionNumber,
              actionCount: 1,
              category: 'main',
              status: contentData.status === 'approved' ? 'published' : 'draft',
              createdAt: new Date('2024-12-01'),
              lastModified: new Date('2024-12-15'),
              createdBy: 'content-manager',
              modifiedBy: 'content-manager',
              url: `/dropdown-action-${actionNumber}`
            });
          }
          
          const page = contentMap.get(actionId);
          
          // Set titles based on language
          if (response.language_code === 'ru') {
            page.titleRu = Array.isArray(contentData.value) ? contentData.value[0] : contentData.value;
            page.title = page.titleRu; // Primary title
          } else if (response.language_code === 'he') {
            page.titleHe = Array.isArray(contentData.value) ? contentData.value[0] : contentData.value;
          } else if (response.language_code === 'en') {
            page.titleEn = Array.isArray(contentData.value) ? contentData.value[0] : contentData.value;
          }
          
          // Count dropdown options for actionCount
          if (contentData.component_type === 'dropdown' && Array.isArray(contentData.value)) {
            page.actionCount = Math.max(page.actionCount || 1, contentData.value.length);
          }
        }
      });
    }
  });
  
  // Convert map to array and ensure all required fields are present
  return Array.from(contentMap.values())
    .filter(page => page.title) // Only include pages with titles
    .map(page => ({
      ...page,
      title: page.title || page.titleRu || page.titleEn || 'Untitled',
      actionCount: page.actionCount || 1
    }))
    .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
}

// Run the test
if (require.main === module) {
  testApiIntegration()
    .then(success => {
      if (success) {
        console.log('\n🎉 Integration test completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Integration test failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testApiIntegration };