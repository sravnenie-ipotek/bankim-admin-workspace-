#!/usr/bin/env node

/**
 * Deploy Hebrew translations for mortgage obligations to production
 * This script connects to the production local PostgreSQL database
 * and inserts the Hebrew translations for mortgage step 3 obligations
 */

const { Pool } = require('pg');
const path = require('path');

// Production database configuration
const PRODUCTION_CONFIG = {
  connectionString: 'postgresql://postgres:postgres@localhost:5432/bankim_content',
  ssl: false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
};

async function deployHebrewObligations() {
  console.log('🚀 Starting Hebrew obligations deployment to PRODUCTION');
  console.log('📍 Target: Local PostgreSQL (bankim_content) on production server');
  console.log('=====================================\n');

  const pool = new Pool(PRODUCTION_CONFIG);

  try {
    const client = await pool.connect();
    console.log('✅ Connected to production database\n');

    // 1. Create missing content items
    console.log('1️⃣ Creating content items...');
    const createItemsQuery = `
      INSERT INTO content_items 
      (content_key, component_type, category, screen_location, is_active, description, page_number)
      VALUES
        ('app.mortgage.step3.obligations.option_1', 'dropdown_option', 'form', 'mortgage_step3', true, 'No obligations option', 1),
        ('app.mortgage.step3.obligations.option_2', 'dropdown_option', 'form', 'mortgage_step3', true, 'Bank loan option', 2),
        ('app.mortgage.step3.obligations.option_3', 'dropdown_option', 'form', 'mortgage_step3', true, 'Credit card option', 3),
        ('app.mortgage.step3.obligations.option_4', 'dropdown_option', 'form', 'mortgage_step3', true, 'Private loan option', 4)
      ON CONFLICT (content_key) DO NOTHING
      RETURNING id, content_key
    `;

    const itemsResult = await client.query(createItemsQuery);
    if (itemsResult.rows.length > 0) {
      console.log(`   ✅ Created ${itemsResult.rows.length} new content items`);
      itemsResult.rows.forEach(row => {
        console.log(`      - ID: ${row.id}, Key: ${row.content_key}`);
      });
    } else {
      console.log('   ℹ️  Content items already exist');
    }

    // 2. Insert Hebrew translations
    console.log('\n2️⃣ Inserting Hebrew translations...');
    const insertTranslationsQuery = `
      INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
        ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_1'), 'he', 'אין התחייבויות', 'approved'),
        ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_2'), 'he', 'הלוואת בנק', 'approved'),
        ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_3'), 'he', 'כרטיס אשראי', 'approved'),
        ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_4'), 'he', 'הלוואה פרטית', 'approved')
      ON CONFLICT (content_item_id, language_code) 
      DO UPDATE SET 
        content_value = EXCLUDED.content_value,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `;

    const translationsResult = await client.query(insertTranslationsQuery);
    console.log(`   ✅ Hebrew translations: ${translationsResult.rowCount} inserted/updated`);

    // 3. Verify deployment
    console.log('\n3️⃣ Verifying deployment...');
    const verifyQuery = `
      SELECT 
        ci.content_key,
        ct.content_value,
        ct.status,
        ct.updated_at
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key IN (
        'app.mortgage.step3.obligations.option_1',
        'app.mortgage.step3.obligations.option_2', 
        'app.mortgage.step3.obligations.option_3',
        'app.mortgage.step3.obligations.option_4'
      ) AND ct.language_code = 'he'
      ORDER BY ci.content_key
    `;

    const verifyResult = await client.query(verifyQuery);
    console.log('   Hebrew translations in PRODUCTION database:');
    verifyResult.rows.forEach(row => {
      console.log(`     ${row.content_key}: '${row.content_value}' (${row.status})`);
    });

    client.release();
    await pool.end();

    console.log('\n🎉 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('✅ Hebrew translations for mortgage obligations are now live');
    console.log('✅ Changes should be visible on bankimonline.com');
    console.log('');
    console.log('📋 Deployed translations:');
    console.log('   - אין התחייבויות (No obligations)');
    console.log('   - הלוואת בנק (Bank loan)');
    console.log('   - כרטיס אשראי (Credit card)');
    console.log('   - הלוואה פרטית (Private loan)');

  } catch (error) {
    console.error('\n❌ PRODUCTION DEPLOYMENT FAILED:');
    console.error(`   Error: ${error.message}`);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure PostgreSQL is running on production server');
    console.error('   2. Verify database credentials: postgres:postgres@localhost:5432/bankim_content');
    console.error('   3. Check that bankim_content database exists');
    console.error('   4. Verify network connectivity to database');
    
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  deployHebrewObligations();
}

module.exports = { deployHebrewObligations };