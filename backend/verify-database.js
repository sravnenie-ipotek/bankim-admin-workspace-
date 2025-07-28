const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyDatabase() {
  try {
    console.log('🔌 Verifying database connection...');
    console.log('Connection string:', process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL);
    
    // Check current database name
    const dbName = await pool.query(`SELECT current_database()`);
    console.log('\n📊 Current database:', dbName.rows[0].current_database);
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables in database:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check total content items
    const totalItems = await pool.query(`SELECT COUNT(*) as count FROM content_items`);
    console.log('\n📊 Total content_items:', totalItems.rows[0].count);
    
    // Check credit_step data specifically
    const creditStepData = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location IN ('credit_step1', 'credit_step2', 'credit_step3', 'credit_step4')
    `);
    console.log('📊 credit_step items:', creditStepData.rows[0].count);
    
    // Check refinance_credit data
    const refinanceData = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location LIKE 'refinance_credit_%'
    `);
    console.log('📊 refinance_credit items:', refinanceData.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyDatabase();