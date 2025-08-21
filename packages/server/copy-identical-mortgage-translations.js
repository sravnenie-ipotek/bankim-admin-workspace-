require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function copyIdenticalMortgageTranslations() {
  try {
    console.log('🔍 Analyzing identical keys between mortgage and credit sections...\n');
    
    // Find identical field names that should have same meaning
    const identicalFields = [
      // Personal data fields
      'first_name',
      'last_name',
      'email',
      'phone',
      'date_of_birth',
      'id_number',
      'marital_status',
      'address',
      'city',
      'postal_code',
      
      // Income fields
      'monthly_income',
      'employment_status',
      'employer_name',
      'years_employed',
      
      // Common UI elements
      'submit',
      'cancel',
      'next',
      'back',
      'save',
      'continue',
      'agree',
      'terms_and_conditions',
      'privacy_policy',
      
      // Validation messages
      'required_field',
      'invalid_email',
      'invalid_phone',
      'field_too_short',
      'field_too_long'
    ];
    
    // Build query to find matching content keys
    const findMatchesQuery = `
      WITH mortgage_translations AS (
        SELECT 
          ci.content_key,
          SUBSTRING(ci.content_key FROM POSITION('_' IN ci.content_key) + 1) as field_part,
          ct.language_code,
          ct.content_value
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location LIKE 'mortgage%'
          AND ci.is_active = TRUE
          AND ct.content_value != ''
      ),
      credit_items_needing_translation AS (
        SELECT 
          ci.id,
          ci.content_key,
          ci.screen_location,
          SUBSTRING(ci.content_key FROM POSITION('_' IN ci.content_key) + 1) as field_part
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location LIKE 'credit%'
          AND ci.is_active = TRUE
          AND ct.id IS NULL
      )
      SELECT 
        cint.id as content_item_id,
        cint.content_key as credit_key,
        cint.screen_location,
        mt.content_key as mortgage_key,
        mt.language_code,
        mt.content_value,
        cint.field_part
      FROM credit_items_needing_translation cint
      JOIN mortgage_translations mt ON mt.field_part = cint.field_part
      WHERE cint.field_part IN (${identicalFields.map(f => `'${f}'`).join(',')})
      ORDER BY cint.screen_location, cint.content_key, mt.language_code
    `;
    
    const matches = await pool.query(findMatchesQuery);
    
    if (matches.rows.length === 0) {
      console.log('❌ No identical field matches found between mortgage and credit sections.');
      await pool.end();
      return;
    }
    
    // Group by content_item_id for summary
    const itemsToTranslate = {};
    matches.rows.forEach(row => {
      if (!itemsToTranslate[row.content_item_id]) {
        itemsToTranslate[row.content_item_id] = {
          credit_key: row.credit_key,
          screen_location: row.screen_location,
          field_part: row.field_part,
          translations: {}
        };
      }
      itemsToTranslate[row.content_item_id].translations[row.language_code] = row.content_value;
    });
    
    console.log(`📊 Found ${Object.keys(itemsToTranslate).length} credit items with identical mortgage fields:\n`);
    
    // Show what will be copied
    Object.values(itemsToTranslate).slice(0, 10).forEach(item => {
      console.log(`  • ${item.credit_key} (${item.screen_location})`);
      console.log(`    Field: "${item.field_part}"`);
      if (item.translations.ru) console.log(`    RU: "${item.translations.ru}"`);
      if (item.translations.he) console.log(`    HE: "${item.translations.he}"`);
      if (item.translations.en) console.log(`    EN: "${item.translations.en}"`);
      console.log('');
    });
    
    if (Object.keys(itemsToTranslate).length > 10) {
      console.log(`  ... and ${Object.keys(itemsToTranslate).length - 10} more items\n`);
    }
    
    // Ask for confirmation
    console.log('📋 Summary:');
    console.log(`  • Total items to translate: ${Object.keys(itemsToTranslate).length}`);
    console.log(`  • Total translations to copy: ${matches.rows.length}`);
    console.log(`  • Only copying 100% identical field names\n`);
    
    // Insert the translations
    console.log('✍️ Copying translations...\n');
    
    const insertQuery = `
      INSERT INTO content_translations (content_item_id, language_code, content_value, status)
      VALUES ($1, $2, $3, 'draft')
      ON CONFLICT (content_item_id, language_code) DO NOTHING
    `;
    
    let insertedCount = 0;
    for (const row of matches.rows) {
      const result = await pool.query(insertQuery, [
        row.content_item_id,
        row.language_code,
        row.content_value
      ]);
      if (result.rowCount > 0) insertedCount++;
    }
    
    console.log(`✅ Successfully copied ${insertedCount} translations from mortgage to credit sections!\n`);
    
    // Verify the improvement
    const verifyQuery = `
      SELECT 
        CASE 
          WHEN ci.screen_location LIKE 'credit_refi_%' THEN 'Credit-Refi (6.1.x)'
          ELSE 'Credit (5.1.x)'
        END as section,
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT ct.content_item_id) as items_with_translations,
        ROUND(COUNT(DISTINCT ct.content_item_id)::float / COUNT(DISTINCT ci.id) * 100) as coverage_percent
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'credit%'
        AND ci.is_active = TRUE
      GROUP BY 
        CASE 
          WHEN ci.screen_location LIKE 'credit_refi_%' THEN 'Credit-Refi (6.1.x)'
          ELSE 'Credit (5.1.x)'
        END
      ORDER BY section
    `;
    
    const verification = await pool.query(verifyQuery);
    
    console.log('📈 Updated translation coverage:');
    verification.rows.forEach(row => {
      const status = row.coverage_percent === 0 ? '🔴' : row.coverage_percent < 50 ? '🟡' : '🟢';
      console.log(`  ${status} ${row.section}: ${row.items_with_translations}/${row.total_items} items (${row.coverage_percent}%)`);
    });
    
    console.log('\n✅ Identical field translation copy complete!');
    console.log('📝 Only copied 100% identical fields (first_name, email, phone, etc.)');
    console.log('⏳ Waiting for approved source text for remaining credit-specific fields.');
    
    await pool.end();
  } catch (error) {
    console.error('Error copying mortgage translations:', error);
    await pool.end();
    process.exit(1);
  }
}

copyIdenticalMortgageTranslations();