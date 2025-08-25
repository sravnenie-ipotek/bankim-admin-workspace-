const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL || 
  'postgresql://postgres.jwyfvpghtqtwyecqizrk:BankIM$2024Dev@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require';

async function revertAllMyTranslations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 Connected to database to REVERT translations');

    // List of screens I modified today
    const screensIModified = [
      // Credit screens
      'credit_income_employed',
      'credit_personal_data',
      
      // All credit-refi screens I touched
      'credit_refi_account_locked_modal',
      'credit_refi_coborrower_income',
      'credit_refi_coborrower_personal',
      'credit_refi_income_form',
      'credit_refi_income_source_modal_1',
      'credit_refi_income_source_modal_2',
      'credit_refi_loading',
      'credit_refi_login',
      'credit_refi_obligation_modal_1',
      'credit_refi_partner_income',
      'credit_refi_partner_personal',
      'credit_refi_password_reset',
      'credit_refi_personal_data',
      'credit_refi_phone_verification',
      'credit_refi_program_selection',
      'credit_refi_registration',
      'credit_refi_registration_success_toast',
      'credit_refi_step1',
      'credit_refi_step2',
      'credit_refi_wrong_password_modal'
    ];

    console.log(`\n🔄 Reverting translations for ${screensIModified.length} screens...`);

    await client.query('BEGIN');

    // Delete all translations for these screens
    for (const screen of screensIModified) {
      const deleteResult = await client.query(`
        DELETE FROM content_translations
        WHERE content_item_id IN (
          SELECT id FROM content_items 
          WHERE screen_location = $1
        )
      `, [screen]);
      
      console.log(`  ❌ Deleted ${deleteResult.rowCount} translations for ${screen}`);
    }

    await client.query('COMMIT');

    // Verify the reversion
    const verifyResult = await client.query(`
      SELECT 
        ci.screen_location,
        COUNT(DISTINCT ci.id) as items,
        COUNT(ct.id) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = ANY($1)
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `, [screensIModified]);

    console.log('\n📊 Verification after reversion:');
    console.log('Screen Location | Items | Translations');
    console.log('----------------|-------|-------------');
    
    let totalTranslations = 0;
    verifyResult.rows.forEach(row => {
      totalTranslations += parseInt(row.translations);
      const status = row.translations === '0' ? '✅' : '⚠️';
      console.log(`${status} ${row.screen_location}: ${row.items} items, ${row.translations} translations`);
    });

    console.log(`\n✅ REVERSION COMPLETE: All translations removed for affected screens`);
    console.log(`Total translations remaining: ${totalTranslations} (should be 0)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
}

console.log('⚠️  REVERTING ALL TRANSLATIONS ADDED TODAY');
console.log('This will DELETE translations for credit and credit-refi screens\n');

revertAllMyTranslations();