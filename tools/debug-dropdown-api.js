const { Pool } = require('pg');
const fetch = require('node-fetch');

const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function debugDropdownAPI() {
  try {
    console.log('=== TESTING API vs DATABASE ===\n');

    // 1. Test what the database query returns
    console.log('1. Database query result:');
    const dbResult = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.updated_at,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ROW_NUMBER() OVER (ORDER BY ci.screen_location, ci.content_key) as action_number
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND ct_ru.status = 'approved'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND ct_he.status = 'approved'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND ct_en.status = 'approved'
      WHERE ci.screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4')
        AND ci.is_active = true
        AND ci.component_type = 'dropdown_container'
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 5
    `);

    console.log(`   Found ${dbResult.rows.length} dropdown_container components in database`);
    dbResult.rows.forEach(row => {
      console.log(`   - ${row.content_key} (${row.component_type}): ${row.title_ru || 'no RU'}`);
    });

    // 2. Test what the API returns
    console.log('\n2. API response:');
    const apiResponse = await fetch('http://localhost:3001/api/content/mortgage/all-items');
    const apiData = await apiResponse.json();
    
    if (apiData.success) {
      const dropdownContainers = apiData.data.actions.filter(action => action.component_type === 'dropdown_container');
      console.log(`   Found ${dropdownContainers.length} dropdown_container components in API response`);
      
      dropdownContainers.slice(0, 5).forEach(action => {
        console.log(`   - ${action.content_key} (${action.component_type}): ${action.translations?.ru || 'no RU'}`);
      });

      // 3. Compare component types
      console.log('\n3. All component types in API response:');
      const componentTypes = {};
      apiData.data.actions.forEach(action => {
        componentTypes[action.component_type] = (componentTypes[action.component_type] || 0) + 1;
      });
      
      Object.entries(componentTypes).sort(([,a], [,b]) => b - a).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    } else {
      console.log('   API Error:', apiData.error);
    }

    process.exit(0);
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
}

debugDropdownAPI();