const http = require('http');

const testDrillEndpoints = async () => {
  console.log('Testing Mortgage Refinancing Drill Endpoints\n');
  console.log('==============================================\n');

  const steps = [
    'refinance_mortgage_1',
    'refinance_mortgage_2',
    'refinance_mortgage_3',
    'refinance_mortgage_4'
  ];

  for (const step of steps) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: `/api/content/mortgage-refi/drill/${step}`,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            console.log(`Step: ${step}`);
            console.log(`  Success: ${result.success}`);
            if (result.success && result.data) {
              const actionCount = result.data.actionCount || (result.data.actions ? result.data.actions.length : 0);
              console.log(`  Actions: ${actionCount}`);
              console.log(`  Page Title: ${result.data.pageTitle || 'N/A'}`);
              if (result.data.actions && result.data.actions.length > 0) {
                console.log(`  First Action: ${result.data.actions[0].content_key || result.data.actions[0].description || 'N/A'}`);
              }
            } else {
              console.log(`  Error: ${result.error || 'Unknown error'}`);
            }
            console.log('');
          } catch (e) {
            console.log(`  Parse Error: ${e.message}\n`);
          }
          resolve();
        });
      });

      req.on('error', (e) => {
        console.log(`  Request Error: ${e.message}\n`);
        resolve();
      });

      req.end();
    });
  }
};

testDrillEndpoints();