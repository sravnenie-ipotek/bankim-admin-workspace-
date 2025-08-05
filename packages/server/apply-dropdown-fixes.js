const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function fixDropdownIssues() {
  try {
    console.log('🔧 Applying dropdown fixes...\n');
    
    // Apply each fix individually for better error handling
    const fixes = [
      {
        name: 'calculate_mortgage_type - Russian',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "standard", "label": "Стандартная ипотека"},
                {"value": "refinance", "label": "Рефинансирование"},
                {"value": "commercial", "label": "Коммерческая ипотека"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_type'
              ) AND language_code = 'ru'`
      },
      {
        name: 'calculate_mortgage_type - Hebrew',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "standard", "label": "משכנתא רגילה"},
                {"value": "refinance", "label": "מיחזור משכנתא"},
                {"value": "commercial", "label": "משכנתא מסחרית"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_type'
              ) AND language_code = 'he'`
      },
      {
        name: 'calculate_mortgage_type - English',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "standard", "label": "Standard Mortgage"},
                {"value": "refinance", "label": "Mortgage Refinance"},
                {"value": "commercial", "label": "Commercial Mortgage"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_type'
              ) AND language_code = 'en'`
      },
      {
        name: 'mortgage_refinance_bank - Russian',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "bank_hapoalim", "label": "Банк Апоалим"},
                {"value": "bank_leumi", "label": "Банк Леуми"},
                {"value": "bank_discount", "label": "Банк Дисконт"},
                {"value": "mizrahi_tefahot", "label": "Мизрахи Тфахот"},
                {"value": "first_international", "label": "Первый международный банк"},
                {"value": "other", "label": "Другой банк"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'
              ) AND language_code = 'ru'`
      },
      {
        name: 'mortgage_refinance_bank - Hebrew',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "bank_hapoalim", "label": "בנק הפועלים"},
                {"value": "bank_leumi", "label": "בנק לאומי"},
                {"value": "bank_discount", "label": "בנק דיסקונט"},
                {"value": "mizrahi_tefahot", "label": "מזרחי טפחות"},
                {"value": "first_international", "label": "הבנק הבינלאומי הראשון"},
                {"value": "other", "label": "בנק אחר"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'
              ) AND language_code = 'he'`
      },
      {
        name: 'mortgage_refinance_bank - English',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "bank_hapoalim", "label": "Bank Hapoalim"},
                {"value": "bank_leumi", "label": "Bank Leumi"},
                {"value": "bank_discount", "label": "Bank Discount"},
                {"value": "mizrahi_tefahot", "label": "Mizrahi Tefahot Bank"},
                {"value": "first_international", "label": "First International Bank"},
                {"value": "other", "label": "Other Bank"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'
              ) AND language_code = 'en'`
      },
      {
        name: 'mortgage_refinance_registered - Russian',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "yes", "label": "Да, зарегистрирована"},
                {"value": "no", "label": "Нет, не зарегистрирована"},
                {"value": "unknown", "label": "Не знаю"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'
              ) AND language_code = 'ru'`
      },
      {
        name: 'mortgage_refinance_registered - Hebrew',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "yes", "label": "כן, רשומה בטאבו"},
                {"value": "no", "label": "לא, לא רשומה בטאבו"},
                {"value": "unknown", "label": "לא יודע"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'
              ) AND language_code = 'he'`
      },
      {
        name: 'mortgage_refinance_registered - English',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "yes", "label": "Yes, registered in land registry"},
                {"value": "no", "label": "No, not registered"},
                {"value": "unknown", "label": "I dont know"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'
              ) AND language_code = 'en'`
      },
      {
        name: 'mortgage_refinance_type - Russian',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "fixed", "label": "Фиксированная ставка"},
                {"value": "variable", "label": "Переменная ставка"},
                {"value": "mixed", "label": "Смешанная ставка"},
                {"value": "prime", "label": "Прайм ставка"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type'
              ) AND language_code = 'ru'`
      },
      {
        name: 'mortgage_refinance_type - Hebrew',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "fixed", "label": "ריבית קבועה"},
                {"value": "variable", "label": "ריבית משתנה"},
                {"value": "mixed", "label": "ריבית מעורבת"},
                {"value": "prime", "label": "ריבית פריים"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type'
              ) AND language_code = 'he'`
      },
      {
        name: 'mortgage_refinance_type - English',
        sql: `UPDATE content_translations 
              SET content_value = '[
                {"value": "fixed", "label": "Fixed Interest Rate"},
                {"value": "variable", "label": "Variable Interest Rate"},
                {"value": "mixed", "label": "Mixed Interest Rate"},
                {"value": "prime", "label": "Prime Interest Rate"}
              ]'
              WHERE content_item_id = (
                SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type'
              ) AND language_code = 'en'`
      }
    ];
    
    for (const fix of fixes) {
      try {
        console.log(`Applying: ${fix.name}`);
        const result = await pool.query(fix.sql);
        console.log(`✅ ${fix.name} - Updated ${result.rowCount} row(s)`);
      } catch (error) {
        console.error(`❌ ${fix.name} - Error:`, error.message);
      }
    }
    
    console.log('\n🔍 Verifying fixes...\n');
    const result = await pool.query(`
      SELECT ci.content_key, ct.language_code, 
             CASE 
               WHEN ct.content_value IS NULL THEN 'NULL'
               WHEN LENGTH(ct.content_value) > 100 THEN SUBSTRING(ct.content_value, 1, 100) || '...'
               ELSE ct.content_value
             END as content_preview
      FROM content_items ci 
      JOIN content_translations ct ON ci.id = ct.content_item_id 
      WHERE ci.component_type = 'dropdown' 
      ORDER BY ci.content_key, ct.language_code
    `);
    
    console.log('📊 UPDATED DROPDOWN COMPONENTS:');
    result.rows.forEach(row => {
      const isJson = row.content_preview.startsWith('[');
      const status = isJson ? '✅' : '❌';
      console.log(`${status} ${row.content_key} (${row.language_code}): ${row.content_preview}`);
    });
    
    // Test JSON parsing
    console.log('\n🧪 JSON VALIDATION:');
    const fullResult = await pool.query(`
      SELECT ci.content_key, ct.language_code, ct.content_value
      FROM content_items ci 
      JOIN content_translations ct ON ci.id = ct.content_item_id 
      WHERE ci.component_type = 'dropdown' 
      ORDER BY ci.content_key, ct.language_code
    `);
    
    let validJson = 0;
    let invalidJson = 0;
    
    fullResult.rows.forEach(row => {
      try {
        const parsed = JSON.parse(row.content_value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ ${row.content_key} (${row.language_code}): Valid JSON with ${parsed.length} options`);
          validJson++;
        } else {
          console.log(`⚠️ ${row.content_key} (${row.language_code}): Valid JSON but empty array`);
          validJson++;
        }
      } catch (e) {
        console.log(`❌ ${row.content_key} (${row.language_code}): Invalid JSON - ${e.message}`);
        invalidJson++;
      }
    });
    
    console.log(`\n📊 SUMMARY: ${validJson} valid JSON, ${invalidJson} invalid JSON`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error applying fixes:', error);
    await pool.end();
  }
}

fixDropdownIssues();