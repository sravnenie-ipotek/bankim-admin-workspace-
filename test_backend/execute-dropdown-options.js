const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:yCtOqSQRkZqtWEdQMWJGUPTYIyOZnALp@monorail.proxy.rlwy.net:42693/railway';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function executeSql() {
  try {
    await client.connect();
    console.log('Connected to database');

    const sqlFile = path.join(__dirname, '..', 'database', 'add_dropdown_options.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Remove the SELECT query at the end for now
    const sqlCommands = sql.split(';').filter(cmd => 
      cmd.trim() && !cmd.trim().startsWith('SELECT')
    );
    
    console.log(`Executing ${sqlCommands.length} SQL commands...`);
    
    for (const command of sqlCommands) {
      if (command.trim()) {
        await client.query(command);
      }
    }
    
    console.log('SQL executed successfully');
    
    // Now check what was inserted
    const result = await client.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'main_page'
        AND ci.component_type = 'option'
      ORDER BY ci.content_key, ct.language_code
      LIMIT 20
    `);
    
    console.log('\nDropdown options inserted:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('\nSample options:');
      result.rows.forEach(row => {
        console.log(`- ${row.content_key} (${row.language_code}): ${row.content_value}`);
      });
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end();
    process.exit(1);
  }
}

executeSql();