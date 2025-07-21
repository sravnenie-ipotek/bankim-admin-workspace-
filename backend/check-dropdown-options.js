const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:yCtOqSQRkZqtWEdQMWJGUPTYIyOZnALp@monorail.proxy.rlwy.net:42693/railway';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkDropdownOptions() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check for dropdown options for main_page
    const result = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'main_page'
        AND ci.component_type = 'option'
      ORDER BY ci.content_key, ct.language_code
      LIMIT 30
    `);

    console.log('\nDropdown options found:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('\nSample dropdown options:');
      result.rows.forEach(row => {
        console.log(`- ${row.content_key} (${row.language_code}): ${row.content_value}`);
      });
    } else {
      console.log('\nNo dropdown options found for main_page. Checking what component types exist...');
      
      const typesResult = await client.query(`
        SELECT DISTINCT component_type, COUNT(*) as count
        FROM content_items
        WHERE screen_location = 'main_page'
        GROUP BY component_type
      `);
      
      console.log('\nComponent types in main_page:');
      typesResult.rows.forEach(row => {
        console.log(`- ${row.component_type}: ${row.count} items`);
      });
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end();
  }
}

checkDropdownOptions();