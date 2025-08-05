const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:yCtOqSQRkZqtWEdQMWJGUPTYIyOZnALp@monorail.proxy.rlwy.net:42693/railway';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function findMissingDropdownOptions() {
  try {
    await client.connect();
    console.log('🔍 Searching for mortgage dropdown fields without options...\n');

    // Find all field_label items in mortgage_calculation that should be dropdowns
    const dropdownFieldsResult = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      WHERE ci.screen_location = 'mortgage_calculation'
        AND ci.component_type = 'field_label'
        AND ci.is_active = TRUE
        AND ci.content_key LIKE '%.field.%'
        AND ci.content_key NOT LIKE '%_ph'
      ORDER BY ci.content_key
    `);

    console.log(`📋 Found ${dropdownFieldsResult.rows.length} potential dropdown fields:\n`);

    const missingOptions = [];

    for (const field of dropdownFieldsResult.rows) {
      // Check if this field has any options
      const optionsResult = await client.query(`
        SELECT COUNT(*) as option_count
        FROM content_items ci
        WHERE ci.screen_location = 'mortgage_calculation'
          AND ci.component_type = 'option'
          AND ci.content_key LIKE $1
          AND ci.is_active = TRUE
      `, [`${field.content_key}_option_%`]);

      const optionCount = parseInt(optionsResult.rows[0].option_count);
      
      console.log(`${optionCount > 0 ? '✅' : '❌'} ${field.content_key}`);
      console.log(`   📝 Title: ${field.title_ru || 'No Russian title'}`);
      console.log(`   🔢 Options: ${optionCount}`);
      
      if (optionCount === 0) {
        missingOptions.push({
          id: field.id,
          content_key: field.content_key,
          title_ru: field.title_ru,
          title_he: field.title_he,
          title_en: field.title_en
        });
      }
      console.log('');
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total dropdown fields: ${dropdownFieldsResult.rows.length}`);
    console.log(`   Fields with options: ${dropdownFieldsResult.rows.length - missingOptions.length}`);
    console.log(`   Fields missing options: ${missingOptions.length}\n`);

    if (missingOptions.length > 0) {
      console.log(`⚠️  DROPDOWN FIELDS MISSING OPTIONS:`);
      missingOptions.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field.content_key}`);
        console.log(`      📝 ${field.title_ru || 'No title'}`);
      });
      console.log('');
    }

    // Also check for placeholder fields without corresponding options
    console.log(`🔍 Checking placeholder fields without options...\n`);
    
    const placeholderResult = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ct_ru.content_value as placeholder_ru
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location = 'mortgage_calculation'
        AND ci.component_type = 'placeholder'
        AND ci.content_key LIKE '%_ph'
        AND ci.is_active = TRUE
      ORDER BY ci.content_key
    `);

    const placeholdersMissingOptions = [];

    for (const placeholder of placeholderResult.rows) {
      // Extract the base field name from placeholder (remove _ph suffix)
      const baseFieldKey = placeholder.content_key.replace('_ph', '');
      
      // Check if this placeholder has any options
      const optionsResult = await client.query(`
        SELECT COUNT(*) as option_count
        FROM content_items ci
        WHERE ci.screen_location = 'mortgage_calculation'
          AND ci.component_type = 'option'
          AND ci.content_key LIKE $1
          AND ci.is_active = TRUE
      `, [`${baseFieldKey}_option_%`]);

      const optionCount = parseInt(optionsResult.rows[0].option_count);
      
      console.log(`${optionCount > 0 ? '✅' : '❌'} ${placeholder.content_key}`);
      console.log(`   📝 Placeholder: ${placeholder.placeholder_ru || 'No Russian text'}`);
      console.log(`   🔢 Options: ${optionCount}`);
      
      if (optionCount === 0) {
        placeholdersMissingOptions.push({
          content_key: placeholder.content_key,
          base_field_key: baseFieldKey,
          placeholder_ru: placeholder.placeholder_ru
        });
      }
      console.log('');
    }

    if (placeholdersMissingOptions.length > 0) {
      console.log(`⚠️  PLACEHOLDER FIELDS MISSING OPTIONS:`);
      placeholdersMissingOptions.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field.content_key} (base: ${field.base_field_key})`);
        console.log(`      📝 ${field.placeholder_ru || 'No placeholder text'}`);
      });
    }

    await client.end();
    console.log('\n🏁 Analysis complete!');
    
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

findMissingDropdownOptions(); 