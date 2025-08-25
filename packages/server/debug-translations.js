#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

async function debugScreen(screenLocation = 'credit_refi_program_selection') {
  console.log(`🔍 Debugging screen: ${screenLocation}\n`);
  
  // 1. Check raw content_items
  console.log('1️⃣ Raw content_items:');
  const itemsQuery = `
    SELECT id, content_key, component_type, is_active, screen_location
    FROM content_items 
    WHERE screen_location = $1
    ORDER BY content_key
  `;
  const itemsResult = await pool.query(itemsQuery, [screenLocation]);
  console.log(`Found ${itemsResult.rows.length} items:`);
  itemsResult.rows.forEach(row => {
    console.log(`  - ${row.content_key} (${row.component_type}, active: ${row.is_active})`);
  });
  
  // 2. Check existing translations
  console.log('\n2️⃣ Existing translations:');
  const translationsQuery = `
    SELECT ci.content_key, ct.language_code, ct.status, LENGTH(ct.content_value) as content_length
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = $1 AND ci.is_active = TRUE
    ORDER BY ci.content_key, ct.language_code
  `;
  const translationsResult = await pool.query(translationsQuery, [screenLocation]);
  
  const translationMap = {};
  for (const row of translationsResult.rows) {
    if (!translationMap[row.content_key]) {
      translationMap[row.content_key] = {};
    }
    if (row.language_code) {
      translationMap[row.content_key][row.language_code] = {
        status: row.status,
        length: row.content_length
      };
    }
  }
  
  console.log('Translation status by item:');
  for (const [key, translations] of Object.entries(translationMap)) {
    const langs = Object.keys(translations).join(', ') || 'NONE';
    console.log(`  - ${key}: ${langs}`);
    if (Object.keys(translations).length > 0) {
      for (const [lang, info] of Object.entries(translations)) {
        console.log(`    ${lang}: status=${info.status}, length=${info.length}`);
      }
    }
  }
  
  // 3. Check my detection query
  console.log('\n3️⃣ Testing my detection query:');
  const detectionQuery = `
    WITH item_translation_status AS (
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        COUNT(ct.id) as translation_count,
        SUM(CASE WHEN ct.content_value LIKE '%Translation missing%' THEN 1 ELSE 0 END) as missing_flag_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
        AND ct.status IN ('approved', 'draft')
      WHERE ci.screen_location = $1 
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type
    )
    SELECT id, content_key, component_type, translation_count, missing_flag_count
    FROM item_translation_status
    WHERE translation_count = 0 OR missing_flag_count > 0
    ORDER BY content_key
  `;
  
  const detectionResult = await pool.query(detectionQuery, [screenLocation]);
  console.log(`Detection query found ${detectionResult.rows.length} items needing fixes:`);
  detectionResult.rows.forEach(row => {
    console.log(`  - ${row.content_key}: translations=${row.translation_count}, missing_flags=${row.missing_flag_count}`);
  });
  
  // 4. Test creating a translation for one item
  if (detectionResult.rows.length > 0) {
    const testItem = detectionResult.rows[0];
    console.log(`\n4️⃣ Testing translation creation for: ${testItem.content_key}`);
    
    try {
      // Test with Russian
      const testContent = `[RU] ${testItem.content_key.replace(/_/g, ' ')}`;
      
      const insertQuery = `
        INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'approved', NOW(), NOW())
      `;
      
      const insertResult = await pool.query(insertQuery, [testItem.id, 'ru', testContent]);
      console.log(`✅ Successfully created test translation: ${testContent}`);
      
      // Clean up test translation
      await pool.query(
        'DELETE FROM content_translations WHERE content_item_id = $1 AND language_code = $2 AND content_value = $3',
        [testItem.id, 'ru', testContent]
      );
      console.log('✅ Cleaned up test translation');
      
    } catch (error) {
      console.log(`❌ Failed to create test translation:`, error.message);
    }
  }
}

async function main() {
  try {
    await debugScreen('credit_refi_program_selection');
  } catch (error) {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { debugScreen };