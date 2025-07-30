const { Client } = require('pg');

async function checkCounts() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'bankim_content',
    user: 'postgres',
    password: 'your_password_here'
  });

  try {
    await client.connect();
    console.log('🔍 Checking main_page content counts...\n');

    // 1. Total content items for main_page (this is the 37 count)
    const totalResult = await client.query(`
      SELECT COUNT(*) as total_count
      FROM content_items 
      WHERE screen_location = 'main_page' 
        AND is_active = true
    `);
    console.log(`📊 Total content items (summary count): ${totalResult.rows[0].total_count}`);

    // 2. Content items with approved translations (this is what the API returns)
    const approvedResult = await client.query(`
      SELECT COUNT(*) as approved_count
      FROM content_items ci
      JOIN content_translations ct ON ct.content_item_id = ci.id
      WHERE ci.screen_location = 'main_page' 
        AND ci.is_active = true
        AND ct.status = 'approved'
    `);
    console.log(`✅ Content items with approved translations: ${approvedResult.rows[0].approved_count}`);

    // 3. Drill-down count (excluding dropdown options)
    const drillResult = await client.query(`
      SELECT COUNT(*) as drill_count
      FROM content_items ci
      JOIN content_translations ct ON ct.content_item_id = ci.id
      WHERE ci.screen_location = 'main_page' 
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ci.component_type NOT IN ('option', 'dropdown_option', 'field_option')
    `);
    console.log(`🔍 Drill-down count (excluding options): ${drillResult.rows[0].drill_count}`);

    // 4. Breakdown by component type
    const breakdownResult = await client.query(`
      SELECT 
        ci.component_type,
        COUNT(*) as count
      FROM content_items ci
      JOIN content_translations ct ON ct.content_item_id = ci.id
      WHERE ci.screen_location = 'main_page' 
        AND ci.is_active = true
        AND ct.status = 'approved'
      GROUP BY ci.component_type
      ORDER BY count DESC
    `);
    
    console.log('\n📋 Breakdown by component type:');
    breakdownResult.rows.forEach(row => {
      console.log(`  ${row.component_type}: ${row.count}`);
    });

    // 5. Show some examples of what's being excluded
    const excludedResult = await client.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ct.content_item_id = ci.id
      WHERE ci.screen_location = 'main_page' 
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ci.component_type IN ('option', 'dropdown_option', 'field_option')
      LIMIT 5
    `);
    
    console.log('\n🚫 Examples of excluded items (dropdown options):');
    excludedResult.rows.forEach(row => {
      console.log(`  ${row.content_key} (${row.component_type}): "${row.content_value}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCounts(); 