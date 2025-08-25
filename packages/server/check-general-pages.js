const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;

async function checkGeneralPages() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 Checking for general_pages content in Railway database\n');
    
    // Check if any content exists with screen_location = 'general_pages'
    const result = await client.query(`
      SELECT 
        COUNT(*) as count,
        array_agg(DISTINCT screen_location) as locations
      FROM content_items
      WHERE screen_location LIKE '%general%'
    `);

    console.log('Content with "general" in screen_location:');
    console.log(`  Count: ${result.rows[0].count}`);
    console.log(`  Locations: ${result.rows[0].locations || 'None'}`);

    // Check what screen_locations exist
    const allScreens = await client.query(`
      SELECT DISTINCT screen_location, COUNT(*) as item_count
      FROM content_items
      WHERE screen_location NOT LIKE '%mortgage%' 
        AND screen_location NOT LIKE '%credit%'
        AND screen_location NOT LIKE '%menu%'
      GROUP BY screen_location
      ORDER BY item_count DESC
      LIMIT 20
    `);

    console.log('\nOther screen_locations (non-mortgage/credit/menu):');
    allScreens.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.item_count} items`);
    });

    // Check if there's any general content that should be shown
    const generalContent = await client.query(`
      SELECT id, content_key, screen_location, component_type
      FROM content_items
      WHERE screen_location IN ('general_pages', 'general', 'common_pages', 'shared_pages')
      LIMIT 10
    `);

    if (generalContent.rows.length > 0) {
      console.log('\nFound general content:');
      generalContent.rows.forEach(row => {
        console.log(`  ${row.content_key} (${row.screen_location})`);
      });
    } else {
      console.log('\n⚠️  No content found with general_pages, general, common_pages, or shared_pages screen_location');
      console.log('   The ContentGeneral component expects content with screen_location = "general_pages"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkGeneralPages();