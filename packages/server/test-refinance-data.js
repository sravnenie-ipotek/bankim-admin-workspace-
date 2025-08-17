const http = require('http');

console.log('Testing Mortgage Refinance Data Structure\n');
console.log('==========================================\n');

// Test the main mortgage-refi endpoint
const testMainEndpoint = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:4000/api/content/mortgage-refi', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('1. Main /api/content/mortgage-refi endpoint:');
          console.log('   - Success:', result.success);
          console.log('   - Content count:', result.data?.content_count);
          console.log('   - Items found:', result.data?.mortgage_refi_items?.length || 0);
          
          if (result.data?.mortgage_refi_items) {
            console.log('   - Screen locations found:');
            result.data.mortgage_refi_items.forEach(item => {
              console.log(`     • ${item.screen_location} (${item.actionCount} actions)`);
            });
          }
          console.log('');
          resolve();
        } catch (e) {
          console.error('   ERROR:', e.message);
          resolve();
        }
      });
    });
  });
};

// Test drill endpoints for all expected steps
const testDrillEndpoints = async () => {
  const steps = [
    'refinance_mortgage_1',
    'refinance_mortgage_2', 
    'refinance_mortgage_3',
    'refinance_mortgage_4'
  ];
  
  console.log('2. Testing drill endpoints for all 4 steps:\n');
  
  for (const step of steps) {
    await new Promise((resolve) => {
      http.get(`http://localhost:4000/api/content/mortgage-refi/drill/${step}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            console.log(`   ${step}:`);
            console.log(`     - Success: ${result.success}`);
            if (result.success) {
              console.log(`     - Actions: ${result.data?.actionCount || 0}`);
              console.log(`     - Title: ${result.data?.pageTitle || 'N/A'}`);
            } else {
              console.log(`     - Error: ${result.error}`);
            }
          } catch (e) {
            console.log(`     - Parse error: ${e.message}`);
          }
          resolve();
        });
      });
    });
  }
  console.log('');
};

// Test all-items endpoint
const testAllItems = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:4000/api/content/mortgage-refi/all-items', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('3. All items endpoint /api/content/mortgage-refi/all-items:');
          console.log('   - Success:', result.success);
          console.log('   - Items count:', result.data?.all_items?.length || 0);
          
          if (result.data?.all_items?.length > 0) {
            // Group by screen_location
            const byScreen = {};
            result.data.all_items.forEach(item => {
              const screen = item.screen_location || 'unknown';
              byScreen[screen] = (byScreen[screen] || 0) + 1;
            });
            
            console.log('   - Items by screen location:');
            Object.entries(byScreen).forEach(([screen, count]) => {
              console.log(`     • ${screen}: ${count} items`);
            });
          }
          console.log('');
          resolve();
        } catch (e) {
          console.error('   ERROR:', e.message);
          resolve();
        }
      });
    });
  });
};

// Run all tests
const runTests = async () => {
  await testMainEndpoint();
  await testDrillEndpoints();
  await testAllItems();
  
  console.log('==========================================');
  console.log('Test complete!\n');
  
  console.log('SUMMARY:');
  console.log('If steps 2-4 show "No content found", they are missing from the database.');
  console.log('The database needs to be updated with the missing refinance_mortgage_2/3/4 steps.');
};

runTests();