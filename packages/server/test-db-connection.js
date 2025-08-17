const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

async function testDatabase() {
  try {
    console.log('🔍 Testing BankIM Database Connection...');
    console.log('==========================================');
    
    // Test basic connection
    console.log('\n📡 Testing database connectivity...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Show which database we're connected to
    const dbInfoResult = await client.query('SELECT current_database(), inet_server_addr(), inet_server_port()');
    const dbInfo = dbInfoResult.rows[0];
    console.log(`📊 Connected to database: ${dbInfo.current_database}`);
    console.log(`🌐 Server: ${dbInfo.inet_server_addr}:${dbInfo.inet_server_port}`);
    
    // Test content tables exist
    console.log('\n📋 Checking core content tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('content_items', 'content_translations', 'application_contexts')
      ORDER BY table_name
    `);
    
    const coreTables = ['content_items', 'content_translations'];
    const optionalTables = ['application_contexts'];
    const foundTables = tablesResult.rows.map(row => row.table_name);
    
    let coreTablesFound = 0;
    coreTables.forEach(table => {
      if (foundTables.includes(table)) {
        console.log(`✅ Table '${table}' exists`);
        coreTablesFound++;
      } else {
        console.log(`❌ Table '${table}' MISSING`);
      }
    });
    
    optionalTables.forEach(table => {
      if (foundTables.includes(table)) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`ℹ️  Table '${table}' not found (optional - used for application contexts)`);
      }
    });
    
    if (coreTablesFound < coreTables.length) {
      console.log('⚠️  WARNING: Missing core content tables - may be connected to wrong database');
    }
    
    // Test content count by screen_location (CRITICAL VALIDATION)
    console.log('\n🔢 Testing refinance mortgage content counts...');
    const contentResult = await client.query(`
      SELECT 
        screen_location,
        COUNT(*) as count,
        MAX(updated_at) as last_updated
      FROM content_items 
      WHERE screen_location IN ('refinance_mortgage_1', 'refinance_mortgage_2', 'refinance_mortgage_3', 'refinance_mortgage_4')
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('📊 Content counts by refinance step:');
    const expectedCounts = {
      'refinance_mortgage_1': 32,
      'refinance_mortgage_2': 20,
      'refinance_mortgage_3': 4,
      'refinance_mortgage_4': 6
    };
    
    let totalFound = 0;
    let correctDatabase = true;
    
    contentResult.rows.forEach(row => {
      const expected = expectedCounts[row.screen_location];
      const actual = parseInt(row.count);
      const status = actual === expected ? '✅' : (actual === 0 ? '❌' : '⚠️');
      
      console.log(`  ${status} ${row.screen_location}: ${actual} items (expected: ${expected})`);
      totalFound += actual;
      
      if (actual !== expected) {
        correctDatabase = false;
      }
    });
    
    // Check for missing steps
    const foundSteps = contentResult.rows.map(row => row.screen_location);
    const missingSteps = Object.keys(expectedCounts).filter(step => !foundSteps.includes(step));
    
    if (missingSteps.length > 0) {
      console.log(`❌ Missing steps: ${missingSteps.join(', ')}`);
      correctDatabase = false;
    }
    
    console.log(`📋 Total refinance content items found: ${totalFound} (expected: 62)`);
    
    // Final assessment
    console.log('\n🎯 DATABASE CONNECTION ASSESSMENT:');
    if (correctDatabase && totalFound >= 60) {
      console.log('✅ SUCCESS: Connected to correct shortline Railway database');
      console.log('✅ All content counts match expected values');
      console.log('✅ Ready for development work');
    } else if (totalFound === 0) {
      console.log('❌ CRITICAL: No refinance content found');
      console.log('❌ Likely connected to wrong/empty database');
      console.log('🔧 ACTION: Check CONTENT_DATABASE_URL in .env file');
      console.log('🔧 Expected: postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway');
    } else {
      console.log('⚠️  WARNING: Content counts don\'t match expected values');
      console.log('⚠️  May be using wrong database or data is inconsistent');
      console.log('🔧 ACTION: Verify database configuration and content integrity');
    }
    
    // Test sample content access
    console.log('\n🔍 Testing sample content access...');
    const sampleResult = await client.query(`
      SELECT 
        ci.id, ci.content_key, ci.screen_location, ci.component_type,
        ct.language_code, ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_mortgage_1'
        AND ci.is_active = true
      LIMIT 3
    `);
    
    if (sampleResult.rows.length > 0) {
      console.log('✅ Sample content accessible');
      console.log(`📄 Sample: ${sampleResult.rows[0].content_key} (${sampleResult.rows[0].component_type})`);
    } else {
      console.log('❌ No sample content accessible');
    }
    
    client.release();
    
  } catch (error) {
    console.error('\n❌ DATABASE TEST FAILED:');
    console.error('Error:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n🔧 CONNECTION TROUBLESHOOTING:');
      console.log('1. Check internet connectivity');
      console.log('2. Verify CONTENT_DATABASE_URL in .env file');
      console.log('3. Ensure SSL settings: { rejectUnauthorized: false }');
      console.log('4. Confirm Railway database credentials are current');
    }
    
    if (error.message.includes('password') || error.message.includes('authentication')) {
      console.log('\n🔧 AUTHENTICATION TROUBLESHOOTING:');
      console.log('1. Verify database credentials in connection string');
      console.log('2. Check if Railway database password has changed');
      console.log('3. Ensure proper URL encoding of special characters');
    }
    
  } finally {
    await pool.end();
  }
}

// Run the test
testDatabase().then(() => {
  console.log('\n📋 Test completed. Check results above for any issues.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});