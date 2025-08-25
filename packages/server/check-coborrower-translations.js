const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;

async function checkCoborrowerTranslations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 Checking credit_refi_coborrower_income translations in Railway\n');
    
    const result = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ct.language_code,
        ct.content_value,
        ct.status
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_refi_coborrower_income'
      ORDER BY ci.content_key, ct.language_code
      LIMIT 15
    `);

    console.log('First 5 items from credit_refi_coborrower_income:\n');
    
    let currentKey = '';
    result.rows.forEach(row => {
      if (row.content_key !== currentKey) {
        console.log(`\n📌 ${row.content_key} (ID: ${row.id}):`);
        currentKey = row.content_key;
      }
      if (row.language_code && row.content_value) {
        console.log(`   ${row.language_code}: "${row.content_value}"`);
      } else {
        console.log(`   ❌ No translation`);
      }
    });

    // Check if these are placeholders
    const placeholderCheck = await client.query(`
      SELECT COUNT(*) as placeholder_count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_refi_coborrower_income'
        AND ct.content_value LIKE '%Field %'
    `);

    console.log(`\n\n⚠️  Placeholder translations found: ${placeholderCheck.rows[0].placeholder_count}`);

    // Get summary
    const summary = await client.query(`
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(ct.id) as total_translations,
        COUNT(CASE WHEN ct.content_value LIKE '%Field %' THEN 1 END) as placeholders
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_refi_coborrower_income'
    `);

    const stats = summary.rows[0];
    console.log('\n📊 Summary:');
    console.log(`   Total items: ${stats.total_items}`);
    console.log(`   Total translations: ${stats.total_translations}`);
    console.log(`   Placeholder translations: ${stats.placeholders}`);
    
    if (stats.placeholders > 0) {
      console.log('\n❌ PROBLEM: This screen has placeholder translations instead of real business content!');
      console.log('   These need to be replaced with meaningful translations like:');
      console.log('   - "Co-borrower Employment Status"');
      console.log('   - "Co-borrower Monthly Income"');
      console.log('   - "Co-borrower Employer Name"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCoborrowerTranslations();