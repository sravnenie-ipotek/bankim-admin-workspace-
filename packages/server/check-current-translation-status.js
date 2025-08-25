const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL || 
  'postgresql://postgres.jwyfvpghtqtwyecqizrk:BankIM$2024Dev@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require';

async function checkTranslationStatus() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 CURRENT TRANSLATION STATUS CHECK\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Check screens that were mentioned in the issue
    const criticalScreens = [
      'credit_income_employed',
      'credit_personal_data', 
      'credit_refi_step1',
      'credit_refi_step2',
      'credit_refi_program_selection',
      'credit_refi_registration',
      'credit_refi_phone_verification',
      'credit_registration_page'
    ];

    console.log('🔍 CRITICAL SCREENS STATUS:');
    console.log('─────────────────────────────────────────────────────');
    console.log('Screen                           | Items | Translations | Status');
    console.log('─────────────────────────────────────────────────────');

    for (const screen of criticalScreens) {
      const result = await client.query(`
        SELECT 
          COUNT(DISTINCT ci.id) as items,
          COUNT(ct.id) as translations
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1 AND ci.is_active = true
      `, [screen]);

      const { items, translations } = result.rows[0];
      const expectedTranslations = items * 3; // 3 languages
      const percentage = items > 0 ? Math.round((translations / expectedTranslations) * 100) : 0;
      const status = percentage === 100 ? '✅' : percentage > 0 ? '⚠️' : '❌';
      
      console.log(`${screen.padEnd(32)} | ${String(items).padEnd(5)} | ${String(translations).padEnd(12)} | ${status} ${percentage}%`);
    }

    // Check for placeholder patterns
    console.log('\n\n📋 PLACEHOLDER DETECTION:');
    console.log('─────────────────────────────────────────────────────');
    
    const placeholderResult = await client.query(`
      SELECT 
        ci.screen_location,
        COUNT(DISTINCT ct.id) as placeholder_count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN ($1, $2, $3, $4, $5, $6, $7, $8)
        AND ci.is_active = true
        AND (
          ct.content_value LIKE '%[%]%' OR
          ct.content_value LIKE '%item!_%' ESCAPE '!' OR
          ct.content_value LIKE 'Field %' OR
          ct.content_value LIKE 'Text for %' OR
          ct.content_value LIKE 'Label for %' OR
          ct.content_value ~ '^(Item|Field|Text|Label|Value|Option|Button|Link|Title|Description)\\s*\\d*$'
        )
      GROUP BY ci.screen_location
      ORDER BY placeholder_count DESC
    `, criticalScreens);

    if (placeholderResult.rows.length > 0) {
      console.log('Screen                           | Placeholders Found');
      console.log('─────────────────────────────────────────────────────');
      placeholderResult.rows.forEach(row => {
        console.log(`${row.screen_location.padEnd(32)} | ❌ ${row.placeholder_count}`);
      });
    } else {
      console.log('✅ No placeholders detected in critical screens!');
    }

    // Sample a few actual translations
    console.log('\n\n📝 SAMPLE TRANSLATIONS (First 5 from credit_income_employed):');
    console.log('─────────────────────────────────────────────────────');
    
    const sampleResult = await client.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_income_employed'
        AND ci.is_active = true
      ORDER BY ci.id, ct.language_code
      LIMIT 15
    `);

    if (sampleResult.rows.length > 0) {
      let currentKey = '';
      sampleResult.rows.forEach(row => {
        if (row.content_key !== currentKey) {
          console.log(`\n📌 ${row.content_key}:`);
          currentKey = row.content_key;
        }
        const langDisplay = { 'ru': 'RU', 'he': 'HE', 'en': 'EN' }[row.language_code] || row.language_code;
        console.log(`   ${langDisplay}: "${row.content_value}"`);
      });
    } else {
      console.log('❌ No translations found for credit_income_employed');
    }

    // Overall statistics
    console.log('\n\n📊 OVERALL STATISTICS:');
    console.log('─────────────────────────────────────────────────────');
    
    const overallResult = await client.query(`
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT CASE WHEN ct.id IS NOT NULL THEN ci.id END) as items_with_translations,
        COUNT(ct.id) as total_translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = true
    `);

    const overall = overallResult.rows[0];
    const coveragePercentage = Math.round((overall.items_with_translations / overall.total_items) * 100);
    
    console.log(`Total Content Items: ${overall.total_items}`);
    console.log(`Items with Translations: ${overall.items_with_translations} (${coveragePercentage}%)`);
    console.log(`Total Translations: ${overall.total_translations}`);
    console.log(`Items Missing Translations: ${overall.total_items - overall.items_with_translations}`);

    // Final verdict
    console.log('\n\n🎯 VERDICT:');
    console.log('─────────────────────────────────────────────────────');
    
    if (coveragePercentage === 100) {
      console.log('✅ EXCELLENT: All items have translations!');
    } else if (coveragePercentage >= 85) {
      console.log('⚠️  GOOD: Most items have translations, some gaps remain');
    } else {
      console.log('❌ CRITICAL: Significant translation gaps exist');
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error checking translation status:', error.message);
  } finally {
    await client.end();
  }
}

checkTranslationStatus();