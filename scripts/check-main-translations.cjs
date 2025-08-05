const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMainTranslations() {
  try {
    console.log('🔍 Checking main page translations...\n');
    
    // Check translations for main_page content
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ct_ru.content_value as ru_value,
        ct_ru.status as ru_status,
        ct_he.content_value as he_value,
        ct_he.status as he_status,
        ct_en.content_value as en_value,
        ct_en.status as en_status
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location = 'main_page'
        AND ci.is_active = true
      ORDER BY ci.content_key
    `);
    
    console.log(`📊 Found ${result.rows.length} main page items:\n`);
    
    result.rows.forEach(item => {
      console.log(`📄 ${item.content_key} (${item.component_type}):`);
      console.log(`   RU: ${item.ru_status || 'NO TRANSLATION'} - "${item.ru_value ? item.ru_value.substring(0, 50) + '...' : 'NULL'}"`);
      console.log(`   HE: ${item.he_status || 'NO TRANSLATION'} - "${item.he_value ? item.he_value.substring(0, 50) + '...' : 'NULL'}"`);
      console.log(`   EN: ${item.en_status || 'NO TRANSLATION'} - "${item.en_value ? item.en_value.substring(0, 50) + '...' : 'NULL'}"`);
      console.log('');
    });
    
    // Count approved translations
    const approvedCount = await pool.query(`
      SELECT COUNT(DISTINCT ci.id) as count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'main_page'
        AND ci.is_active = true
        AND ct.status = 'approved'
    `);
    
    console.log(`✅ Items with at least one approved translation: ${approvedCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMainTranslations();