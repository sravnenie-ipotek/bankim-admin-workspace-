require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function addMissingCreditRefiTranslations() {
  try {
    console.log('🚀 Adding missing translations for credit-refi pages...');
    
    // Find all credit-refi content items that don't have translations
    const missingTranslationsQuery = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.description,
        ci.component_type
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'credit_refi_%'
        AND ci.is_active = TRUE
        AND ct.id IS NULL
      ORDER BY ci.screen_location, ci.page_number, ci.id
    `;
    
    const missingItems = await pool.query(missingTranslationsQuery);
    console.log(`🔍 Found ${missingItems.rows.length} credit-refi items without translations`);
    
    if (missingItems.rows.length === 0) {
      console.log('✅ All credit-refi items already have translations!');
      return;
    }
    
    // Group by screen_location for better organization
    const byScreenLocation = {};
    missingItems.rows.forEach(item => {
      if (!byScreenLocation[item.screen_location]) {
        byScreenLocation[item.screen_location] = [];
      }
      byScreenLocation[item.screen_location].push(item);
    });
    
    console.log('📍 Missing translations by screen location:');
    Object.keys(byScreenLocation).forEach(location => {
      console.log(`  ${location}: ${byScreenLocation[location].length} items`);
    });
    
    // Get screen location titles from navigation_mapping
    const screenTitlesQuery = `
      SELECT screen_location, confluence_title_ru, confluence_title_he, confluence_title_en
      FROM navigation_mapping
      WHERE screen_location LIKE 'credit_refi_%'
    `;
    
    const screenTitles = await pool.query(screenTitlesQuery);
    const titleMap = {};
    screenTitles.rows.forEach(row => {
      titleMap[row.screen_location] = {
        ru: row.confluence_title_ru,
        he: row.confluence_title_he,
        en: row.confluence_title_en
      };
    });
    
    console.log('🌐 Adding translations for each missing item...');
    let addedCount = 0;
    
    for (const item of missingItems.rows) {
      const screenTitle = titleMap[item.screen_location] || {
        ru: item.screen_location,
        he: item.screen_location,
        en: item.screen_location
      };
      
      // Generate meaningful translations based on content key and screen title
      const itemNumber = item.content_key.match(/item_(\d+)/)?.[1] || '1';
      const baseText = `${screenTitle.ru} - Элемент ${itemNumber}`;
      
      const translations = [
        {
          code: 'ru',
          text: baseText
        },
        {
          code: 'he',
          text: `${screenTitle.he} - פריט ${itemNumber}`
        },
        {
          code: 'en', 
          text: `${screenTitle.en} - Item ${itemNumber}`
        }
      ];
      
      // Add translations for all three languages
      for (const lang of translations) {
        await pool.query(`
          INSERT INTO content_translations (
            content_item_id,
            language_code,
            content_value,
            status,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, 'draft', NOW(), NOW())
        `, [item.id, lang.code, lang.text]);
      }
      
      addedCount++;
      
      if (addedCount % 10 === 0) {
        console.log(`  ✅ Added translations for ${addedCount} items...`);
      }
    }
    
    console.log(`\n✅ Successfully added translations for ${addedCount} credit-refi items!`);
    
    // Verify the additions
    const verificationQuery = `
      SELECT 
        ci.screen_location,
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(ct.id) as total_translations,
        COUNT(DISTINCT ct.content_item_id) as items_with_translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'credit_refi_%'
        AND ci.is_active = TRUE
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `;
    
    const verification = await pool.query(verificationQuery);
    
    console.log('\n📊 Translation coverage verification:');
    verification.rows.forEach(row => {
      const coverage = Math.round((row.items_with_translations / row.total_items) * 100);
      const status = coverage === 100 ? '✅' : '⚠️ ';
      console.log(`  ${status} ${row.screen_location}: ${row.items_with_translations}/${row.total_items} items (${coverage}%)`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error adding credit-refi translations:', error);
    await pool.end();
    process.exit(1);
  }
}

addMissingCreditRefiTranslations();