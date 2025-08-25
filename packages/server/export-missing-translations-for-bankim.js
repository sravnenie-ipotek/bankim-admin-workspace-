const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL || 
  'postgresql://postgres.jwyfvpghtqtwyecqizrk:BankIM$2024Dev@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require';

async function exportMissingTranslations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 Exporting missing translations for BankIM team...');

    // Get all content items without translations
    const missingResult = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ci.category,
        ci.page_number,
        COUNT(ct.id) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN (
        'credit_income_employed', 'credit_personal_data',
        'credit_refi_account_locked_modal', 'credit_refi_coborrower_income',
        'credit_refi_coborrower_personal', 'credit_refi_income_form',
        'credit_refi_income_source_modal_1', 'credit_refi_income_source_modal_2',
        'credit_refi_loading', 'credit_refi_login',
        'credit_refi_obligation_modal_1', 'credit_refi_partner_income',
        'credit_refi_partner_personal', 'credit_refi_password_reset',
        'credit_refi_personal_data', 'credit_refi_phone_verification',
        'credit_refi_program_selection', 'credit_refi_registration',
        'credit_refi_registration_success_toast', 'credit_refi_step1',
        'credit_refi_step2', 'credit_refi_wrong_password_modal'
      )
      AND ci.is_active = true
      GROUP BY ci.id, ci.content_key, ci.screen_location, ci.component_type, ci.category, ci.page_number
      HAVING COUNT(ct.id) = 0
      ORDER BY ci.screen_location, ci.id
    `);

    console.log(`Found ${missingResult.rows.length} items needing translations`);

    // Create CSV export
    const csvHeader = 'id,screen_location,content_key,component_type,russian_text,hebrew_text,english_text\n';
    let csvContent = csvHeader;

    // Group by screen for better organization
    const screenGroups = {};
    missingResult.rows.forEach(row => {
      if (!screenGroups[row.screen_location]) {
        screenGroups[row.screen_location] = [];
      }
      screenGroups[row.screen_location].push(row);
    });

    // Process each screen
    Object.keys(screenGroups).sort().forEach(screen => {
      const items = screenGroups[screen];
      items.forEach(item => {
        csvContent += `${item.id},"${item.screen_location}","${item.content_key}","${item.component_type}","","",""\n`;
      });
    });

    // Save CSV file
    const filename = `bankim_missing_translations_${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, csvContent);
    console.log(`✅ Exported to ${filename}`);

    // Create JSON export with suggested translations structure
    const jsonExport = {
      export_date: new Date().toISOString(),
      total_items: missingResult.rows.length,
      instructions: "Please fill in the translations for each item in Russian, Hebrew, and English",
      screens: {}
    };

    Object.keys(screenGroups).sort().forEach(screen => {
      jsonExport.screens[screen] = {
        item_count: screenGroups[screen].length,
        items: screenGroups[screen].map(item => ({
          id: item.id,
          content_key: item.content_key,
          component_type: item.component_type,
          translations_needed: {
            ru: "", // Russian translation needed
            he: "", // Hebrew translation needed
            en: ""  // English translation needed
          }
        }))
      };
    });

    // Save JSON file
    const jsonFilename = `bankim_missing_translations_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(jsonFilename, JSON.stringify(jsonExport, null, 2));
    console.log(`✅ Exported to ${jsonFilename}`);

    // Print summary
    console.log('\n📊 Summary by Screen:');
    console.log('Screen | Items Needing Translation');
    console.log('-------|------------------------');
    Object.keys(screenGroups).sort().forEach(screen => {
      console.log(`${screen}: ${screenGroups[screen].length} items`);
    });

    console.log('\n📋 Files created for BankIM team:');
    console.log(`1. ${filename} - CSV format for Excel`);
    console.log(`2. ${jsonFilename} - JSON format for developers`);
    console.log('3. /docs/TASK_FOR_BANKIM_TEAM_TRANSLATIONS.md - Full documentation');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

exportMissingTranslations();