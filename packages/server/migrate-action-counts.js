const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:yCtOqSQRkZqtWEdQMWJGUPTYIyOZnALp@monorail.proxy.rlwy.net:42693/railway';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'add_action_counts.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Running action count migration...');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the migration worked
    const verifyResult = await client.query(`
      SELECT 
        content_key, 
        action_count, 
        component_type 
      FROM content_items 
      WHERE action_count > 1 
      ORDER BY action_count DESC 
      LIMIT 10
    `);
    
    console.log('\n📊 Sample action counts after migration:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.content_key}: ${row.action_count} actions (${row.component_type})`);
    });
    
    // Check page-level action counts
    const pageResult = await client.query(`
      SELECT 
        content_key, 
        action_count, 
        description 
      FROM content_items 
      WHERE component_type = 'page' 
      ORDER BY action_count DESC
    `);
    
    console.log('\n📄 Page-level action counts:');
    pageResult.rows.forEach(row => {
      console.log(`  ${row.description}: ${row.action_count} actions`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
runMigration(); 