const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Database URL:', process.env.CONTENT_DATABASE_URL ? 'Using CONTENT_DATABASE_URL' : 'Using fallback DATABASE_URL');
    
    const client = await pool.connect();
    
    // Test basic connectivity
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log('Server time:', result.rows[0].now);
    
    // Check content_items count by screen_location for refinance steps
    console.log('\n📊 Checking refinance step content counts:');
    const refinanceQuery = `
      SELECT 
        screen_location,
        COUNT(*) as count
      FROM content_items 
      WHERE screen_location LIKE '%refinance%step%'
      GROUP BY screen_location 
      ORDER BY screen_location;
    `;
    
    const refinanceResult = await client.query(refinanceQuery);
    refinanceResult.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.count} items`);
    });
    
    if (refinanceResult.rows.length === 0) {
      console.log('  No refinance step content found');
    }
    
    // First check the table schema
    console.log('\n📋 Checking content_items table structure:');
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'content_items' 
      ORDER BY ordinal_position;
    `;
    
    const schemaResult = await client.query(schemaQuery);
    schemaResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Search for any content related to credit or refi
    console.log('\n🔍 Searching for credit/refi related content:');
    const searchQuery = `
      SELECT DISTINCT screen_location
      FROM content_items 
      WHERE screen_location ILIKE '%credit%' OR screen_location ILIKE '%refi%'
      ORDER BY screen_location;
    `;
    
    const searchResult = await client.query(searchQuery);
    if (searchResult.rows.length > 0) {
      console.log('  Found these credit/refi screen locations:');
      searchResult.rows.forEach(row => {
        console.log(`    ${row.screen_location}`);
      });
    } else {
      console.log('  ❌ NO credit/refi content found at all!');
    }
    
    // Also check for any drill-related content
    console.log('\n🔍 Searching for drill-related content:');
    const drillQuery = `
      SELECT DISTINCT screen_location
      FROM content_items 
      WHERE screen_location ILIKE '%drill%'
      ORDER BY screen_location;
    `;
    
    const drillResult = await client.query(drillQuery);
    if (drillResult.rows.length > 0) {
      console.log('  Found these drill screen locations:');
      drillResult.rows.forEach(row => {
        console.log(`    ${row.screen_location}`);
      });
    } else {
      console.log('  ❌ NO drill content found at all!');
    }
    
    // Check how translations are actually stored
    console.log('\n🌐 Checking content_translations table structure:');
    try {
      const contentTranslationsSchemaQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'content_translations' 
        ORDER BY ordinal_position;
      `;
      
      const contentTranslationsSchemaResult = await client.query(contentTranslationsSchemaQuery);
      if (contentTranslationsSchemaResult.rows.length > 0) {
        console.log('  Content_translations table exists:');
        contentTranslationsSchemaResult.rows.forEach(row => {
          console.log(`    ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
        
        // Check if there are any content translations at all
        const contentTranslationsCountQuery = `SELECT COUNT(*) as count FROM content_translations`;
        const contentTranslationsCountResult = await client.query(contentTranslationsCountQuery);
        console.log(`  Total content_translations in database: ${contentTranslationsCountResult.rows[0].count}`);
      } else {
        console.log('  ❌ Content_translations table does not exist!');
      }
    } catch (err) {
      console.log('  Content_translations table query failed:', err.message);
    }
    
    // Test the exact API call the frontend is making
    console.log('\n🧪 Testing credit-refi drill API endpoint simulation:');
    const apiTestQuery = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        ci.updated_at
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        AND ct.status IN ('approved', 'draft')
      WHERE ci.screen_location = 'credit_refi_step1'
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
               ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
      ORDER BY ci.page_number, ci.id
      LIMIT 5;
    `;
    
    try {
      const apiTestResult = await client.query(apiTestQuery);
      console.log(`  API test query result: ${apiTestResult.rows.length} rows`);
      if (apiTestResult.rows.length > 0) {
        console.log('  Sample result:', JSON.stringify(apiTestResult.rows[0], null, 2));
      }
    } catch (err) {
      console.log('  API test query failed:', err.message);
      
      // Try simpler query without content_translations
      console.log('  Trying simpler query without content_translations:');
      const simpleQuery = `
        SELECT 
          ci.id,
          ci.content_key,
          ci.component_type,
          ci.screen_location
        FROM content_items ci
        WHERE ci.screen_location = 'credit_refi_step1'
          AND ci.is_active = TRUE
        LIMIT 5;
      `;
      
      const simpleResult = await client.query(simpleQuery);
      console.log(`  Simple query result: ${simpleResult.rows.length} rows`);
      if (simpleResult.rows.length > 0) {
        console.log('  Sample result:', JSON.stringify(simpleResult.rows[0], null, 2));
      } else {
        console.log('  ❌ No credit_refi_step1 content found at all!');
      }
    }
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();