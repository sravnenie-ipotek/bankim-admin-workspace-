/**
 * Database Migration Script
 * Executes the bankim_content schema setup
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting bankim_content database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database/bankim_content_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Executing schema SQL...');
    
    // Execute the schema
    await client.query(schemaSql);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the setup
    const verificationResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM content_items WHERE screen_location = 'main_page') as content_items,
        (SELECT COUNT(*) FROM content_translations WHERE status = 'approved') as translations,
        (SELECT COUNT(*) FROM languages WHERE is_active = true) as languages
    `);
    
    const stats = verificationResult.rows[0];
    console.log('📊 Database Statistics:');
    console.log(`   - Content Items: ${stats.content_items}`);
    console.log(`   - Approved Translations: ${stats.translations}`);
    console.log(`   - Active Languages: ${stats.languages}`);
    
    if (parseInt(stats.content_items) > 0 && parseInt(stats.translations) > 0) {
      console.log('🎉 Database is ready for use!');
    } else {
      console.log('⚠️  No sample data found. Run the seed script if needed.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };