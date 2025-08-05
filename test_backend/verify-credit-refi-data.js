const { Pool } = require('pg');

async function verifyCreditRefiData() {
  const databaseUrl = process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL;
  const isRailway = databaseUrl && databaseUrl.includes('railway.app');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isRailway ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('Verifying credit-refi data in Railway database...\n');
    
    // Check what credit-refi data exists
    const result = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ct_ru.content_value as russian_text,
        ct_he.content_value as hebrew_text,
        ct_en.content_value as english_text,
        ci.updated_at
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location LIKE 'refinance_credit%'
        AND ci.is_active = TRUE
        AND (ci.content_key LIKE '%.title' OR ci.content_key LIKE '%.banner%')
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);
    
    console.log('Credit-Refi Title/Banner Content:');
    console.log('================================');
    result.rows.forEach(row => {
      console.log(`\nScreen: ${row.screen_location}`);
      console.log(`Key: ${row.content_key}`);
      console.log(`Russian: ${row.russian_text || '(empty)'}`);
      console.log(`Hebrew: ${row.hebrew_text || '(empty)'}`);
      console.log(`English: ${row.english_text || '(empty)'}`);
      console.log(`Last Updated: ${row.updated_at}`);
    });
    
    // Count total items per screen
    const countResult = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as item_count
      FROM content_items
      WHERE screen_location LIKE 'refinance_credit%'
        AND is_active = TRUE
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('\n\nTotal Items per Screen:');
    console.log('======================');
    countResult.rows.forEach(row => {
      console.log(`${row.screen_location}: ${row.item_count} items`);
    });
    
  } catch (error) {
    console.error('Query error:', error);
  } finally {
    await pool.end();
  }
}

// Load environment variables and run
require('dotenv').config({ path: '../.env' });
verifyCreditRefiData();