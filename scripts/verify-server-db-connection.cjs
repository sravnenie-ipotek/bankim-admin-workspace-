const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Checking database connections...\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log(`   CONTENT_DATABASE_URL: ${process.env.CONTENT_DATABASE_URL ? 'Present' : 'Missing'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Present' : 'Missing'}`);

// Show the actual connection strings (masked for security)
if (process.env.CONTENT_DATABASE_URL) {
  const contentUrl = process.env.CONTENT_DATABASE_URL;
  const maskedContentUrl = contentUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`   CONTENT_DATABASE_URL: ${maskedContentUrl}`);
}

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const maskedDbUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`   DATABASE_URL: ${maskedDbUrl}`);
}

// Test both connections
console.log('\n2. Testing CONTENT_DATABASE_URL connection:');
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnections() {
  try {
    // Test CONTENT_DATABASE_URL
    console.log('   Testing CONTENT_DATABASE_URL...');
    const contentClient = await contentPool.connect();
    const contentResult = await contentClient.query('SELECT NOW() as time, current_database() as db_name');
    console.log(`   ✅ Connected to: ${contentResult.rows[0].db_name} at ${contentResult.rows[0].time}`);
    
    // Test the mortgage-refi query on CONTENT_DATABASE_URL
    const mortgageRefiResult = await contentClient.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location LIKE 'refinance_mortgage_%'
    `);
    console.log(`   📊 Found ${mortgageRefiResult.rows[0].count} refinance_mortgage_ items`);
    
    contentClient.release();
    
    // Test DATABASE_URL if different
    if (process.env.DATABASE_URL && process.env.DATABASE_URL !== process.env.CONTENT_DATABASE_URL) {
      console.log('\n3. Testing DATABASE_URL connection:');
      const dbPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      
      const dbClient = await dbPool.connect();
      const dbResult = await dbClient.query('SELECT NOW() as time, current_database() as db_name');
      console.log(`   ✅ Connected to: ${dbResult.rows[0].db_name} at ${dbResult.rows[0].time}`);
      
      // Test the mortgage-refi query on DATABASE_URL
      const dbMortgageRefiResult = await dbClient.query(`
        SELECT COUNT(*) as count 
        FROM content_items 
        WHERE screen_location LIKE 'refinance_mortgage_%'
      `);
      console.log(`   📊 Found ${dbMortgageRefiResult.rows[0].count} refinance_mortgage_ items`);
      
      dbClient.release();
      await dbPool.end();
    }
    
  } catch (error) {
    console.error('❌ Error testing connections:', error.message);
  } finally {
    await contentPool.end();
  }
}

testConnections(); 