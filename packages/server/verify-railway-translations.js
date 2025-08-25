const { Client } = require('pg');
require('dotenv').config();

// Use the Railway Content Database from .env
const connectionString = process.env.CONTENT_DATABASE_URL;

async function verifyRailwayTranslations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 VERIFYING RAILWAY DATABASE TRANSLATIONS\n');
    console.log('Connected to:', connectionString.split('@')[1]?.split('/')[0] || 'database');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Check critical screens that were mentioned in the issue
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
    console.log('Screen                           | Items | Translations | Coverage');
    console.log('─────────────────────────────────────────────────────');

    let totalItems = 0;
    let totalTranslations = 0;

    for (const screen of criticalScreens) {
      const result = await client.query(`
        SELECT 
          COUNT(DISTINCT ci.id) as items,
          COUNT(ct.id) as translations
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = $1
      `, [screen]);

      const { items, translations } = result.rows[0];
      totalItems += parseInt(items);
      totalTranslations += parseInt(translations);
      
      const expectedTranslations = items * 3; // 3 languages
      const percentage = items > 0 ? Math.round((translations / expectedTranslations) * 100) : 0;
      const status = percentage === 100 ? '✅' : percentage > 0 ? '⚠️' : '❌';
      
      console.log(`${screen.padEnd(32)} | ${String(items).padEnd(5)} | ${String(translations).padEnd(12)} | ${status} ${percentage}%`);
    }

    console.log('─────────────────────────────────────────────────────');
    console.log(`TOTAL                            | ${String(totalItems).padEnd(5)} | ${String(totalTranslations).padEnd(12)} | ${Math.round((totalTranslations / (totalItems * 3)) * 100)}%`);

    // Check overall database statistics
    console.log('\n\n📊 OVERALL DATABASE STATISTICS:');
    console.log('─────────────────────────────────────────────────────');
    
    const overallResult = await client.query(`
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT CASE WHEN ct.id IS NOT NULL THEN ci.id END) as items_with_translations,
        COUNT(ct.id) as total_translations,
        COUNT(DISTINCT CASE WHEN ct.id IS NULL THEN ci.id END) as items_missing_translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
    `);

    const overall = overallResult.rows[0];
    const coveragePercentage = overall.total_items > 0 ? 
      Math.round((overall.items_with_translations / overall.total_items) * 100) : 0;
    
    console.log(`Total Content Items: ${overall.total_items}`);
    console.log(`Items with Translations: ${overall.items_with_translations} (${coveragePercentage}%)`);
    console.log(`Total Translations: ${overall.total_translations}`);
    console.log(`Items Missing Translations: ${overall.items_missing_translations}`);

    // Sample a few translations to verify quality
    console.log('\n\n📝 SAMPLE TRANSLATIONS (First 3 from credit_income_employed):');
    console.log('─────────────────────────────────────────────────────');
    
    const sampleResult = await client.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.content_value,
        ct.status
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_income_employed'
      ORDER BY ci.id, ct.language_code
      LIMIT 9
    `);

    if (sampleResult.rows.length > 0) {
      let currentKey = '';
      sampleResult.rows.forEach(row => {
        if (row.content_key !== currentKey) {
          console.log(`\n📌 ${row.content_key}:`);
          currentKey = row.content_key;
        }
        const langDisplay = { 'ru': 'RU', 'he': 'HE', 'en': 'EN' }[row.language_code] || row.language_code;
        const statusIcon = row.status === 'approved' ? '✅' : '⚠️';
        console.log(`   ${langDisplay}: "${row.content_value.substring(0, 50)}${row.content_value.length > 50 ? '...' : ''}" ${statusIcon}`);
      });
    } else {
      console.log('❌ No translations found for credit_income_employed');
    }

    // Final verdict
    console.log('\n\n🎯 VERDICT:');
    console.log('─────────────────────────────────────────────────────');
    
    if (overall.items_missing_translations === 0) {
      console.log('✅ EXCELLENT: All items have translations!');
      console.log('✅ The fix has been successfully applied to Railway database');
    } else if (coveragePercentage >= 95) {
      console.log('⚠️ VERY GOOD: Most items have translations, minor gaps remain');
    } else if (coveragePercentage >= 85) {
      console.log('⚠️ GOOD: Most items have translations, some gaps remain');
    } else {
      console.log('❌ CRITICAL: Significant translation gaps exist');
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

    return {
      success: overall.items_missing_translations === 0,
      coverage: coveragePercentage,
      missingCount: overall.items_missing_translations
    };

  } catch (error) {
    console.error('❌ Error verifying Railway translations:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

verifyRailwayTranslations()
  .then(result => {
    if (result.success) {
      console.log('✅ Railway Database Verification: PASSED');
    } else {
      console.log('❌ Railway Database Verification: FAILED');
      if (result.error) {
        console.log('Error:', result.error);
      } else {
        console.log(`Missing translations: ${result.missingCount}`);
      }
    }
  });