/**
 * Database Status Check Script
 * Checks the current state of the bankim_content database
 */

const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkDatabaseStatus() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking bankim_content database status...\n');
    
    // Check connection
    console.log('📡 Connection Status:');
    const connectionResult = await client.query('SELECT NOW() as current_time, version()');
    console.log(`   ✅ Connected at: ${connectionResult.rows[0].current_time}`);
    console.log(`   📋 Database version: ${connectionResult.rows[0].version.split(' ')[0]} ${connectionResult.rows[0].version.split(' ')[1]}\n`);
    
    // Check if tables exist
    console.log('📊 Table Status:');
    const tablesResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('languages', 'content_categories', 'content_items', 'content_translations')
      ORDER BY tablename
    `);
    
    const expectedTables = ['content_categories', 'content_items', 'content_translations', 'languages'];
    const existingTables = tablesResult.rows.map(row => row.tablename);
    
    expectedTables.forEach(table => {
      const exists = existingTables.includes(table);
      const tableData = tablesResult.rows.find(row => row.tablename === table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}${exists ? ` (indexes: ${tableData.hasindexes}, triggers: ${tableData.hastriggers})` : ' - MISSING'}`);
    });
    
    if (existingTables.length === expectedTables.length) {
      console.log('\n📈 Data Statistics:');
      
      // Check languages
      const languagesResult = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active,
          COUNT(CASE WHEN is_default = true THEN 1 END) as default_lang
        FROM languages
      `);
      const langStats = languagesResult.rows[0];
      console.log(`   🌐 Languages: ${langStats.total} total, ${langStats.active} active, ${langStats.default_lang} default`);
      
      // Check categories
      const categoriesResult = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active
        FROM content_categories
      `);
      const catStats = categoriesResult.rows[0];
      console.log(`   📂 Categories: ${catStats.total} total, ${catStats.active} active`);
      
      // Check content items
      const itemsResult = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active,
          COUNT(CASE WHEN screen_location = 'main_page' THEN 1 END) as main_page_items
        FROM content_items
      `);
      const itemStats = itemsResult.rows[0];
      console.log(`   📄 Content Items: ${itemStats.total} total, ${itemStats.active} active, ${itemStats.main_page_items} main page`);
      
      // Check translations
      const translationsResult = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
          COUNT(CASE WHEN is_default = true THEN 1 END) as default_translations
        FROM content_translations
      `);
      const transStats = translationsResult.rows[0];
      console.log(`   🔤 Translations: ${transStats.total} total, ${transStats.approved} approved, ${transStats.draft} draft, ${transStats.default_translations} default`);
      
      // Check content by language
      console.log('\n🌍 Content by Language:');
      const languageContentResult = await client.query(`
        SELECT 
          ct.language_code,
          l.name as language_name,
          COUNT(*) as translation_count,
          COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) as approved_count
        FROM content_translations ct
        JOIN languages l ON ct.language_code = l.code
        JOIN content_items ci ON ct.content_item_id = ci.id
        WHERE ci.is_active = true
        GROUP BY ct.language_code, l.name
        ORDER BY ct.language_code
      `);
      
      languageContentResult.rows.forEach(row => {
        console.log(`   ${row.language_code} (${row.language_name}): ${row.approved_count}/${row.translation_count} approved`);
      });
      
      // Check functions and views
      console.log('\n🔧 Functions and Views:');
      const functionsResult = await client.query(`
        SELECT 
          proname as function_name,
          prokind as kind
        FROM pg_proc 
        WHERE proname IN ('get_content_by_screen', 'get_content_with_fallback', 'update_updated_at_column')
          AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ORDER BY proname
      `);
      
      const viewsResult = await client.query(`
        SELECT 
          viewname as view_name
        FROM pg_views 
        WHERE viewname IN ('v_content_by_screen', 'v_content_stats')
          AND schemaname = 'public'
        ORDER BY viewname
      `);
      
      const expectedFunctions = ['get_content_by_screen', 'get_content_with_fallback', 'update_updated_at_column'];
      const existingFunctions = functionsResult.rows.map(row => row.function_name);
      
      expectedFunctions.forEach(func => {
        const exists = existingFunctions.includes(func);
        console.log(`   ${exists ? '✅' : '❌'} Function: ${func}`);
      });
      
      const expectedViews = ['v_content_by_screen', 'v_content_stats'];
      const existingViews = viewsResult.rows.map(row => row.view_name);
      
      expectedViews.forEach(view => {
        const exists = existingViews.includes(view);
        console.log(`   ${exists ? '✅' : '❌'} View: ${view}`);
      });
      
      // Test API functions
      console.log('\n🧪 Function Testing:');
      try {
        const testResult = await client.query(`
          SELECT * FROM get_content_by_screen('main_page', 'ru') LIMIT 3
        `);
        console.log(`   ✅ get_content_by_screen: Returns ${testResult.rows.length} rows`);
        
        if (testResult.rows.length > 0) {
          const testKey = testResult.rows[0].content_key;
          const fallbackResult = await client.query(`
            SELECT * FROM get_content_with_fallback($1, 'ru')
          `, [testKey]);
          console.log(`   ✅ get_content_with_fallback: Returns ${fallbackResult.rows.length} rows`);
        }
        
      } catch (funcError) {
        console.log(`   ❌ Function testing failed: ${funcError.message}`);
      }
      
    } else {
      console.log('\n❌ Database schema is incomplete. Run migration script to set up tables.');
    }
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run status check if called directly
if (require.main === module) {
  checkDatabaseStatus()
    .then(() => {
      console.log('\n✨ Status check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Status check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabaseStatus };