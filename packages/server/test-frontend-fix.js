const http = require('http');

console.log('🔧 Testing Frontend Action Count Fix');
console.log('===================================');

const testAPI = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/content/mortgage-refi',
      method: 'GET'
    };

    http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const items = result.data.mortgage_refi_items;
          
          console.log('📊 API Response Analysis:');
          console.log('========================');
          
          items.forEach(item => {
            const actionCount = item.actionCount;
            const isPlaceholder = item.is_placeholder;
            const status = actionCount === 0 && isPlaceholder ? '✅ Correct (0)' : 
                          actionCount === 38 && !isPlaceholder ? '✅ Correct (38)' : 
                          '❌ Unexpected';
            
            console.log(`Step: ${item.screen_location}`);
            console.log(`  Action Count: ${actionCount} (${typeof actionCount})`);
            console.log(`  Is Placeholder: ${isPlaceholder}`);
            console.log(`  Status: ${status}`);
            console.log('');
          });
          
          const allCorrect = items.every(item => {
            if (item.is_placeholder) {
              return item.actionCount === 0;
            } else {
              return item.actionCount === 38; // Step 1 should have 38 actions
            }
          });
          
          console.log('📋 Summary:');
          console.log(`✅ API Returns: ${items.length} items`);
          console.log(`✅ All action counts are numbers: ${items.every(i => typeof i.actionCount === 'number')}`);
          console.log(`✅ Placeholder steps show 0: ${items.filter(i => i.is_placeholder).every(i => i.actionCount === 0)}`);
          console.log(`✅ Real step shows 38: ${items.filter(i => !i.is_placeholder).every(i => i.actionCount === 38)}`);
          console.log('');
          
          if (allCorrect) {
            console.log('🎉 API TEST PASSED: All action counts are correct!');
            console.log('');
            console.log('💡 Frontend Fix Applied:');
            console.log('   - ContentMortgageRefi.tsx line 146: render: (value) => <span>{typeof value === "number" ? value : 0}</span>');
            console.log('   - Server.js line 271: actionCount: parseInt(row.action_count) || 0');
            console.log('');
            console.log('🚀 Expected Result: Steps 2-4 should now show "0" instead of "1"');
          } else {
            console.log('❌ API TEST FAILED: Some action counts are incorrect');
          }
          
          resolve(allCorrect);
        } catch (e) {
          console.log(`❌ Parse Error: ${e.message}`);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log(`❌ Request Error: ${e.message}`);
      resolve(false);
    }).end();
  });
};

testAPI();