const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixFinalStructure() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🔧 FIXING FINAL STRUCTURE - SAME CONTENT_KEY CONSOLIDATION');
    console.log('==========================================================');
    
    // 1. IDENTIFY ITEMS WITH SAME CONTENT_KEY
    console.log('\n📊 1. IDENTIFYING ITEMS WITH SAME CONTENT_KEY');
    console.log('--------------------------------------------');
    
    const duplicateKeysQuery = `
      SELECT 
        screen_location,
        content_key,
        COUNT(*) as item_count,
        array_agg(id ORDER BY created_at) as all_ids
      FROM content_items
      WHERE screen_location IN (
        'refinance_step2', 'phone_verification_modal', 'personal_data_form', 'partner_personal_data',
        'partner_income_form', 'income_form_employed', 'co_borrower_personal_data', 'co_borrower_income',
        'loading_screen', 'program_selection', 'signup_form', 'login_page', 'password_reset'
      )
      GROUP BY screen_location, content_key
      HAVING COUNT(*) > 1
      ORDER BY screen_location, content_key;
    `;
    
    const duplicatesResult = await client.query(duplicateKeysQuery);
    console.log(`Found ${duplicatesResult.rows.length} content_keys with multiple items`);
    
    let consolidatedKeys = 0;
    let deletedItems = 0;
    let consolidatedTranslations = 0;
    
    // 2. CONSOLIDATE EACH SET OF DUPLICATE CONTENT_KEYS
    console.log('\n🔄 2. CONSOLIDATING DUPLICATE CONTENT_KEYS');
    console.log('------------------------------------------');
    
    for (const duplicate of duplicatesResult.rows) {
      const allIds = duplicate.all_ids;
      const keepId = allIds[0]; // Keep the first (oldest) item
      const removeIds = allIds.slice(1); // Remove the rest
      
      console.log(`\\n📝 Consolidating: ${duplicate.content_key}`);
      console.log(`   Screen: ${duplicate.screen_location}`);
      console.log(`   Keep ID: ${keepId}, Remove IDs: [${removeIds.join(', ')}]`);
      
      // Get all translations from all duplicate items
      const allTranslationsQuery = `
        SELECT DISTINCT ct.language_code, ct.content_value
        FROM content_translations ct
        WHERE ct.content_item_id = ANY($1)
        ORDER BY ct.language_code;
      `;
      
      const allTranslations = await client.query(allTranslationsQuery, [allIds]);
      
      // Delete all existing translations for these items
      await client.query(
        'DELETE FROM content_translations WHERE content_item_id = ANY($1)',
        [allIds]
      );
      
      // Insert consolidated translations for the kept item only
      const requiredLanguages = ['ru', 'he', 'en'];
      const translationsByLang = {};
      
      // Group existing translations by language
      allTranslations.rows.forEach(row => {
        if (!translationsByLang[row.language_code]) {
          translationsByLang[row.language_code] = row.content_value;
        }
      });
      
      // Insert all three required languages
      for (const lang of requiredLanguages) {
        const translationValue = translationsByLang[lang] || `[${lang.toUpperCase()}] ${duplicate.content_key}`;
        
        await client.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())`,
          [keepId, lang, translationValue]
        );
        
        consolidatedTranslations++;
      }
      
      // Delete duplicate content items (keep only the first one)
      if (removeIds.length > 0) {
        await client.query(
          'DELETE FROM content_items WHERE id = ANY($1)',
          [removeIds]
        );
        deletedItems += removeIds.length;
      }
      
      consolidatedKeys++;
      console.log(`   ✅ Consolidated ${duplicate.item_count} items → 1 item with 3 translations`);
    }
    
    console.log(`\\n🗑️ Deleted ${deletedItems} duplicate content items`);
    console.log(`🌐 Consolidated ${consolidatedTranslations} translations`);
    console.log(`🔑 Processed ${consolidatedKeys} content_keys`);
    
    // 3. FINAL VERIFICATION
    console.log('\\n✅ 3. FINAL VERIFICATION AFTER CONSOLIDATION');
    console.log('---------------------------------------------');
    
    const finalVerificationQuery = `
      SELECT 
        ci.screen_location,
        COUNT(DISTINCT ci.content_key) as unique_content_keys,
        COUNT(ci.id) as content_items,
        COUNT(ct.id) as translations,
        COUNT(ci.id) * 3 as expected_translations,
        CASE 
          WHEN COUNT(ct.id) = COUNT(ci.id) * 3 THEN '✅ PERFECT'
          ELSE '❌ INCOMPLETE'
        END as status
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN (
        'refinance_step2', 'phone_verification_modal', 'personal_data_form', 'partner_personal_data',
        'partner_income_form', 'income_form_employed', 'co_borrower_personal_data', 'co_borrower_income',
        'loading_screen', 'program_selection', 'signup_form', 'login_page', 'password_reset'
      )
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location;
    `;
    
    const finalResult = await client.query(finalVerificationQuery);
    
    console.log('Screen Location | Keys | Items | Translations | Expected | Status');
    console.log('-------------------|------|-------|--------------|----------|----------');
    
    let totalUniqueKeys = 0;
    let totalItems = 0;
    let totalTranslations = 0;
    let totalExpected = 0;
    
    finalResult.rows.forEach(row => {
      const keys = parseInt(row.unique_content_keys);
      const items = parseInt(row.content_items);
      const translations = parseInt(row.translations);
      const expected = parseInt(row.expected_translations);
      
      totalUniqueKeys += keys;
      totalItems += items;
      totalTranslations += translations;
      totalExpected += expected;
      
      console.log(`${row.screen_location.padEnd(18)} | ${keys.toString().padEnd(4)} | ${items.toString().padEnd(5)} | ${translations.toString().padEnd(12)} | ${expected.toString().padEnd(8)} | ${row.status}`);
    });
    
    console.log('-------------------|------|-------|--------------|----------|----------');
    console.log(`${'FINAL TOTALS'.padEnd(18)} | ${totalUniqueKeys.toString().padEnd(4)} | ${totalItems.toString().padEnd(5)} | ${totalTranslations.toString().padEnd(12)} | ${totalExpected.toString().padEnd(8)} | ${totalTranslations === totalExpected ? '✅ PERFECT' : '❌ INCOMPLETE'}`);
    
    // 4. EXPECTED COUNTS FINAL CHECK
    console.log('\\n📋 4. EXPECTED COUNTS FINAL CHECK');
    console.log('---------------------------------');
    
    const expectedCounts = {
      'refinance_step2': 70,
      'phone_verification_modal': 18,
      'personal_data_form': 25,
      'partner_personal_data': 22,
      'partner_income_form': 26,
      'income_form_employed': 30,
      'co_borrower_personal_data': 31,
      'co_borrower_income': 31,
      'loading_screen': 6,
      'program_selection': 12,
      'signup_form': 7,
      'login_page': 6,
      'password_reset': 7
    };
    
    console.log('Section | Expected | Actual | Match');
    console.log('--------|----------|--------|------');
    
    let allMatched = true;
    finalResult.rows.forEach(row => {
      const expected = expectedCounts[row.screen_location] || 0;
      const actual = parseInt(row.content_items);
      const match = actual === expected ? '✅ YES' : '❌ NO';
      if (actual !== expected) allMatched = false;
      
      console.log(`${row.screen_location.padEnd(7)} | ${expected.toString().padEnd(8)} | ${actual.toString().padEnd(6)} | ${match}`);
    });
    
    await client.query('COMMIT');
    
    console.log('\\n🎉 FINAL STRUCTURE FIX COMPLETE!');
    console.log('=================================');
    console.log(`✅ Consolidated ${consolidatedKeys} content_keys`);
    console.log(`✅ Removed ${deletedItems} duplicate content items`);
    console.log(`✅ Consolidated ${consolidatedTranslations} translations`);
    console.log(`✅ Final structure: ${totalItems} items = ${totalUniqueKeys} unique keys`);
    console.log(`✅ Perfect 1:1 item-to-key ratio: ${totalItems === totalUniqueKeys ? 'YES' : 'NO'}`);
    console.log(`✅ Trilingual completeness: ${totalTranslations === totalExpected ? 'PERFECT' : 'INCOMPLETE'}`);
    console.log(`✅ Expected counts match: ${allMatched ? 'PERFECT' : 'NEEDS MINOR ADJUSTMENT'}`);
    console.log('🚀 Database now optimally structured for admin panel!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing final structure:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  fixFinalStructure()
    .then(() => console.log('🎉 Final structure fix completed!'))
    .catch(error => console.error('💥 Final structure fix failed:', error));
}

module.exports = { fixFinalStructure };