const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function findNames() {
  try {
    console.log('🔍 Searching for specific names in database...');
    
    const result = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ct.content_value ILIKE '%6-12 месяцев%' 
         OR ct.content_value ILIKE '%Добавить партнера%'
         OR ct.content_value ILIKE '%Дополнительные обязательства%'
         OR ct.content_value ILIKE '%Предложения по ипотеке%'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No exact matches found for the specific names');
      
      // Search for similar patterns
      const similarResult = await pool.query(`
        SELECT 
          ci.content_key,
          ci.screen_location,
          ct.language_code,
          ct.content_value
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ct.content_value ILIKE '%месяц%' 
           OR ct.content_value ILIKE '%партнер%'
           OR ct.content_value ILIKE '%обязательств%'
           OR ct.content_value ILIKE '%предложен%'
        ORDER BY ci.content_key, ct.language_code
        LIMIT 20
      `);
      
      console.log('🔍 Similar matches found:');
      similarResult.rows.forEach(row => {
        console.log(`  ${row.content_key} | ${row.screen_location} | ${row.language_code} | ${row.content_value}`);
      });
    } else {
      console.log('✅ Found exact matches:');
      result.rows.forEach(row => {
        console.log(`  ${row.content_key} | ${row.screen_location} | ${row.language_code} | ${row.content_value}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

findNames(); 