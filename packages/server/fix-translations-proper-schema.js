const { Client } = require('pg');
require('dotenv').config();

// FOLLOWING MASTER_TRANSLATION_SYSTEM.md EXACTLY
const connectionString = process.env.CONTENT_DATABASE_URL || 
  'postgresql://postgres.jwyfvpghtqtwyecqizrk:BankIM$2024Dev@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require';

async function fixTranslationsProperSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 Connected to Content Database (per MASTER_TRANSLATION_SYSTEM.md)');

    // Check what translations are missing field_name and status
    const checkResult = await client.query(`
      SELECT COUNT(*) as missing_field_name
      FROM content_translations
      WHERE field_name IS NULL OR field_name = ''
    `);

    const statusResult = await client.query(`
      SELECT COUNT(*) as not_approved
      FROM content_translations
      WHERE status IS NULL OR status != 'approved'
    `);

    console.log(`⚠️  Found ${checkResult.rows[0].missing_field_name} translations missing field_name`);
    console.log(`⚠️  Found ${statusResult.rows[0].not_approved} translations not approved`);

    // Fix all translations to comply with MASTER_TRANSLATION_SYSTEM.md
    await client.query('BEGIN');

    // Update field_name for all translations (per documentation line 150)
    const updateFieldName = await client.query(`
      UPDATE content_translations
      SET field_name = 'text'
      WHERE field_name IS NULL OR field_name = ''
    `);
    console.log(`✅ Updated ${updateFieldName.rowCount} translations with field_name='text'`);

    // Update status to 'approved' for all active translations (per documentation line 153)
    const updateStatus = await client.query(`
      UPDATE content_translations
      SET status = 'approved'
      WHERE status IS NULL OR status = ''
    `);
    console.log(`✅ Updated ${updateStatus.rowCount} translations with status='approved'`);

    await client.query('COMMIT');

    // Verify compliance with MASTER_TRANSLATION_SYSTEM.md
    const verifyResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN field_name = 'text' THEN 1 END) as has_field_name,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as is_approved
      FROM content_translations
    `);

    const row = verifyResult.rows[0];
    console.log('\n📋 MASTER_TRANSLATION_SYSTEM.md Compliance Check:');
    console.log(`Total translations: ${row.total}`);
    console.log(`With field_name='text': ${row.has_field_name} (${(row.has_field_name/row.total*100).toFixed(1)}%)`);
    console.log(`With status='approved': ${row.is_approved} (${(row.is_approved/row.total*100).toFixed(1)}%)`);

    if (row.has_field_name === row.total && row.is_approved === row.total) {
      console.log('\n✅ ALL TRANSLATIONS NOW COMPLY WITH MASTER_TRANSLATION_SYSTEM.md!');
    } else {
      console.log('\n⚠️  Some translations still need fixing');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
}

// Add proper documentation reference
console.log('🔍 Following MASTER_TRANSLATION_SYSTEM.md requirements:');
console.log('  - Line 150: field_name VARCHAR(100) NOT NULL');
console.log('  - Line 153: status VARCHAR(50) DEFAULT \'approved\'');
console.log('  - Lines 746-759: Proper database insertion pattern\n');

fixTranslationsProperSchema();