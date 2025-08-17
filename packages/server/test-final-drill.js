const http = require('http');

console.log('Final Test: Mortgage Refinancing Drill Pages');
console.log('==============================================\n');

const testStep = (stepId, expectedActions) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api/content/mortgage-refi/drill/${stepId}`,
      method: 'GET'
    };

    http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const actionCount = result.data?.action_count || 0;
          const isPlaceholder = result.data?.is_placeholder || false;
          const status = actionCount === expectedActions ? '✅' : '❌';
          
          console.log(`${status} Step: ${stepId}`);
          console.log(`   Expected: ${expectedActions} actions`);
          console.log(`   Actual: ${actionCount} actions`);
          console.log(`   Placeholder: ${isPlaceholder}`);
          
          if (isPlaceholder && result.data?.step_info) {
            console.log(`   Message: ${result.data.step_info.message}`);
          }
          console.log('');
          
          resolve(actionCount === expectedActions);
        } catch (e) {
          console.log(`❌ Step: ${stepId} - Error: ${e.message}\n`);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log(`❌ Step: ${stepId} - Request Error: ${e.message}\n`);
      resolve(false);
    }).end();
  });
};

const runTests = async () => {
  const tests = [
    { stepId: 'refinance_mortgage_1', expected: 38 },  // Real content
    { stepId: 'refinance_mortgage_2', expected: 0 },   // Placeholder
    { stepId: 'refinance_mortgage_3', expected: 0 },   // Placeholder
    { stepId: 'refinance_mortgage_4', expected: 0 }    // Placeholder
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testStep(test.stepId, test.expected);
    if (result) passed++;
    else failed++;
  }

  console.log('==============================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ ALL DRILL PAGES WORKING CORRECTLY!');
  } else {
    console.log('❌ Some drill pages have issues');
  }
};

runTests();