const http = require('http');

const drillEndpoints = [
  // Mortgage drill endpoints
  { name: 'Mortgage Step 1', url: '/api/content/mortgage/drill/mortgage_step1' },
  { name: 'Mortgage Step 2', url: '/api/content/mortgage/drill/mortgage_step2' },
  { name: 'Mortgage Step 3', url: '/api/content/mortgage/drill/mortgage_step3' },
  { name: 'Mortgage Step 4', url: '/api/content/mortgage/drill/mortgage_step4' },
  
  // Credit drill endpoints
  { name: 'Credit Step 1', url: '/api/content/credit/drill/step.1.calculator' },
  { name: 'Credit Step 2', url: '/api/content/credit/drill/step.2.personal_data' },
  { name: 'Credit Step 3', url: '/api/content/credit/drill/step.3.income_data' },
  { name: 'Credit Step 4', url: '/api/content/credit/drill/step.4.result' },
  
  // Menu drill endpoints
  { name: 'Menu Sidebar', url: '/api/content/menu/drill/sidebar' },
  { name: 'Menu Navigation', url: '/api/content/menu/drill/menu_navigation' },
  
  // All items endpoints
  { name: 'Mortgage All Items', url: '/api/content/mortgage/all-items' },
  { name: 'Credit All Items', url: '/api/content/credit/all-items' },
  
  // Mortgage-refi drill endpoints
  { name: 'Mortgage Refi Step 1', url: '/api/content/mortgage-refi/drill/refinance_mortgage_1' },
  { name: 'Mortgage Refi Step 2', url: '/api/content/mortgage-refi/drill/refinance_mortgage_2' },
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint.url,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          // Check if this looks like a drill response vs generic response
          const isDrillResponse = json.data && (json.data.actions || json.data.pageTitle);
          const isGenericResponse = json.status && json.screen_location && json.language_code;
          
          resolve({
            name: endpoint.name,
            url: endpoint.url,
            status: res.statusCode,
            success: json.success,
            error: json.error,
            isDrillResponse,
            isGenericResponse,
            hasData: json.data ? true : false,
            dataKeys: json.data ? Object.keys(json.data).join(', ') : 'none'
          });
        } catch (e) {
          resolve({
            name: endpoint.name,
            url: endpoint.url,
            status: res.statusCode,
            error: 'Failed to parse JSON: ' + e.message,
            response: data.substring(0, 100)
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        error: 'Request failed: ' + e.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('Comprehensive Drill Endpoint Test');
  console.log('=================================\n');
  
  for (const endpoint of drillEndpoints) {
    const result = await testEndpoint(endpoint);
    
    console.log(`Test: ${result.name}`);
    console.log(`URL: ${result.url}`);
    console.log(`Status: ${result.status || 'FAILED'}`);
    console.log(`Success: ${result.success || 'null'}`);
    
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    
    if (result.isGenericResponse) {
      console.log('⚠️  CAUGHT BY GENERIC ROUTE HANDLER');
    } else if (result.isDrillResponse) {
      console.log('✅ Correctly handled by drill endpoint');
    }
    
    if (result.hasData) {
      console.log(`Data keys: ${result.dataKeys}`);
    }
    
    console.log('---\n');
  }
}

runTests();