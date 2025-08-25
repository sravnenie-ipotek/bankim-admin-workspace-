const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

async function fixCreditRefiDrill() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 INVESTIGATING: Credit-Refi Drill "Translation Missing" Issue');
    console.log('================================================');
    
    // 1. Find all credit-refi screen_locations that users can drill into
    console.log('\n1️⃣ Finding all credit-refi screen locations:');
    const screenLocationQuery = `
      SELECT DISTINCT screen_location, COUNT(*) as item_count
      FROM content_items 
      WHERE screen_location LIKE '%credit%refi%'
        AND screen_location NOT LIKE '%modal%'
        AND is_active = true
      GROUP BY screen_location
      ORDER BY screen_location;
    `;
    
    const screenResults = await client.query(screenLocationQuery);
    console.log('📋 Found credit-refi screen locations:');
    screenResults.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.item_count} items`);
    });
    
    // 2. Test API endpoints for each screen location
    console.log('\n2️⃣ Testing drill API endpoints:');
    const testUrls = [
      'credit_refi_step1',
      'credit_refi_step2', 
      'credit_refi_login',
      'credit_refi_personal_data',
      'credit_refi_income_form'
    ];
    
    for (const screenLocation of testUrls) {
      try {
        const testQuery = `
          SELECT 
            ci.id,
            ci.content_key,
            ci.screen_location,
            COUNT(ct.content_item_id) as translation_count,
            COUNT(CASE WHEN ct.language_code = 'ru' THEN 1 END) as ru_count,
            COUNT(CASE WHEN ct.language_code = 'he' THEN 1 END) as he_count,
            COUNT(CASE WHEN ct.language_code = 'en' THEN 1 END) as en_count
          FROM content_items ci
          LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          WHERE ci.screen_location = $1 AND ci.is_active = TRUE
          GROUP BY ci.id, ci.content_key, ci.screen_location
          LIMIT 3;
        `;
        
        const testResult = await client.query(testQuery, [screenLocation]);
        if (testResult.rows.length > 0) {
          console.log(`  ✅ ${screenLocation}: ${testResult.rows.length} content items found`);
          console.log(`     Sample: ${testResult.rows[0].content_key} (RU:${testResult.rows[0].ru_count}, HE:${testResult.rows[0].he_count}, EN:${testResult.rows[0].en_count})`);
        } else {
          console.log(`  ❌ ${screenLocation}: NO content found`);
        }
      } catch (err) {
        console.log(`  ❌ ${screenLocation}: Query error - ${err.message}`);
      }
    }
    
    // 3. Simulate the exact API call the frontend makes
    console.log('\n3️⃣ Simulating frontend API calls:');
    
    const simulateApiCall = async (screenLocation) => {
      try {
        const apiQuery = `
          SELECT 
            ci.id,
            ci.content_key,
            ci.component_type,
            ci.category,
            ci.screen_location,
            ci.is_active,
            ci.page_number,
            ci.updated_at,
            COALESCE(
              MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END),
              'Translation missing'
            ) AS text_value,
            MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
            MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
            MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
          FROM content_items ci
          LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            AND ct.status IN ('approved', 'draft')
          WHERE ci.screen_location = $1
            AND ci.is_active = TRUE
          GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
                   ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
          ORDER BY ci.page_number, ci.id
          LIMIT 5;
        `;
        
        const result = await client.query(apiQuery, [screenLocation]);
        
        if (result.rows.length > 0) {
          console.log(`  ✅ API simulation for ${screenLocation}:`);
          console.log(`     Found ${result.rows.length} items`);
          
          // Check for "Translation missing" in results
          const missingTranslations = result.rows.filter(row => 
            row.text_value === 'Translation missing' || 
            !row.text_ru || !row.text_he || !row.text_en
          );
          
          if (missingTranslations.length > 0) {
            console.log(`     ⚠️  ${missingTranslations.length} items have missing translations`);
            missingTranslations.forEach(item => {
              console.log(`        - ${item.content_key}: RU:${!!item.text_ru}, HE:${!!item.text_he}, EN:${!!item.text_en}`);
            });
          } else {
            console.log(`     ✅ All items have complete translations`);
            console.log(`        Sample: ${result.rows[0].content_key} = "${result.rows[0].text_en}"`);
          }
          
          // Return success response format
          return {
            success: true,
            data: {
              pageTitle: `Credit Refinancing - ${screenLocation}`,
              actionCount: result.rows.length,
              actions: result.rows.map((row, index) => ({
                id: row.id,
                actionNumber: index + 1,
                content_key: row.content_key,
                translations: {
                  ru: row.text_ru || '',
                  he: row.text_he || '',
                  en: row.text_en || ''
                }
              }))
            }
          };
        } else {
          console.log(`  ❌ API simulation for ${screenLocation}: NO CONTENT FOUND`);
          return { success: false, error: 'No content found' };
        }
      } catch (err) {
        console.log(`  ❌ API simulation for ${screenLocation}: ERROR - ${err.message}`);
        return { success: false, error: err.message };
      }
    };
    
    // Test the exact URLs users are visiting
    const apiResults = {};
    for (const screenLocation of testUrls) {
      apiResults[screenLocation] = await simulateApiCall(screenLocation);
    }
    
    // 4. Provide diagnosis and solution
    console.log('\n4️⃣ DIAGNOSIS & SOLUTION:');
    console.log('================================================');
    
    const workingEndpoints = Object.keys(apiResults).filter(key => apiResults[key].success);
    const failingEndpoints = Object.keys(apiResults).filter(key => !apiResults[key].success);
    
    console.log(`✅ Working endpoints: ${workingEndpoints.length}/${testUrls.length}`);
    workingEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint}: ${apiResults[endpoint].data?.actionCount || 0} items`);
    });
    
    if (failingEndpoints.length > 0) {
      console.log(`❌ Failing endpoints: ${failingEndpoints.length}/${testUrls.length}`);
      failingEndpoints.forEach(endpoint => {
        console.log(`  - ${endpoint}: ${apiResults[endpoint].error}`);
      });
    }
    
    // 5. Test live API endpoints  
    console.log('\n5️⃣ Testing live API endpoints:');
    const http = require('http');
    
    const testLiveApi = (screenLocation) => {
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:4000/api/content/credit-refi/drill/${screenLocation}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              console.log(`  ✅ ${screenLocation}: ${parsed.success ? 'SUCCESS' : 'FAILED'} (${parsed.data?.actionCount || 0} items)`);
              resolve(parsed);
            } catch (err) {
              console.log(`  ❌ ${screenLocation}: JSON parse error`);
              resolve({ success: false, error: 'Parse error' });
            }
          });
        });
        
        req.on('error', (err) => {
          console.log(`  ❌ ${screenLocation}: HTTP error - ${err.message}`);
          resolve({ success: false, error: err.message });
        });
        
        req.setTimeout(5000, () => {
          console.log(`  ⏱️  ${screenLocation}: Timeout`);
          req.abort();
          resolve({ success: false, error: 'Timeout' });
        });
      });
    };
    
    // Test live endpoints
    for (const screenLocation of testUrls) {
      await testLiveApi(screenLocation);
    }
    
    // 6. Recommendations
    console.log('\n6️⃣ RECOMMENDATIONS:');
    console.log('================================================');
    console.log('If drill pages still show "Translation missing":');
    console.log('');
    console.log('1. CLEAR FRONTEND CACHE:');
    console.log('   - Open browser dev tools');
    console.log('   - Go to Application/Storage tab'); 
    console.log('   - Clear localStorage and sessionStorage');
    console.log('   - Do hard refresh (Ctrl+Shift+R)');
    console.log('');
    console.log('2. VERIFY API CALLS:');
    console.log('   - Check Network tab for API calls');
    console.log('   - Look for calls to /api/content/credit-refi/drill/*');
    console.log('   - Verify response contains data.actions array');
    console.log('');
    console.log('3. CACHE CLEARING COMMANDS:');
    console.log('   cd /path/to/project');
    console.log('   rm -rf node_modules/.cache');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixCreditRefiDrill();