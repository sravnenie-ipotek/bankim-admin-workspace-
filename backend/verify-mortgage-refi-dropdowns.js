const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:yCtOqSQRkZqtWEdQMWJGUPTYIyOZnALp@monorail.proxy.rlwy.net:42693/railway';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function verifyMortgageRefiDropdowns() {
  try {
    await client.connect();
    console.log('🔍 VERIFYING MORTGAGE-REFI DROPDOWN OPTIONS\n');

    // Test each dropdown field
    const dropdownFields = [
      'mortgage_refinance_bank',
      'mortgage_refinance_type', 
      'mortgage_refinance_registered',
      'mortgage_refinance_why' // This one should already work
    ];

    for (const field of dropdownFields) {
      console.log(`📋 Testing dropdown: ${field}`);
      
      // Count options for this field
      const result = await client.query(`
        SELECT COUNT(*) as option_count
        FROM content_items ci
        WHERE ci.screen_location = 'refinance_mortgage_1'
          AND ci.component_type = 'option'
          AND ci.content_key LIKE $1
          AND ci.is_active = TRUE
      `, [`${field}_option%`]);

      const optionCount = parseInt(result.rows[0].option_count);
      
      if (optionCount > 0) {
        console.log(`   ✅ HAS ${optionCount} OPTIONS`);
        
        // Show the options
        const optionsResult = await client.query(`
          SELECT 
            ci.content_key,
            ct_ru.content_value as ru,
            ct_he.content_value as he,
            ct_en.content_value as en
          FROM content_items ci
          LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
          LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
          LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
          WHERE ci.screen_location = 'refinance_mortgage_1'
            AND ci.component_type = 'option'
            AND ci.content_key LIKE $1
            AND ci.is_active = TRUE
          ORDER BY ci.content_key
        `, [`${field}_option%`]);

        optionsResult.rows.forEach((option, index) => {
          console.log(`      ${index + 1}. ${option.ru} / ${option.he} / ${option.en}`);
        });
      } else {
        console.log(`   ❌ NO OPTIONS FOUND`);
      }
      console.log('');
    }

    // Test API endpoints
    console.log('🌐 TESTING API ENDPOINTS');
    console.log('========================');
    
    const testEndpoints = [
      'mortgage_refinance_bank',
      'mortgage_refinance_type',
      'mortgage_refinance_registered',
      'mortgage_refinance_why'
    ];

    for (const endpoint of testEndpoints) {
      console.log(`\n🔗 Testing API: /api/content/mortgage-refi/${endpoint}/options`);
      
      try {
        const response = await fetch(`http://localhost:3001/api/content/mortgage-refi/${endpoint}/options`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          console.log(`   ✅ API returns ${data.data.length} options`);
          data.data.slice(0, 3).forEach((option, index) => {
            console.log(`      ${index + 1}. ${option.titleRu} / ${option.titleHe}`);
          });
          if (data.data.length > 3) {
            console.log(`      ... and ${data.data.length - 3} more options`);
          }
        } else {
          console.log(`   ❌ API returns no options`);
        }
      } catch (error) {
        console.log(`   ❌ API error: ${error.message}`);
      }
    }

    console.log('\n🏁 Verification complete!');

  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await client.end();
  }
}

// Run verification
verifyMortgageRefiDropdowns(); 